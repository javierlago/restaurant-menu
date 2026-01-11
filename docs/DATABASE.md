# Database Documentation - A Chabola

This document describes the Supabase/PostgreSQL schema, table structures, and security policies used in the project.

## Tables

### 1. `dishes`
Stores individual menu items.

| Column      | Type        | Description                               |
| ----------- | ----------- | ----------------------------------------- |
| `id`        | `uuid`      | Primary Key (Identity)                    |
| `name`      | `text`      | Name of the dish                          |
| `description` | `text`    | Detailed description                      |
| `price`     | `numeric`   | Price of the dish                         |
| `portionSize` | `text`     | Portion details (e.g., "500g", "2 pers") |
| `allergens`  | `text[]`   | Array of allergens                        |
| `category`  | `text`      | Legacy reference (text)                   |
| `category_id` | `uuid`    | Reference to `categories.id`              |
| `image`     | `text`      | Public URL of the hosted image            |
| `image_position` | `text` | Object-position (e.g., "50% 50%")        |
| `isVisible` | `boolean`   | Toggle to hide/show from public view      |
| `created_at`| `timestamp` | Auto-generated timestamp                  |

### 2. `categories`
Stores menu categories for organization.

| Column      | Type        | Description                               |
| ----------- | ----------- | ----------------------------------------- |
| `id`        | `uuid`      | Primary Key (Identity)                    |
| `name`      | `text`      | Name of the category                      |
| `slug`      | `text`      | URL-friendly identifier                   |
| `image`     | `text`      | Icon/Header image for the category        |
| `image_position` | `text` | Object-position (e.g., "50% 50%")        |
| `isVisible` | `boolean`   | Toggle to hide/show category              |
| `category_order` | `integer` | Display order                        |
| `parent_id` | `uuid`      | Reference to parent `categories.id`       |

### 3. `restaurant_config`
Global settings for the restaurant's brand identity.

| Column            | Type        | Description                                  |
| ----------------- | ----------- | -------------------------------------------- |
| `id`              | `bigint`    | Primary Key (Identity)                       |
| `restaurant_name` | `text`      | Name displayed in Header and Title           |
| `subtitle`        | `text`      | Tagline or subtitle                          |
| `icon`            | `text`      | Logo URL (also used as Favicon)              |
| `theme_id`        | `text`      | Reference to the selected theme ID           |
| `show_name`       | `boolean`   | Toggle to show/hide name next to logo        |

---

## Migration & Setup Scripts

The scripts in `supabase/migrations/` are organized to facilitate both incremental updates and fresh setups:

- **`000_full_setup.sql`**: Recommended for **new projects**. A single script that creates all tables, buckets, and policies in one step.
- **`001_` to `007_`**: Chronological scripts reflecting the evolution of the database. Useful for auditing or partially updating an older version of the schema.

---

## Security (RLS)

Row Level Security (RLS) is enabled on all tables to ensure data integrity.

### Public Policies
- **`SELECT`**: Allowed for everyone. This enables customers to see the menu without logging in.

### Authenticated Policies
- **`INSERT`, `UPDATE`, `DELETE`**: Restricted to authenticated users (`role = 'authenticated'`). This ensures only the restaurant owner/admin can modify the menu.

## Storage Buckets

1.  **`dish-images`**: Stores photos for dishes.
2.  **`categories-images`**: Stores header images for categories.
3.  **`restaurant-assets`**: Stores logos and other brand assets.

*Policies follow the same logic as tables: Public read, Authenticated write/delete.*
