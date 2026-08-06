import React from 'react';
import styles from './AnalyticsPreview.module.css';
import ThemeCard from './ThemeCard';

export default function AnalyticsPreview({ stats = {} }) {
    const items = [
        { label: 'Love Notes', value: stats?.loveNotes || '12' },
        { label: 'Mood Score', value: `${stats?.moodScore || 82}%` },
        { label: 'Memories', value: stats?.memories || '8' },
    ];

    return (
        <ThemeCard className={styles.card}>
            <div className={styles.grid}>
                {items.map((it) => (
                    <div key={it.label} className={styles.item}>
                        <div className={styles.value}>{it.value}</div>
                        <div className={styles.label}>{it.label}</div>
                    </div>
                ))}
            </div>
        </ThemeCard>
    );
}
