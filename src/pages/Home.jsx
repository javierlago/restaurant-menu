import ImagePlaceholder from '../components/ImagePlaceholder';
import { Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import { useConfig } from '../context/ConfigContext';
import { useLocale } from '../context/LocaleContext';
import { localizedField } from '../utils/localize';
import styles from './Home.module.css';

const Home = () => {
    const { categories } = useMenu();
    const { config } = useConfig();
    const { locale, t } = useLocale();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t('home.title')}</h1>
            <p className={styles.subtitle}>{config.subtitle || t('home.defaultSubtitle')}</p>

            <div className={styles.grid}>
                {categories.filter(cat => cat.isVisible !== false && !cat.parent_id).map((cat) => (
                    <Link to={`/category/${cat.id}`} key={cat.id} className={styles.card}>
                        <div className={styles.imageContainer}>
                            {cat.image ? (
                                <img
                                    src={cat.image}
                                    alt={localizedField(cat, 'name', locale)}
                                    className={styles.image}
                                    style={{ objectPosition: cat.image_position || 'center' }}
                                />
                            ) : (
                                <ImagePlaceholder type="category" className={styles.image} />
                            )}
                            <div className={styles.overlay} />
                        </div>
                        <div className={styles.content}>
                            <h2 className={styles.categoryName}>{localizedField(cat, 'name', locale)}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
