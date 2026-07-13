const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB

export function validateImageFile(file) {
    if (file.size > MAX_IMAGE_SIZE) {
        return 'La imagen supera el límite de 15 MB';
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Formato no permitido. Usa JPEG, PNG, WebP o GIF';
    }
    return null;
}

export function validatePrice(value) {
    const price = parseFloat(value);
    if (isNaN(price) || price < 0 || price > 9999.99) {
        return 'El precio debe ser un número válido entre 0 y 9999.99';
    }
    return null;
}

export function parseAllergens(value) {
    return value.split(',').map(s => s.trim()).filter(Boolean);
}

export function sanitizeImagePath(path) {
    return path
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9/._-]/g, '')
        .split('/')
        .filter(segment => segment !== '..' && segment !== '.')
        .join('/');
}

export function safeColor(value) {
    return /^#[0-9A-Fa-f]{3,8}$/.test(value) ? value : '#000000';
}

export function validatePassword(password, confirmPassword) {
    if (password.length < 12) {
        return 'La contraseña debe tener al menos 12 caracteres';
    }
    if (password !== confirmPassword) {
        return 'Las contraseñas no coinciden';
    }
    return null;
}
