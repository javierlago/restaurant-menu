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
                    {/* Left: Logo Image */}
                    <Link to="/" className={styles.logoLeft}>
                        <img src={config.icon || '/achabola.png'} alt={config.restaurantName} className={styles.logoImg} />
                    </Link>

                    {/* Center: Restaurant Name */}
                    {config.showName && (
                        <Link to="/" className={styles.logoCenter}>
                            {config.restaurantName}
                        </Link>
                    )}

                    {/* Right: Theme Toggle */}
                    <div className={styles.rightControls}>
                        <ThemeToggle />
                    </div>
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
