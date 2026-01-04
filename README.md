# Carta Digital - A Chabola

Este proyecto es una aplicación web interactiva diseñada para facilitar la visualización y gestión de la carta del restaurante **A Chabola**. Ofrece una experiencia moderna y rápida tanto para los clientes como para el propietario.

## 🎯 Objetivo y Funcionalidad

El objetivo principal es eliminar la dependencia de cartas físicas desactualizadas y permitir una gestión dinámica del menú.

### Para el Restaurante (Propietario/Administrador)
*   **Gestión Total de la Carta**: Permite **añadir, editar y retirar platos** en tiempo real.
*   **Gestión de Existencias**: Si un plato se agota, se puede ocultar temporalmente de la carta con un solo clic, sin necesidad de borrarlo.
*   **Personalización de Marca**: Desde el panel de administración se pueden modificar los **colores, el nombre del restaurante y el logotipo** para adaptar la aplicación a la identidad visual del negocio.

### Para el Cliente
*   **Acceso Rápido**: Visualización clara y atractiva de todos los platos, organizados por categorías.
*   **Información Detallada**: Acceso a descripciones, precios y alérgenos de cada plato.

---

## 🚀 Cómo Ejecutar el Proyecto

Para ver y utilizar la aplicación en tu entorno local, sigue estos pasos:

### Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu ordenador.

### Pasos
1.  **Instalar las dependencias**:
    Abre una terminal en la carpeta del proyecto y ejecuta:
    ```bash
    npm install
    ```

2.  **Iniciar la aplicación**:
    Ejecuta el siguiente comando para arrancar el servidor de desarrollo:
    ```bash
    npm run dev
    ```

3.  **Abrir en el navegador**:
    La terminal te mostrará una dirección (normalmente `http://localhost:5173/`). Abre esa URL en tu navegador web.

---

## 🔑 Acceso al Panel de Administración

Para probar las funcionalidades de edición:
1.  Navega a la sección de administración haciendo clic en el candado "Admin Access" en el pie de página o yendo a `/admin`.
2.  La contraseña por defecto para este entorno de desarrollo es: **`admin123`**.

---
*Desarrollado con React + Vite*
