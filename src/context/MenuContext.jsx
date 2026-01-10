import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase/client';

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: dishesData, error: dishesError } = await supabase
                .from('dishes')
                .select('*')
                .order('name');

            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (dishesError) throw dishesError;
            if (categoriesError) throw categoriesError;

            // Normalize data if needed (e.g. Supabase columns vs Frontend keys)
            // Assuming Supabase columns match frontend keys: id, name, price, category, etc.
            setMenuItems(dishesData || []);
            setCategories(categoriesData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback empty or alert? For now just log.
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Optional: Realtime subscription could be added here
        const dishesSubscription = supabase
            .channel('public:dishes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, fetchData)
            .subscribe();

        const categoriesSubscription = supabase
            .channel('public:categories')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(dishesSubscription);
            supabase.removeChannel(categoriesSubscription);
        };
    }, []);

    const toggleVisibility = async (id) => {
        const item = menuItems.find(i => i.id === id);
        if (!item) return;

        const { error } = await supabase
            .from('dishes')
            .update({ isVisible: !item.isVisible })
            .eq('id', id);

        if (error) {
            console.error('Error toggling visibility:', error);
            alert('Error al actualizar la visibilidad');
        } else {
            // Optimistic update or wait for subscription
            fetchData();
        }
    };

    const uploadImage = async (file, path, bucket = 'dish-images') => {
        // Sanitize path/filename to avoid "Invalid key" errors with special chars
        const sanitizedPath = path.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\/._-]/g, "");

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(sanitizedPath, file, { upsert: true });

        if (error) {
            console.error('Error uploading image:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(sanitizedPath);

        return publicUrl;
    };

    const updateDish = async (id, updatedFields, imageFile) => {
        let imageUrl = updatedFields.image;

        if (imageFile) {
            try {
                // Upload to folder with ID: dish-images/{id}/{filename}
                // We trust uploadImage to sanitize the final path, but we construct the base here
                const path = `${id}/${imageFile.name}`;
                imageUrl = await uploadImage(imageFile, path, 'dish-images');
            } catch (error) {
                alert('Error al subir la imagen. El plato se actualizará sin la nueva imagen.');
            }
        }

        const { error } = await supabase
            .from('dishes')
            .update({ ...updatedFields, image: imageUrl })
            .eq('id', id);

        if (error) {
            console.error('Error updating dish:', error);
            alert('Error al actualizar el plato: ' + error.message);
        } else {
            fetchData();
        }
    };

    const addDish = async (newDish, imageFile) => {
        // 1. Insert dish first to get the ID (if DB generates it)
        // However, user requested creating folder with ID. 
        // If 'id' is auto-generated INT/BIGINT, we don't have it yet.
        // We can upload AFTER insert if we need the real ID, or generate a UUID/Timestamp client-side for the folder.
        // Given the prompt: "creates a record... and with the id of the created record... creates a folder"
        // So we must Insert -> Get ID -> Upload -> Update with Image URL.

        const { id: ignoredId, ...dishData } = newDish;

        // Insert without image first (or with placeholder if required)
        const { data, error } = await supabase
            .from('dishes')
            .insert([{ ...dishData, isVisible: true }])
            .select()
            .single();

        if (error) {
            console.error('Error adding dish:', error);
            alert('Error al añadir el plato: ' + error.message);
            return;
        }

        const createdDish = data;

        if (imageFile) {
            try {
                const path = `${createdDish.id}/${imageFile.name}`;
                const imageUrl = await uploadImage(imageFile, path, 'dish-images');

                // Update the dish with the image URL
                await supabase
                    .from('dishes')
                    .update({ image: imageUrl })
                    .eq('id', createdDish.id);

            } catch (uploadError) {
                alert('Plato creado, pero falló la subida de imagen: ' + uploadError.message);
            }
        }

        fetchData();
    };

    const deleteDish = async (id) => {
        const { error } = await supabase
            .from('dishes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting dish:', error);
            alert('Error al eliminar el plato');
        } else {
            fetchData();
        }
    };

    // Category Actions
    const addCategory = async (name, imageFile) => {
        // Generate slug from name
        const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Optimistically insert category first (let DB generate ID)
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name, slug, image: '', isVisible: true }])
            .select()
            .single();

        if (error) {
            console.error('Error adding category:', error);
            alert('Error al añadir categoría: ' + error.message);
            return;
        }

        const newCategory = data;

        // Upload Image if present
        if (imageFile) {
            try {
                // Use a sanitized folder name based on the category name or ID
                const folderName = name.toLowerCase().replace(/\s+/g, '_');
                const path = `${folderName}/${imageFile.name}`;
                const imageUrl = await uploadImage(imageFile, path, 'categories-images');

                // Update with image URL
                await supabase
                    .from('categories')
                    .update({ image: imageUrl })
                    .eq('id', newCategory.id);

            } catch (uploadError) {
                alert('Categoría creada, pero falló la subida de imagen: ' + uploadError.message);
            }
        }

        fetchData();
    };

    const updateCategory = async (id, updatedFields, imageFile) => {
        let imageUrl = updatedFields.image;

        if (imageFile) {
            try {
                const path = `${id}/${imageFile.name}`;
                imageUrl = await uploadImage(imageFile, path, 'categories-images');
            } catch (error) {
                alert('Error al subir imagen de categoría.');
            }
        }

        const { error } = await supabase
            .from('categories')
            .update({ ...updatedFields, image: imageUrl })
            .eq('id', id);

        if (error) {
            console.error('Error updating category:', error);
            alert('Error al actualizar categoría');
        } else {
            fetchData();
        }
    };

    const deleteCategory = async (id) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting category:', error);
            alert('Error al eliminar categoría');
        } else {
            fetchData();
        }
    };

    const toggleCategoryVisibility = async (id) => {
        const cat = categories.find(c => c.id === id);
        if (!cat) return;

        const { error } = await supabase
            .from('categories')
            .update({ isVisible: !cat.isVisible })
            .eq('id', id);

        if (error) {
            console.error('Error toggling category visibility:', error);
        } else {
            fetchData();
        }
    };

    return (
        <MenuContext.Provider value={{
            menuItems, categories, loading,
            toggleVisibility, updateDish, addDish, deleteDish,
            addCategory, updateCategory, deleteCategory, toggleCategoryVisibility
        }}>
            {children}
        </MenuContext.Provider>
    );
};
