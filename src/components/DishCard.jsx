import styles from './DishCard.module.css';
import ImagePlaceholder from './ImagePlaceholder';
import { useLocale } from '../context/LocaleContext';
import { localizedField } from '../utils/localize';

const DishCard = ({ dish }) => {
    const { locale, tAllergen } = useLocale();
    const name = localizedField(dish, 'name', locale);
    const description = localizedField(dish, 'description', locale);
    const portionSize = localizedField(dish, 'portionSize', locale);

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {dish.image ? (
                    <img
                        src={dish.image}
                        alt={name}
                        className={styles.image}
                        loading="lazy"
                        style={{ objectPosition: dish.image_position || 'center' }}
                    />
                ) : (
                    <ImagePlaceholder type="dish" className={styles.image} />
                )}
                <span className={styles.price}>
                    {typeof dish.price === 'number' ? dish.price.toFixed(2) : parseFloat(dish.price || 0).toFixed(2)}€
                </span>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{name}</h3>
                </div>

                <p className={styles.description}>{description}</p>

                <div className={styles.footer}>
                    <div className={styles.details}>
                        <span className={styles.portion}>{portionSize}</span>
                    </div>

                    {dish.allergens && dish.allergens.length > 0 && (
                        <div className={styles.allergens}>
                            {dish.allergens.map((allergen) => (
                                <span key={allergen} className={styles.allergenTag}>
                                    {tAllergen(allergen)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DishCard;
