import { describe, it, expect } from 'vitest';
import {
    validateImageFile,
    validatePrice,
    parseAllergens,
    sanitizeImagePath,
    safeColor,
    validatePassword,
} from './validation';

// ---------------------------------------------------------------------------
// validateImageFile
// ---------------------------------------------------------------------------
describe('validateImageFile', () => {
    const makeFile = (size, type) => ({ size, type });

    it('acepta una imagen JPEG dentro del límite', () => {
        expect(validateImageFile(makeFile(1 * 1024 * 1024, 'image/jpeg'))).toBeNull();
    });

    it('acepta imagen PNG, WebP y GIF', () => {
        expect(validateImageFile(makeFile(1000, 'image/png'))).toBeNull();
        expect(validateImageFile(makeFile(1000, 'image/webp'))).toBeNull();
        expect(validateImageFile(makeFile(1000, 'image/gif'))).toBeNull();
    });

    it('rechaza una imagen que supera 15 MB', () => {
        const error = validateImageFile(makeFile(16 * 1024 * 1024, 'image/jpeg'));
        expect(error).toMatch(/15 MB/);
    });

    it('rechaza un tipo de archivo no permitido', () => {
        const error = validateImageFile(makeFile(1000, 'application/pdf'));
        expect(error).toMatch(/Formato no permitido/);
    });

    it('rechaza exactamente en el límite de 15 MB + 1 byte', () => {
        const error = validateImageFile(makeFile(15 * 1024 * 1024 + 1, 'image/jpeg'));
        expect(error).toMatch(/15 MB/);
    });

    it('acepta exactamente 15 MB', () => {
        expect(validateImageFile(makeFile(15 * 1024 * 1024, 'image/jpeg'))).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// validatePrice
// ---------------------------------------------------------------------------
describe('validatePrice', () => {
    it('acepta un precio válido', () => {
        expect(validatePrice('12.50')).toBeNull();
        expect(validatePrice('0')).toBeNull();
        expect(validatePrice('9999.99')).toBeNull();
    });

    it('rechaza texto no numérico', () => {
        expect(validatePrice('abc')).not.toBeNull();
        expect(validatePrice('')).not.toBeNull();
    });

    it('rechaza precios negativos', () => {
        expect(validatePrice('-1')).not.toBeNull();
    });

    it('rechaza precios superiores a 9999.99', () => {
        expect(validatePrice('10000')).not.toBeNull();
    });

    it('rechaza NaN explícito', () => {
        expect(validatePrice('NaN')).not.toBeNull();
    });
});

// ---------------------------------------------------------------------------
// parseAllergens
// ---------------------------------------------------------------------------
describe('parseAllergens', () => {
    it('separa alérgenos por coma', () => {
        expect(parseAllergens('Gluten, Lactosa, Huevo')).toEqual(['Gluten', 'Lactosa', 'Huevo']);
    });

    it('elimina espacios extra', () => {
        expect(parseAllergens('  Gluten ,  Lactosa  ')).toEqual(['Gluten', 'Lactosa']);
    });

    it('filtra entradas vacías', () => {
        expect(parseAllergens('Gluten,,Lactosa,')).toEqual(['Gluten', 'Lactosa']);
    });

    it('devuelve array vacío si no hay alérgenos', () => {
        expect(parseAllergens('')).toEqual([]);
    });

    it('devuelve un solo elemento si no hay coma', () => {
        expect(parseAllergens('Gluten')).toEqual(['Gluten']);
    });
});

// ---------------------------------------------------------------------------
// sanitizeImagePath
// ---------------------------------------------------------------------------
describe('sanitizeImagePath', () => {
    it('elimina caracteres especiales peligrosos', () => {
        const result = sanitizeImagePath('123/../etc/passwd.jpg');
        expect(result).not.toContain('..');
    });

    it('conserva caracteres válidos', () => {
        expect(sanitizeImagePath('42/imagen-plato_1.jpg')).toBe('42/imagen-plato_1.jpg');
    });

    it('elimina acentos y caracteres no ASCII', () => {
        const result = sanitizeImagePath('categoría/ñoño.jpg');
        expect(result).toMatch(/^[a-zA-Z0-9/._-]+$/);
    });
});

// ---------------------------------------------------------------------------
// safeColor
// ---------------------------------------------------------------------------
describe('safeColor', () => {
    it('acepta colores hex de 6 dígitos', () => {
        expect(safeColor('#FF5733')).toBe('#FF5733');
        expect(safeColor('#000000')).toBe('#000000');
    });

    it('acepta colores hex de 3 dígitos', () => {
        expect(safeColor('#FFF')).toBe('#FFF');
    });

    it('devuelve negro para valores inválidos', () => {
        expect(safeColor('red')).toBe('#000000');
        expect(safeColor('javascript:alert(1)')).toBe('#000000');
        expect(safeColor('')).toBe('#000000');
        expect(safeColor('#GGGGGG')).toBe('#000000');
    });
});

// ---------------------------------------------------------------------------
// validatePassword
// ---------------------------------------------------------------------------
describe('validatePassword', () => {
    it('acepta contraseña válida con confirmación correcta', () => {
        expect(validatePassword('MiPassword123!', 'MiPassword123!')).toBeNull();
    });

    it('rechaza contraseña menor de 12 caracteres', () => {
        const error = validatePassword('corta', 'corta');
        expect(error).toMatch(/12 caracteres/);
    });

    it('rechaza cuando las contraseñas no coinciden', () => {
        const error = validatePassword('MiPassword123!', 'OtraPassword123!');
        expect(error).toMatch(/no coinciden/);
    });

    it('prioriza el error de longitud sobre el de confirmación', () => {
        const error = validatePassword('corta', 'diferente');
        expect(error).toMatch(/12 caracteres/);
    });
});
