import { createContext, useState, useEffect, useContext } from 'react';
import initialMenuData from '../data/menu.json';

const INITIAL_CATEGORIES = [
    { id: 'entrantes', name: 'Entrantes', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=800&auto=format&fit=crop', isVisible: true },
    { id: 'arroces', name: 'Arroces', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop', isVisible: true },
    { id: 'pescados', name: 'Pescados', image: 'https://plus.unsplash.com/premium_photo-1699216538333-182ae3edcd7e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isVisible: true },
    { id: 'carnes', name: 'Carnes', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop', isVisible: true },
    { id: 'fuera_de_carta', name: 'Fuera de Carta', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop', isVisible: true }
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
        const newCategory = { id, name, image, isVisible: true };
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

    const toggleCategoryVisibility = (id) => {
        setCategories(prev => prev.map(cat =>
            cat.id === id ? { ...cat, isVisible: !cat.isVisible } : cat
        ));
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
