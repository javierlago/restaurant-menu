import { createContext, useState, useEffect, useContext } from 'react';
import initialMenuData from '../data/menu.json';

const INITIAL_CATEGORIES = [
    { id: 'entrantes', name: 'Entrantes', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=800&auto=format&fit=crop' },
    { id: 'arroces', name: 'Arroces', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop' },
    { id: 'pescados', name: 'Pescados', image: 'https://images.unsplash.com/photo-1519708227418-81988761aa1a?q=80&w=800&auto=format&fit=crop' },
    { id: 'carnes', name: 'Carnes', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop' },
    { id: 'fuera_de_carta', name: 'Fuera de Carta', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop' }
];

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load Categories and Menu Items
    useEffect(() => {
        const savedMenu = localStorage.getItem('restaurant_menu_data');
        const savedCategories = localStorage.getItem('restaurant_categories_data');

        setMenuItems(savedMenu ? JSON.parse(savedMenu) : initialMenuData);
        setCategories(savedCategories ? JSON.parse(savedCategories) : INITIAL_CATEGORIES);

        setLoading(false);
    }, []);

    // Save changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('restaurant_menu_data', JSON.stringify(menuItems));
            localStorage.setItem('restaurant_categories_data', JSON.stringify(categories));
        }
    }, [menuItems, categories, loading]);

    const toggleVisibility = (id) => {
        setMenuItems(prev => prev.map(item =>
            item.id === id ? { ...item, isVisible: !item.isVisible } : item
        ));
    };

    const updateDish = (id, updatedFields) => {
        setMenuItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updatedFields } : item
        ));
    };

    const addDish = (newDish) => {
        const dishWithId = { ...newDish, id: Date.now().toString(), isVisible: true };
        setMenuItems(prev => [...prev, dishWithId]);
    };

    const deleteDish = (id) => {
        setMenuItems(prev => prev.filter(item => item.id !== id));
    };

    // Category Actions
    const addCategory = (name, image) => {
        const id = name.toLowerCase().replace(/\s+/g, '_');
        const newCategory = { id, name, image };
        setCategories(prev => [...prev, newCategory]);
    };

    const updateCategory = (id, updatedFields) => {
        setCategories(prev => prev.map(cat =>
            cat.id === id ? { ...cat, ...updatedFields } : cat
        ));
    };

    const deleteCategory = (id) => {
        setCategories(prev => prev.filter(c => c.id !== id));
        // Optional: Hide/Remove items in this category? 
        // For now, keeps items but they won't be reachable via category list.
    };

    return (
        <MenuContext.Provider value={{
            menuItems, categories, loading,
            toggleVisibility, updateDish, addDish, deleteDish,
            addCategory, updateCategory, deleteCategory
        }}>
            {children}
        </MenuContext.Provider>
    );
};
