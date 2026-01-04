export const THEMES = [
    {
        id: 'classic',
        name: 'Clásico (Oro y Café)',
        colors: {
            light: {
                primary: '#492113', // Warm Brown
                secondary: '#C7A17A',
                background: '#F6ECD3', // Cream
                surface: '#FFFDF5',
                text: '#492113',
            },
            dark: {
                primary: '#F6ECD3', // Cream text on dark
                secondary: '#C7A17A',
                background: '#1A0F05', // Deep Dark Brown
                surface: '#2E1B0E',
                text: '#F6ECD3',
            }
        }
    },
    {
        id: 'modern_slate',
        name: 'Modern Slate (Gris Azulado)',
        colors: {
            light: {
                primary: '#1E293B', // Slate 800
                secondary: '#64748B',
                background: '#F1F5F9', // Slate 100
                surface: '#FFFFFF',
                text: '#0F172A',
            },
            dark: {
                primary: '#E2E8F0', // Slate 200
                secondary: '#94A3B8',
                background: '#0F172A', // Slate 900
                surface: '#1E293B', // Slate 800
                text: '#F8FAFC',
            }
        }
    },
    {
        id: 'ocean',
        name: 'Ocean Breeze (Azul)',
        colors: {
            light: {
                primary: '#0C4A6E', // Sky 900
                secondary: '#0EA5E9',
                background: '#F0F9FF', // Sky 50
                surface: '#FFFFFF',
                text: '#0C4A6E',
            },
            dark: {
                primary: '#38BDF8', // Sky 400
                secondary: '#0EA5E9',
                background: '#0B1120', // Deep Blue
                surface: '#162032',
                text: '#E0F2FE',
            }
        }
    },
    {
        id: 'forest',
        name: 'Forest (Verde)',
        colors: {
            light: {
                primary: '#14532D', // Green 900
                secondary: '#22C55E',
                background: '#F0FDF4', // Green 50
                surface: '#FFFFFF',
                text: '#14532D',
            },
            dark: {
                primary: '#4ADE80', // Green 400
                secondary: '#22C55E',
                background: '#052E16', // Green 950
                surface: '#14532D',
                text: '#DCFCE7',
            }
        }
    },
    {
        id: 'sunset',
        name: 'Sunset (Naranja/Rojo)',
        colors: {
            light: {
                primary: '#7C2D12', // Orange 900
                secondary: '#F97316',
                background: '#FFF7ED', // Orange 50
                surface: '#FFFFFF',
                text: '#431407',
            },
            dark: {
                primary: '#FB923C', // Orange 400
                secondary: '#EA580C',
                background: '#431407', // Orange 950
                surface: '#7C2D12',
                text: '#FFEDD5',
            }
        }
    }
];

export const getThemeById = (id) => THEMES.find(t => t.id === id) || THEMES[0];
