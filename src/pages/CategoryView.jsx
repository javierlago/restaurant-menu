import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import DishCard from '../components/DishCard';
import { useMenu } from '../context/MenuContext';
import styles from './CategoryView.module.css';

const CategoryView = () => {
    const { id } = useParams();
    const { menuItems, categories, loading } = useMenu();

    if (loading) return <div className={styles.container}>Cargando...</div>;

    // Filter categories to find subcategories of the current one
    const subcategories = categories.filter(cat => String(cat.parent_id) === String(id) && cat.isVisible !== false);

    // Filter dishes by category and visibility
    const dishes = menuItems.filter(dish => String(dish.category_id) === String(id) && dish.isVisible);

    // Find category to get real name
    const categoryObj = categories.find(c => String(c.id) === String(id));
    const title = categoryObj ? categoryObj.name : (id ? id.replace(/_/g, ' ').toUpperCase() : '');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link to={categoryObj?.parent_id ? `/category/${categoryObj.parent_id}` : "/"} className={styles.backButton}>
                    <FaArrowLeft /> Volver
                </Link>
                <h1 className={styles.title}>{title}</h1>
            </div>

            {/* Subcategories Grid */}
            {subcategories.length > 0 && (
                <div className={styles.subcategoryGrid}>
                    {subcategories.map((sub) => (
                        <Link to={`/category/${sub.id}`} key={sub.id} className={styles.subcategoryCard}>
                            <div className={styles.subcategoryImageContainer}>
                                {sub.image ? (
                                    <img
                                        src={sub.image}
                                        alt={sub.name}
                                        className={styles.subcategoryImage}
                                        style={{ objectPosition: sub.image_position || 'center' }}
                                    />
                                ) : (
                                    <div className={styles.subcategoryIconPlaceholder}>
                                        <div style={{ padding: '20px', opacity: 0.5 }}>Categoría</div>
                                    </div>
                                )}
                                <div className={styles.subcategoryOverlay} />
                            </div>
                            <div className={styles.subcategoryContent}>
                                <h2 className={styles.subcategoryName}>{sub.name}</h2>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Dishes Grid */}
            {dishes.length === 0 && subcategories.length === 0 ? (
                <p className={styles.empty}>No hay platos ni subcategorías disponibles.</p>
            ) : (
                <div className={styles.grid}>
                    {dishes.map(dish => (
                        <DishCard key={dish.id} dish={dish} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryView;
