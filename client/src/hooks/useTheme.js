import { useContext, useEffect, useState } from 'react';
import UiContext from '../context/UiContext';

function resolveCssVar(name, fallback) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return fallback;
    }

    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}

function buildTheme(mode) {
    const isDark = mode === 'dark';
    const paper = resolveCssVar('--surface', isDark ? '#1c0050' : '#ffffff');
    const textPrimary = resolveCssVar('--text-primary', isDark ? '#ffeefc' : '#1f2937');
    const textSecondary = resolveCssVar('--text-secondary', isDark ? '#d4b5ff' : '#4b5563');
    const divider = resolveCssVar('--card-border', isDark ? 'rgba(255, 0, 127, 0.2)' : 'rgba(96, 125, 255, 0.12)');
    const primaryMain = resolveCssVar('--accent-primary', isDark ? '#ff00ff' : '#a78bfa');
    const primaryDark = resolveCssVar('--accent-secondary', isDark ? '#00ffff' : '#d63384');
    const successMain = resolveCssVar('--color-success', '#38c793');
    const warningMain = resolveCssVar('--color-warning', '#ffc55c');
    const errorMain = resolveCssVar('--color-danger', '#ff5c6c');
    const grey100 = resolveCssVar('--surface-hover', isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6');

    const getContrastText = (color) => {
        if (!color) return '#ffffff';
        const hex = color.replace('#', '');
        const normalized = hex.length === 3
            ? hex.split('').map((char) => char + char).join('')
            : hex;

        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.6 ? '#111827' : '#ffffff';
    };

    return {
        palette: {
            mode,
            common: {
                white: '#ffffff',
                black: '#000000',
            },
            background: {
                paper,
            },
            text: {
                primary: textPrimary,
                secondary: textSecondary,
            },
            divider,
            primary: {
                main: primaryMain,
                dark: primaryDark,
            },
            success: {
                main: successMain,
            },
            warning: {
                main: warningMain,
            },
            error: {
                main: errorMain,
            },
            grey: {
                100: grey100,
            },
            getContrastText,
        },
    };
}

export function useTheme() {
    const ui = useContext(UiContext);
    const [theme, setTheme] = useState(() => {
        const mode = ui?.theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ? 'dark' : 'light';
        return buildTheme(mode);
    });

    useEffect(() => {
        const syncTheme = () => {
            const mode = ui?.theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ? 'dark' : 'light';
            setTheme(buildTheme(mode));
        };

        syncTheme();

        if (typeof document === 'undefined') {
            return undefined;
        }

        const observer = new MutationObserver(syncTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [ui?.theme]);

    return theme;
}

export default useTheme;
