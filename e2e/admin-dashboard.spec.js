import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_CONFIG = {
    id: 1, restaurant_name: 'Restaurante Demo', show_name: true,
    icon: null, theme_id: 'classic', subtitle: 'Descubre nuestra carta',
};

const MOCK_CATEGORIES = [
    { id: 1, name: 'Entrantes', isVisible: true,  parent_id: null, category_order: 0, image: null, image_position: 'center', slug: 'entrantes' },
    { id: 2, name: 'Postres',   isVisible: true,  parent_id: null, category_order: 1, image: null, image_position: 'center', slug: 'postres'   },
];

const MOCK_DISHES = [
    { id: 1, name: 'Croquetas',     price: 8.50,  category_id: 1, isVisible: true,  image: null, allergens: ['Gluten'], description: 'Caseras', portion_size: 'Ración' },
    { id: 2, name: 'Jamón Ibérico', price: 22.00, category_id: 1, isVisible: false, image: null, allergens: [],         description: '',        portion_size: 'Ración' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Inyecta sesión de admin en sessionStorage ANTES de que Supabase inicialice.
 * Debe llamarse ANTES de page.goto().
 */
async function injectAdminSession(page) {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    await page.addInitScript((session) => {
        window.sessionStorage.setItem(
            'sb-zdpsobbbxigyiqhqilkx-auth-token',
            JSON.stringify(session)
        );
    }, {
        access_token: 'mock-admin-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: expiresAt,
        refresh_token: 'mock-refresh-token',
        user: {
            id: 'mock-user-id',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'admin@test.com',
            email_confirmed_at: '2024-01-01T00:00:00Z',
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {},
            created_at: '2024-01-01T00:00:00Z',
        },
    });
}

/** Intercepta todas las llamadas Supabase (REST + auth). */
async function mockSupabase(page) {
    await page.route('**/realtime/v1/**', route => route.abort());

    await page.route('**/auth/v1/user*', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'mock-user-id', email: 'admin@test.com', role: 'authenticated' }) })
    );
    await page.route('**/auth/v1/logout*', route =>
        route.fulfill({ status: 204, body: '' })
    );
    await page.route('**/rest/v1/restaurant_config*', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CONFIG) })
    );
    await page.route('**/rest/v1/categories*', async route => {
        const method = route.request().method();
        if (method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CATEGORIES) });
        if (method === 'POST') return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ...MOCK_CATEGORIES[0], id: 99, name: 'Nueva' }) });
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });
    await page.route('**/rest/v1/dishes*', async route => {
        const method = route.request().method();
        if (method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DISHES) });
        if (method === 'POST') return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ...MOCK_DISHES[0], id: 99 }) });
        if (method === 'DELETE') return route.fulfill({ status: 204, body: '' });
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });
}

/** Mockea el endpoint de login de Supabase. */
async function mockAuthLogin(page, { success = true } = {}) {
    await page.route('**/auth/v1/token*', route => {
        if (success) {
            const expiresAt = Math.floor(Date.now() / 1000) + 3600;
            return route.fulfill({
                status: 200, contentType: 'application/json',
                body: JSON.stringify({
                    access_token: 'mock-token', token_type: 'bearer',
                    expires_in: 3600, expires_at: expiresAt,
                    refresh_token: 'mock-refresh',
                    user: { id: 'mock-user-id', email: 'admin@test.com', role: 'authenticated', aud: 'authenticated' },
                }),
            });
        }
        route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'invalid_grant' }) });
    });
}

// ---------------------------------------------------------------------------
// Bloque 1: Formulario de login (sin sesión)
// ---------------------------------------------------------------------------
test.describe('Admin — Formulario de login', () => {
    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
    });

    test('muestra "Acceso Propietario" cuando no hay sesión', async ({ page }) => {
        await page.goto('/admin');
        await expect(page.getByRole('heading', { name: 'Acceso Propietario' })).toBeVisible();
    });

    test('"¿Olvidaste tu contraseña?" navega al formulario de recuperación', async ({ page }) => {
        await page.goto('/admin');
        await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click();
        await expect(page.getByRole('heading', { name: 'Recuperar Contraseña' })).toBeVisible();
    });

    test('"Volver al Login" desde recuperación regresa al formulario', async ({ page }) => {
        await page.goto('/admin');
        await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click();
        await page.getByRole('button', { name: 'Volver al Login' }).click();
        await expect(page.getByRole('heading', { name: 'Acceso Propietario' })).toBeVisible();
    });

    test('credenciales incorrectas muestran alerta de error', async ({ page }) => {
        await mockAuthLogin(page, { success: false });
        await page.goto('/admin');

        const dialogPromise = page.waitForEvent('dialog');
        await page.getByPlaceholder('Correo Electrónico').fill('wrong@test.com');
        await page.getByPlaceholder('Contraseña').fill('badpassword');
        await page.getByRole('button', { name: 'Entrar' }).click();

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Email o contraseña incorrectos');
        await dialog.accept();
    });

    test('login correcto muestra el panel de administración', async ({ page }) => {
        await mockAuthLogin(page, { success: true });
        await page.goto('/admin');

        page.on('dialog', d => d.accept());
        await page.getByPlaceholder('Correo Electrónico').fill('admin@test.com');
        await page.getByPlaceholder('Contraseña').fill('AdminPass123!');
        await page.getByRole('button', { name: 'Entrar' }).click();

        await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Bloque 2: Panel autenticado — estructura y logout
// ---------------------------------------------------------------------------
test.describe('Admin — Panel autenticado', () => {
    test.beforeEach(async ({ page }) => {
        await injectAdminSession(page);
        await mockSupabase(page);
        await page.goto('/admin');
    });

    test('muestra el encabezado del panel', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
    });

    test('muestra las tres pestañas + botón Salir', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Platos' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Categorías' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Personalización' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();
    });

    test('logout muestra el formulario de login', async ({ page }) => {
        await page.getByRole('button', { name: 'Salir' }).click();
        await expect(page.getByRole('heading', { name: 'Acceso Propietario' })).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Bloque 3: Gestión de platos
// ---------------------------------------------------------------------------
test.describe('Admin — Gestión de platos', () => {
    test.beforeEach(async ({ page }) => {
        await injectAdminSession(page);
        await mockSupabase(page);
        await page.goto('/admin');
        // Esperar a que cargue la lista antes de cada test
        await expect(page.getByText('Croquetas')).toBeVisible();
    });

    test('lista todos los platos (visibles y ocultos)', async ({ page }) => {
        await expect(page.getByText('Croquetas')).toBeVisible();
        await expect(page.getByText('Jamón Ibérico')).toBeVisible();
    });

    test('"Añadir Plato" muestra el formulario', async ({ page }) => {
        await page.getByRole('button', { name: /Añadir Plato/ }).click();
        await expect(page.getByRole('heading', { name: 'Nuevo Plato' })).toBeVisible();
    });

    test('"Cerrar" oculta el formulario', async ({ page }) => {
        await page.getByRole('button', { name: /Añadir Plato/ }).click();
        await page.getByRole('button', { name: /Cerrar/ }).click();
        await expect(page.getByRole('heading', { name: 'Nuevo Plato' })).not.toBeVisible();
    });

    test('formulario muestra campos requeridos', async ({ page }) => {
        await page.getByRole('button', { name: /Añadir Plato/ }).click();
        await expect(page.getByPlaceholder('Ej. Paella Valenciana')).toBeVisible();
        await expect(page.getByPlaceholder('0.00')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible();
    });

    test('guardar plato nuevo muestra alerta de confirmación', async ({ page }) => {
        await page.getByRole('button', { name: /Añadir Plato/ }).click();

        const nameInput = page.getByPlaceholder('Ej. Paella Valenciana');
        await nameInput.fill('Paella Test');
        await expect(nameInput).toHaveValue('Paella Test');

        const priceInput = page.getByPlaceholder('0.00');
        await priceInput.fill('12.50');
        await expect(priceInput).toHaveValue('12.50');

        // Playwright bloquea el await click() mientras haya un diálogo sin resolver.
        // Registramos el handler ANTES del click para que se descarte durante la acción.
        let dialogMessage = '';
        page.once('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });
        await page.getByRole('button', { name: 'Guardar' }).click({ force: true });
        expect(dialogMessage).toContain('Plato añadido');
    });

    test('cada plato tiene botón de editar accesible', async ({ page }) => {
        // Verificar que el botón de editar existe para cada plato de la lista
        const editButtons = page.getByTitle('Editar');
        await expect(editButtons).toHaveCount(MOCK_DISHES.length);
    });

    test('eliminar plato muestra diálogo con nombre del plato', async ({ page }) => {
        let confirmMessage = '';

        // Registrar handler ANTES del click
        page.once('dialog', async dialog => {
            confirmMessage = dialog.message();
            await dialog.accept();
        });

        await page.getByTitle('Eliminar').first().click();
        // Esperar a que se procese
        await expect(async () => {
            expect(confirmMessage).toContain('Croquetas');
        }).toPass({ timeout: 3000 });

        expect(confirmMessage).toContain('Esta acción no se puede deshacer');
    });

    test('cancelar eliminación no envía DELETE al servidor', async ({ page }) => {
        let deleteRequestMade = false;
        page.on('request', req => {
            if (req.url().includes('/rest/v1/dishes') && req.method() === 'DELETE') {
                deleteRequestMade = true;
            }
        });

        page.once('dialog', dialog => dialog.dismiss()); // Cancelar
        await page.getByTitle('Eliminar').first().click();

        // Dar tiempo a que se procese
        await page.waitForTimeout(500);
        expect(deleteRequestMade).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Bloque 4: Gestión de categorías
// ---------------------------------------------------------------------------
test.describe('Admin — Gestión de categorías', () => {
    test.beforeEach(async ({ page }) => {
        await injectAdminSession(page);
        await mockSupabase(page);
        await page.goto('/admin');
        await page.getByRole('button', { name: 'Categorías' }).click();
        // Esperar a que cargue la lista de categorías (drag handles)
        await expect(page.getByTitle('Arrastrar para reordenar').first()).toBeVisible();
    });

    test('muestra el formulario de nueva categoría', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Nueva Categoría' })).toBeVisible();
    });

    test('lista todas las categorías con handles de arrastre', async ({ page }) => {
        // Cada categoría tiene un drag handle — verificar que hay 2 (igual que MOCK_CATEGORIES)
        await expect(page.getByTitle('Arrastrar para reordenar')).toHaveCount(MOCK_CATEGORIES.length);
    });

    test('añadir categoría muestra alerta de confirmación', async ({ page }) => {
        const nameInput = page.getByPlaceholder('Nombre Categoría');
        await nameInput.fill('Bebidas');
        await expect(nameInput).toHaveValue('Bebidas');

        let dialogMessage = '';
        page.once('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });
        await page.getByRole('button', { name: 'Añadir Categoría' }).click({ force: true });
        expect(dialogMessage).toContain('Categoría añadida');
    });

    test('botón editar categoría rellena el formulario', async ({ page }) => {
        // El botón editar de cada fila no tiene title, pero está ANTES del botón "Ocultar"
        // XPath: primer botón que precede al botón con title "Ocultar"
        await page.locator('xpath=(//button[@title="Ocultar" or @title="Mostrar"])[1]/preceding-sibling::button[1]').click();
        await expect(page.getByRole('heading', { name: 'Editar Categoría' })).toBeVisible();
        await expect(page.getByPlaceholder('Nombre Categoría')).toHaveValue('Entrantes');
    });

    test('eliminar categoría muestra diálogo de confirmación', async ({ page }) => {
        let confirmMessage = '';

        page.once('dialog', async dialog => {
            confirmMessage = dialog.message();
            await dialog.accept();
        });

        // El botón delete es el SIGUIENTE al botón "Ocultar"
        await page.locator('xpath=(//button[@title="Ocultar" or @title="Mostrar"])[1]/following-sibling::button[1]').click();

        await expect(async () => {
            expect(confirmMessage).toContain('Entrantes');
        }).toPass({ timeout: 3000 });
    });
});

// ---------------------------------------------------------------------------
// Bloque 5: Pestaña de personalización
// ---------------------------------------------------------------------------
test.describe('Admin — Personalización', () => {
    test.beforeEach(async ({ page }) => {
        await injectAdminSession(page);
        await mockSupabase(page);
        await page.goto('/admin');
        await page.getByRole('button', { name: 'Personalización' }).click();
        await expect(page.getByRole('heading', { name: 'Personalización de Marca' })).toBeVisible();
    });

    test('muestra la sección de identidad', async ({ page }) => {
        await expect(page.getByText('Identidad')).toBeVisible();
    });

    test('muestra el código QR del menú', async ({ page }) => {
        await expect(page.locator('#menu-qr')).toBeVisible();
    });

    test('el campo nombre del restaurante tiene el valor configurado', async ({ page }) => {
        // El label "Nombre del Restaurante" no tiene for/id, usar XPath de hermano siguiente
        const nameInput = page.locator('xpath=//label[normalize-space(text())="Nombre del Restaurante"]/following-sibling::input');
        await expect(nameInput).toHaveValue('Restaurante Demo');
    });
});
