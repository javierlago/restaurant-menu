import ImagePlaceholder from '../components/ImagePlaceholder';
import { Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import { useConfig } from '../context/ConfigContext';
import styles from './Home.module.css';

const Home = () => {
    const { categories } = useMenu();
    const { config } = useConfig();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Nuestra Carta</h1>
            <p className={styles.subtitle}>{config.subtitle || 'Descubre una experiencia gastronómica única'}</p>

            <div className={styles.grid}>
                {categories.filter(cat => cat.isVisible !== false).map((cat) => (
                    <Link to={`/category/${cat.id}`} key={cat.id} className={styles.card}>
                        <div className={styles.imageContainer}>
                            {cat.image ? (
                                <img src={cat.image} alt={cat.name} className={styles.image} />
                            ) : (
                                <ImagePlaceholder type="category" className={styles.image} />
                            )}
                            <div className={styles.overlay} />
                        </div>
                        <div className={styles.content}>
                            <h2 className={styles.categoryName}>{cat.name}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
