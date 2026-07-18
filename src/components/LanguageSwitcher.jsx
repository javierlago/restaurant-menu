import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { SUPPORTED_LOCALES } from '../i18n';
import es from '../i18n/es';
import gl from '../i18n/gl';
import en from '../i18n/en';
import fr from '../i18n/fr';
import styles from './LanguageSwitcher.module.css';

const LABELS = { es, gl, en, fr };

const LanguageSwitcher = () => {
    const { locale, setLocale } = useLocale();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Cambiar idioma"
            >
                {locale.toUpperCase()}
            </button>
            {open && (
                <ul className={styles.menu} role="listbox">
                    {SUPPORTED_LOCALES.map((code) => (
                        <li key={code}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={code === locale}
                                className={`${styles.option} ${code === locale ? styles.active : ''}`}
                                onClick={() => { setLocale(code); setOpen(false); }}
                            >
                                {LABELS[code].label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LanguageSwitcher;
