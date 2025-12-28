import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import DishCard from '../components/DishCard';
import { useMenu } from '../context/MenuContext';
import styles from './CategoryView.module.css';

const CategoryView = () => {
    const { id } = useParams();
    const { menuItems, loading } = useMenu();

    if (loading) return <div className={styles.container}>Cargando...</div>;

    // Filter dishes by category and visibility
    const dishes = menuItems.filter(dish => dish.category === id && dish.isVisible);

    // Format category title
    const title = id ? id.replace(/_/g, ' ').toUpperCase() : '';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link to="/" className={styles.backButton}>
                    <FaArrowLeft /> Volver
                </Link>
                <h1 className={styles.title}>{title}</h1>
            </div>

            {dishes.length === 0 ? (
                <p className={styles.empty}>No hay platos disponibles en esta categoría.</p>
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
