import { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { FaEye, FaEyeSlash, FaTrash, FaPlus, FaEdit, FaTimes } from 'react-icons/fa';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const { menuItems, categories, toggleVisibility, updateDish, addDish, deleteDish, addCategory, updateCategory, deleteCategory } = useMenu();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [viewMode, setViewMode] = useState('dishes'); // 'dishes' | 'categories'

    // Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingDishId, setEditingDishId] = useState(null);
    const [dishForm, setDishForm] = useState({
        name: '', category: 'entrantes', price: '', description: '', allergens: '', portionSize: '', image: ''
    });

    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') setIsAuthenticated(true);
        else alert('Contraseña incorrecta');
    };

    // Dish Actions
    const handleEditClick = (dish) => {
        setDishForm({
            name: dish.name,
            category: dish.category,
            price: dish.price,
            description: dish.description,
            allergens: dish.allergens.join(', '),
            portionSize: dish.portionSize,
            image: dish.image
        });
        setEditingDishId(dish.id);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveDish = (e) => {
        e.preventDefault();
        const formattedDish = {
            ...dishForm,
            price: parseFloat(dishForm.price),
            allergens: dishForm.allergens.split(',').map(s => s.trim()).filter(Boolean)
        };

        if (editingDishId) {
            updateDish(editingDishId, formattedDish);
            alert('Plato actualizado');
        } else {
            addDish(formattedDish);
            alert('Plato añadido');
        }
        resetForm();
    };

    const resetForm = () => {
        setDishForm({ name: '', category: categories[0]?.id || '', price: '', description: '', allergens: '', portionSize: '', image: '' });
        setEditingDishId(null);
        setIsFormVisible(false);
    };

    // Category Actions
    const handleEditCategoryClick = (cat) => {
        setCategoryForm({ name: cat.name, image: cat.image });
        setEditingCategoryId(cat.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveCategory = (e) => {
        e.preventDefault();
        if (!categoryForm.name) return;

        if (editingCategoryId) {
            updateCategory(editingCategoryId, categoryForm);
            alert('Categoría actualizada');
            setEditingCategoryId(null);
        } else {
            addCategory(categoryForm.name, categoryForm.image);
            alert('Categoría añadida');
        }
        setCategoryForm({ name: '', image: '' });
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <h2>Acceso Propietario</h2>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className={styles.input} />
                    <button type="submit" className={styles.button}>Entrar</button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Panel de Administración</h1>
                <div className={styles.controls}>
                    <button className={`${styles.tab} ${viewMode === 'dishes' ? styles.activeTab : ''}`} onClick={() => setViewMode('dishes')}>Platos</button>
                    <button className={`${styles.tab} ${viewMode === 'categories' ? styles.activeTab : ''}`} onClick={() => setViewMode('categories')}>Categorías</button>
                </div>
            </div>

            {viewMode === 'dishes' && (
                <>
                    <button className={styles.addButton} onClick={() => { resetForm(); setIsFormVisible(!isFormVisible); }}>
                        {isFormVisible ? <><FaTimes /> Cerrar</> : <><FaPlus /> Añadir Plato</>}
                    </button>

                    {isFormVisible && (
                        <form onSubmit={handleSaveDish} className={styles.formPanel}>
                            <h3>{editingDishId ? 'Editar Plato' : 'Nuevo Plato'}</h3>
                            <div className={styles.formGrid}>
                                <input placeholder="Nombre" value={dishForm.name} onChange={e => setDishForm({ ...dishForm, name: e.target.value })} className={styles.input} required />
                                <select value={dishForm.category} onChange={e => setDishForm({ ...dishForm, category: e.target.value })} className={styles.select}>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                <input type="number" step="0.01" placeholder="Precio" value={dishForm.price} onChange={e => setDishForm({ ...dishForm, price: e.target.value })} className={styles.input} required />
                                <input placeholder="Porción" value={dishForm.portionSize} onChange={e => setDishForm({ ...dishForm, portionSize: e.target.value })} className={styles.input} />
                                <input placeholder="URL Imagen" value={dishForm.image} onChange={e => setDishForm({ ...dishForm, image: e.target.value })} className={styles.input} />
                                <input placeholder="Alérgenos (coma)" value={dishForm.allergens} onChange={e => setDishForm({ ...dishForm, allergens: e.target.value })} className={styles.input} />
                                <textarea placeholder="Descripción" value={dishForm.description} onChange={e => setDishForm({ ...dishForm, description: e.target.value })} className={`${styles.input} ${styles.textarea}`} />
                            </div>
                            <button type="submit" className={styles.submitBtn}>{editingDishId ? 'Actualizar' : 'Guardar'}</button>
                        </form>
                    )}

                    <div className={styles.list}>
                        {menuItems.map(item => (
                            <div key={item.id} className={`${styles.row} ${!item.isVisible ? styles.hiddenRow : ''}`}>
                                <div className={styles.rowInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCategory}>{categories.find(c => c.id === item.category)?.name || item.category}</span>
                                </div>
                                <div className={styles.rowActions}>
                                    <span className={styles.priceTag}>{item.price}€</span>
                                    <button onClick={() => handleEditClick(item)} className={styles.btnEdit} title="Editar"><FaEdit /></button>
                                    <button onClick={() => toggleVisibility(item.id)} className={styles.btnIcon} title="Ocultar">{item.isVisible ? <FaEye /> : <FaEyeSlash />}</button>
                                    <button onClick={() => deleteDish(item.id)} className={styles.btnDelete} title="Eliminar"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {viewMode === 'categories' && (
                <div className={styles.categoryPanel}>
                    <form onSubmit={handleSaveCategory} className={styles.miniForm}>
                        <input placeholder="Nombre Categoría" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className={styles.input} />
                        <input placeholder="URL Imagen Fondo" value={categoryForm.image} onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })} className={styles.input} />
                        <button type="submit" className={styles.addButton}>
                            {editingCategoryId ? 'Actualizar' : <><FaPlus /> Añadir</>}
                        </button>
                    </form>
                    <div className={styles.list}>
                        {categories.map(cat => (
                            <div key={cat.id} className={styles.row}>
                                <span className={styles.itemName}>{cat.name}</span>
                                <div className={styles.rowActions}>
                                    <button onClick={() => handleEditCategoryClick(cat)} className={styles.btnEdit}><FaEdit /></button>
                                    <button onClick={() => deleteCategory(cat.id)} className={styles.btnDelete}><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
