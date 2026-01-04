import { Link } from 'react-router-dom';
import { FaUtensils, FaLock } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import styles from './Layout.module.css';
import { useConfig } from '../context/ConfigContext';

const Layout = ({ children }) => {
    const { config } = useConfig();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.topBar}>
                    <Link to="/" className={styles.logo}>
                        <img src={config.icon || '/achabola.png'} alt={config.restaurantName} className={styles.logoImg} />
                        {config.showName && <span>{config.restaurantName}</span>}
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} {config.restaurantName}</p>
                <Link to="/admin" className={styles.adminLink}>
                    <FaLock size={12} /> Admin Access
                </Link>
            </footer>
        </div>
    );
};

export default Layout;
