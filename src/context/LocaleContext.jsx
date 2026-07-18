import { createContext, useContext, useState, useEffect } from 'react';
import { translate, translateAllergen, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../i18n';

const LocaleContext = createContext();

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }) => {
    const [locale, setLocaleState] = useState(() => {
        const stored = localStorage.getItem('app_locale');
        return SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;
    });

    useEffect(() => {
        localStorage.setItem('app_locale', locale);
        document.documentElement.setAttribute('lang', locale);
    }, [locale]);

    const setLocale = (next) => {
        if (SUPPORTED_LOCALES.includes(next)) setLocaleState(next);
    };

    const t = (key) => translate(locale, key);
    const tAllergen = (allergen) => translateAllergen(locale, allergen);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t, tAllergen }}>
            {children}
        </LocaleContext.Provider>
    );
};
