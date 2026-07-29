import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
        try { localStorage.setItem('together:theme', theme); } catch (e) { }
    }, [theme]);

    useEffect(() => {
        const stored = localStorage.getItem('together:theme');
        if (stored) setTheme(stored);
    }, []);

    return (
        <button
            aria-label="Toggle theme"
            className="theme-toggle"
            onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
            style={{
                background: 'transparent',
                border: 'none',
                padding: 8,
                cursor: 'pointer',
                color: 'var(--text)'
            }}
        >
            {theme === 'dark' ? '🌙' : '☀️'}
        </button>
    );
}
