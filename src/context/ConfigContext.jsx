import { createContext, useContext, useState, useEffect } from 'react';
import { getThemeById } from '../data/themes';
import { supabase } from '../supabase/client';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

const DEFAULT_CONFIG = {
    restaurantName: 'Restaurant Name',
    showName: true,
    icon: '/restaurant-logo.png',
    themeId: 'classic',
    subtitle: 'Discover our delicious menu and unique flavors'
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [configId, setConfigId] = useState(null); // database ID

    // Fetch config from Supabase
    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('restaurant_config')
                .select('*')
                .limit(1)
                .single();

            if (data) {
                setConfig({
                    restaurantName: data.restaurant_name,
                    showName: data.show_name,
                    icon: data.icon || '/restaurant-logo.png',
                    themeId: data.theme_id || 'classic',
                    subtitle: data.subtitle || 'Discover our delicious menu and unique flavors'
                });
                setConfigId(data.id);
            } else if (error && error.code !== 'PGRST116') {
                // PGRST116 is "The result contains 0 rows" which is fine (use default)
                console.error('Error fetching config:', error);
            }
        } catch (err) {
            console.error('Unexpected error fetching config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();

        // Realtime subscription
        const subscription = supabase
            .channel('public:restaurant_config')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_config' }, (payload) => {
                fetchConfig();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

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

    const updateConfig = async (key, value) => {
        // Optimistic update
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));

        // Map frontend keys to DB columns
        const dbKeyMap = {
            restaurantName: 'restaurant_name',
            showName: 'show_name',
            icon: 'icon',
            themeId: 'theme_id',
            subtitle: 'subtitle'
        };

        const dbKey = dbKeyMap[key];
        if (!dbKey) return;

        try {
            if (configId) {
                await supabase
                    .from('restaurant_config')
                    .update({ [dbKey]: value })
                    .eq('id', configId);
            } else {
                // First time save (insert)
                // We need to map the whole current config + the new value
                const currentDbData = {
                    restaurant_name: config.restaurantName,
                    show_name: config.showName,
                    icon: config.icon,
                    theme_id: config.themeId,
                    subtitle: config.subtitle,
                    [dbKey]: value
                };

                const { data } = await supabase
                    .from('restaurant_config')
                    .insert([currentDbData])
                    .select()
                    .single();

                if (data) setConfigId(data.id);
            }
        } catch (error) {
            console.error('Error updating config:', error);
            // Revert optimistic update if needed (omitted for brevity)
        }
    };

    const uploadLogo = async (file) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('restaurant-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('restaurant-assets')
                .getPublicUrl(filePath);

            updateConfig('icon', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    };

    const resetToDefaults = async () => {
        setConfig(DEFAULT_CONFIG);
        // Reset in DB too logic if needed
    };

    const updateColor = (key, value) => {
        // Legacy support or remove if unused. keeping for safety but it does nothing to DB
        console.warn('updateColor deprecated in favor of updateConfig');
    };

    return (
        <ConfigContext.Provider value={{ config, updateConfig, uploadLogo, resetToDefaults, loading, updateColor }}>
            {children}
        </ConfigContext.Provider>
    );
};
