# 🍽️ Smart Digital Menu - Open Source Ready

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern and elegant Progressive Web App (PWA) designed for dynamic visualization and management of restaurant menus. It allows customers to access the menu via QR codes and enables owners to manage all content in real-time.

---

## ✨ Features

### 📱 For the Customer
- **Hierarchical Categories**: Support for nested subcategories with intuitive breadcrumb-style navigation.
- **Interactive Menu**: Smooth dish visualization with responsive grids and smart image alignment.
- **Dark/Light Mode**: Full support for user theme preferences.
- **Dish Details**: Information on prices, descriptions, and allergens.
- **PWA Experience**: Can be installed on the mobile home screen like a native app.

### 🔐 Admin Dashboard
- **Hierarchical Content Management**: Create parent-child relationships between categories and assign dishes at any level.
- **Image Focal Point Selector**: Custom touch-friendly interface to precisely set image alignment (`object-position`) with real-time previews.
- **Visibility Control**: Hide/show dishes or entire categories based on availability.
- **Image Uploads**: Integration with Supabase Storage to manage dish and category photos.
- **QR Generator**: Dynamic QR code creation for tables with download options:
  - **PNG**: QR code only.
  - **PDF**: Ready-to-print design including the restaurant logo.
- **Visual Customization**: Change theme, restaurant name, and logo directly from the dashboard.
- **Security**: Protected authentication and password recovery system via Supabase.

---

## 💻 Tech Stack

### Frontend
- **React 19**: Core UI library.
- **Vite**: Fast build tool and development server.
- **React Router Dom**: Navigation management.
- **Context API**: Global state management (Menu, Config, Auth).
- **React Icons**: Modern iconography.
- **CSS Modules**: Encapsulated and responsive styling.

### Backend & Tools
- **Supabase**: 
  - **PostgreSQL**: Database for dishes, categories, and configuration.
  - **Authentication**: Admin user management.
  - **Storage**: Image storage.
- **jsPDF**: PDF report and menu generation.
- **qrcode.react**: Dynamic QR code generation.

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended).
- A [Supabase](https://supabase.com/) account.

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/restaurant-menu.git
   cd restaurant-menu
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables Configuration**:
   Create a `.env` file in the project root with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**:
   Run the SQL script included in `db_setup.sql` in the SQL editor of your Supabase dashboard to create the necessary tables and Row Level Security (RLS) policies.

5. **Run in development**:
   ```bash
   npm run dev
   ```

---

## 🛠️ Deployment

### Deploy to Vercel (Recommended)

1. **Push your code**: Ensure all your changes (including the new `vercel.json`) are on GitHub.
2. **Connect Repo**: Login to [Vercel](https://vercel.com/), click **"Add New" > "Project"**, and import your repository.
3. **Configure Environment Variables**: In the Vercel dashboard, go to the **Settings > Environment Variables** of your project and add:
   - `VITE_SUPABASE_URL`: (Copy from your local `.env`)
   - `VITE_SUPABASE_ANON_KEY`: (Copy from your local `.env`)
4. **Deploy**: Click the "Deploy" button. Vercel will automatically detect Vite and build the project.

> [!TIP]
> This project includes a `vercel.json` file which ensures that routes like `/admin` work correctly when the page is refreshed (SPA routing).

### Other Platforms
You can also use **Netlify** (requires a `_redirects` file) or **GitHub Pages** (requires extra configuration for routing).

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 📚 Documentation

For more detailed technical information, please refer to:
- [🏗️ Architecture Overview](docs/ARCHITECTURE.md): Project structure and data flow.
- [🗄️ Database Schema](docs/DATABASE.md): Table definitions and RLS policies.
- [🔐 Administrator Guide](docs/ADMIN_GUIDE.md): How to manage the menu and branding.

---
*Developed with ❤️ as a modular restaurant solution*
