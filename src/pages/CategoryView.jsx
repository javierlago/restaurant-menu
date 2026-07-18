import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import DishCard from '../components/DishCard';
import { useMenu } from '../context/MenuContext';
import { useLocale } from '../context/LocaleContext';
import { localizedField } from '../utils/localize';
import styles from './CategoryView.module.css';

const CategoryView = () => {
    const { id } = useParams();
    const { menuItems, categories, loading } = useMenu();
    const { locale, t } = useLocale();

    if (loading) return <div className={styles.container}>{t('category.loading')}</div>;

    const categoryObj = categories.find(c => String(c.id) === String(id));

    if (!categoryObj || categoryObj.isVisible === false) {
        return <div className={styles.container}>{t('category.notAvailable')}</div>;
    }

    // Filter categories to find subcategories of the current one
    const subcategories = categories.filter(cat => String(cat.parent_id) === String(id) && cat.isVisible !== false);

    // Filter dishes by category and visibility
    const dishes = menuItems.filter(dish => String(dish.category_id) === String(id) && dish.isVisible);
    const title = localizedField(categoryObj, 'name', locale);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link to={categoryObj?.parent_id ? `/category/${categoryObj.parent_id}` : "/"} className={styles.backButton}>
                    <FaArrowLeft /> {t('category.back')}
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
                                        alt={localizedField(sub, 'name', locale)}
                                        className={styles.subcategoryImage}
                                        style={{ objectPosition: sub.image_position || 'center' }}
                                    />
                                ) : (
                                    <div className={styles.subcategoryIconPlaceholder}>
                                        <div style={{ padding: '20px', opacity: 0.5 }}>{t('category.subcategoryPlaceholder')}</div>
                                    </div>
                                )}
                                <div className={styles.subcategoryOverlay} />
                            </div>
                            <div className={styles.subcategoryContent}>
                                <h2 className={styles.subcategoryName}>{localizedField(sub, 'name', locale)}</h2>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Dishes Grid */}
            {dishes.length === 0 && subcategories.length === 0 ? (
                <p className={styles.empty}>{t('category.empty')}</p>
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
