import styles from './LangTabBar.module.css';

const LANG_TABS = [
    { code: 'es', label: 'Español' },
    { code: 'gl', label: 'Galego' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
];

const LangTabBar = ({ active, onChange }) => {
    return (
        <div className={styles.tabs}>
            {LANG_TABS.map(tab => (
                <button
                    key={tab.code}
                    type="button"
                    onClick={() => onChange(tab.code)}
                    className={`${styles.tab} ${active === tab.code ? styles.active : ''}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default LangTabBar;
