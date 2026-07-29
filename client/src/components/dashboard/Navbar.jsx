import React from 'react';
import ThemeToggle from './ThemeToggle';

function useGreeting(coupleName) {
    const hour = new Date().getHours();
    const label = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const emoji = hour < 12 ? '☀️' : hour < 18 ? '💜' : '🌙';
    return `${label}, ${coupleName || 'Couple Name'}! ${emoji}`;
}

export default function Navbar({ couple }) {
    return (
        <div className="dash-navbar">
            <div style={{ flex: 1 }} />
            <div style={{ flex: 2, textAlign: 'center' }}>
                <h2 className="greeting">{useGreeting(couple?.name)}</h2>
                <p className="subtitle">Every memory deserves a beautiful place.</p>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
                <button aria-label="notifications" className="icon-btn">🔔</button>
                <ThemeToggle />
                <div style={{ width: 36, height: 36, borderRadius: 999, overflow: 'hidden', background: 'var(--border)' }}>
                    {couple?.avatar ? <img src={couple.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>👫</div>}
                </div>
            </div>
        </div>
    );
}
