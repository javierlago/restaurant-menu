import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mock data — controla exactamente lo que ve el navegador
// ---------------------------------------------------------------------------
const MOCK_CONFIG = {
    id: 1,
    restaurant_name: 'Restaurante Demo',
    show_name: true,
    icon: null,
    theme_id: 'classic',
    subtitle: 'Descubre nuestra carta',
};

const MOCK_CATEGORIES = [
    { id: 1, name: 'Entrantes',      isVisible: true,  parent_id: null, category_order: 0, image: null, image_position: 'center', slug: 'entrantes' },
    { id: 2, name: 'Postres',        isVisible: true,  parent_id: null, category_order: 1, image: null, image_position: 'center', slug: 'postres'   },
    { id: 3, name: 'Bebidas Ocultas',isVisible: false, parent_id: null, category_order: 2, image: null, image_position: 'center', slug: 'bebidas'   },
    { id: 4, name: 'Ensaladas',      isVisible: true,  parent_id: 1,   category_order: 0, image: null, image_position: 'center', slug: 'ensaladas' },
    { id: 5, name: 'Vacía',          isVisible: true,  parent_id: null, category_order: 3, image: null, image_position: 'center', slug: 'vacia'     },
];

const MOCK_DISHES = [
    { id: 1, name: 'Croquetas',     price: 8.50,  category_id: 1, isVisible: true,  image: null, allergens: ['Gluten', 'Lactosa'], description: 'Caseras',   portion_size: 'Ración'  },
    { id: 2, name: 'Jamón Ibérico', price: 22.00, category_id: 1, isVisible: false, image: null, allergens: [],                    description: '',           portion_size: 'Ración'  },
    { id: 3, name: 'Tarta de Queso',price: 5.50,  category_id: 2, isVisible: true,  image: null, allergens: ['Lactosa'],           description: 'Artesana',  portion_size: 'Unidad'  },
];

// ---------------------------------------------------------------------------
// Helper: intercepta las llamadas REST de Supabase con datos controlados
// ---------------------------------------------------------------------------
async function mockSupabase(page) {
    // Abortar conexión realtime (WebSocket) para evitar timeouts en tests
    await page.route('**/realtime/v1/**', route => route.abort());

    await page.route('**/rest/v1/restaurant_config*', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CONFIG) })
    );
    await page.route('**/rest/v1/categories*', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CATEGORIES) })
    );
    await page.route('**/rest/v1/dishes*', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DISHES) })
    );
}

// ---------------------------------------------------------------------------
// Home — qué categorías se muestran
// ---------------------------------------------------------------------------
test.describe('Home — categorías visibles', () => {
    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
    });

    test('muestra las categorías raíz visibles', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Entrantes' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Postres' })).toBeVisible();
    });

    test('no muestra categorías ocultas', async ({ page }) => {
        // Esperar a que carguen las visibles antes de asegurar que las ocultas no aparecen
        await expect(page.getByRole('heading', { name: 'Entrantes' })).toBeVisible();
        await expect(page.getByText('Bebidas Ocultas')).not.toBeVisible();
    });

    test('no muestra subcategorías en la portada', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Entrantes' })).toBeVisible();
        await expect(page.getByText('Ensaladas')).not.toBeVisible();
    });

    test('muestra el subtítulo configurado', async ({ page }) => {
        await expect(page.getByText('Descubre nuestra carta')).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Navegación home → categoría
// ---------------------------------------------------------------------------
test.describe('Navegación — home a categoría', () => {
    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
    });

    test('clic en categoría lleva a su URL', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Entrantes' }).click();
        await expect(page).toHaveURL(/\/category\/1/);
    });

    test('la vista de categoría muestra su título', async ({ page }) => {
        await page.goto('/category/1');
        await expect(page.getByRole('heading', { name: 'Entrantes' })).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Vista de categoría — platos
// ---------------------------------------------------------------------------
test.describe('Categoría — platos', () => {
    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/category/1');
    });

    test('muestra los platos visibles', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Croquetas' })).toBeVisible();
    });

    test('oculta los platos con isVisible=false', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Croquetas' })).toBeVisible();
        await expect(page.getByText('Jamón Ibérico')).not.toBeVisible();
    });

    test('muestra el precio formateado', async ({ page }) => {
        await expect(page.getByText('8.50€')).toBeVisible();
    });

    test('muestra los alérgenos del plato', async ({ page }) => {
        await expect(page.getByText('Gluten')).toBeVisible();
        await expect(page.getByText('Lactosa')).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Vista de categoría — subcategorías
// ---------------------------------------------------------------------------
test.describe('Categoría — subcategorías', () => {
    test('muestra las subcategorías visibles del padre', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/category/1');
        await expect(page.getByRole('heading', { name: 'Ensaladas' })).toBeVisible();
    });

    test('navegar a subcategoría actualiza la URL', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/category/1');
        await page.getByRole('link', { name: 'Ensaladas' }).click();
        await expect(page).toHaveURL(/\/category\/4/);
    });
});

// ---------------------------------------------------------------------------
// Protección de categorías ocultas
// ---------------------------------------------------------------------------
test.describe('Categoría oculta — acceso directo', () => {
    test('URL directa a categoría oculta muestra "no disponible"', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/category/3');
        await expect(page.getByText('Categoría no disponible.')).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Categoría vacía
// ---------------------------------------------------------------------------
test.describe('Categoría vacía', () => {
    test('muestra mensaje cuando no hay platos ni subcategorías', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/category/5');
        await expect(page.getByText('No hay platos ni subcategorías disponibles.')).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Botón Volver
// ---------------------------------------------------------------------------
test.describe('Navegación — botón Volver', () => {
    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
    });

    test('volver desde categoría raíz lleva al home', async ({ page }) => {
        await page.goto('/category/1');
        await page.getByRole('link', { name: /Volver/ }).click();
        await expect(page).toHaveURL('/');
    });

    test('volver desde subcategoría lleva a la categoría padre', async ({ page }) => {
        await page.goto('/category/4');
        await page.getByRole('link', { name: /Volver/ }).click();
        await expect(page).toHaveURL(/\/category\/1/);
    });
});
