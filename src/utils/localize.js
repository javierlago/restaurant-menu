const DEFAULT_LOCALE = 'es';

/**
 * Reads a translatable field (name/description/portionSize) off a dish or
 * category, falling back to the canonical Spanish column when the current
 * locale has no override or the override is blank.
 */
export function localizedField(entity, field, locale) {
    if (!entity) return '';
    if (locale === DEFAULT_LOCALE) return entity[field] ?? '';
    const override = entity.translations?.[locale]?.[field];
    return override?.trim() ? override : (entity[field] ?? '');
}
