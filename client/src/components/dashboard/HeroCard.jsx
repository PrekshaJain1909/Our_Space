import React from 'react';

export default function HeroCard({ summary, onRefresh }) {
    return (
        <div className="card hero-card">
            <div className="hero-body">
                <h3 style={{ margin: 0 }}>🤖 AI Relationship Summary</h3>
                <p style={{ color: 'var(--muted)' }}>{summary || 'Loading AI insights...'}</p>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn-primary">Ask for a plan</button>
                    <button className="btn-ghost">Save summary</button>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <small style={{ color: 'var(--muted)' }}>Updated 3 minutes ago</small>
                <button onClick={onRefresh} aria-label="refresh">⟳</button>
                <img className="hero-illustration" src="/assets/ai-illustration.png" alt="AI" />
            </div>
        </div>
    );
}
