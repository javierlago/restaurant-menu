import es from './es';
import gl from './gl';
import en from './en';
import fr from './fr';

export const SUPPORTED_LOCALES = ['es', 'gl', 'en', 'fr'];
export const DEFAULT_LOCALE = 'es';

const DICTIONARIES = { es, gl, en, fr };

export function translate(locale, key) {
    const dict = DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
    return dict.strings[key] ?? DICTIONARIES[DEFAULT_LOCALE].strings[key] ?? key;
}

export function translateAllergen(locale, allergen) {
    const dict = DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
    return dict.allergens[allergen] || allergen;
}
