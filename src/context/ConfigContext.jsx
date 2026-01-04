import { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, getThemeById } from '../data/themes';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

const DEFAULT_CONFIG = {
    restaurantName: 'A Chabola',
    showName: true,
    icon: '/achabola.png',
    themeId: 'classic' // Replaced 'colors' with 'themeId'
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);

    // Load from localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem('restaurant_config');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                // Ensure legacy config doesn't break app, default to 'classic' if invalid
                const themeId = parsed.themeId || 'classic';

                setConfig({
                    ...DEFAULT_CONFIG,
                    ...parsed,
                    themeId
                });
            } catch (e) {
                console.error("Failed to parse config", e);
            }
        }
        setLoading(false);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('restaurant_config', JSON.stringify(config));
        }
    }, [config, loading]);

    // Apply Theme Styles Dynamically
    useEffect(() => {
        const theme = getThemeById(config.themeId);
        if (!theme) return;

        // Dynamic Style Injection
        const styleId = 'dynamic-theme-styles';
        let styleEl = document.getElementById(styleId);

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        const css = `
            :root, :root[data-theme="light"] {
                --color-primary: ${theme.colors.light.primary};
                --color-background: ${theme.colors.light.background};
                --color-surface: ${theme.colors.light.surface};
                --color-text: ${theme.colors.light.text};
                --color-brand-brown: ${theme.colors.light.primary}; 
                --color-brand-cream: ${theme.colors.light.background};
                --color-text-muted: ${theme.colors.light.secondary};
                --color-secondary: ${theme.colors.light.secondary};
            }
            :root[data-theme="dark"] {
                 --color-primary: ${theme.colors.dark.primary};
                --color-background: ${theme.colors.dark.background};
                --color-surface: ${theme.colors.dark.surface};
                --color-text: ${theme.colors.dark.text};
                --color-brand-brown: ${theme.colors.dark.primary}; 
                --color-brand-cream: ${theme.colors.dark.background};
                --color-text-muted: ${theme.colors.dark.secondary};
                --color-secondary: ${theme.colors.dark.secondary};
            }
        `;

        styleEl.innerHTML = css;

        // Update Favicon/Title
        if (config.icon) {
            const link = document.querySelector("link[rel~='icon']");
            if (link) link.href = config.icon;
        }
        document.title = config.restaurantName;

    }, [config]);

    const updateConfig = (key, value) => {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetToDefaults = () => {
        setConfig(DEFAULT_CONFIG);
    };

    return (
        <ConfigContext.Provider value={{ config, updateConfig, resetToDefaults, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};
