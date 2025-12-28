import { Link } from 'react-router-dom';
import { FaUtensils, FaLock } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import styles from './Layout.module.css';
import logoImg from '../assets/achabola.png';

const Layout = ({ children }) => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.topBar}>
                    <Link to="/" className={styles.logo}>
                        <img src={logoImg} alt="A Chabola" className={styles.logoImg} />
                        <span>A Chabola</span>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>© 2025 Restaurante A Chabola</p>
                <Link to="/admin" className={styles.adminLink}>
                    <FaLock size={12} /> Admin Access
                </Link>
            </footer>
        </div>
    );
};

export default Layout;
