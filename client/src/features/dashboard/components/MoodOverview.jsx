import React from 'react';
import styles from './MoodOverview.module.css';
import ThemeCard from './ThemeCard';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#61d24d', '#f96fb7', '#b9b4f0', '#ef5e7a', '#5573ff', '#ff7a85'];

export default function MoodOverview({ distribution = {} }) {
    const entries = Object.keys(distribution).map((k) => ({ name: k, value: distribution[k] }));
    const total = entries.reduce((s, e) => s + e.value, 0) || 1;

    const rootStyles = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const tooltipBg = rootStyles?.getPropertyValue('--card-bg').trim() || 'rgba(30, 18, 50, 0.92)';
    const tooltipText = rootStyles?.getPropertyValue('--text-secondary').trim() || '#CFC6E8';

    return (
        <ThemeCard className={styles.card}>
            <h4>Mood Overview</h4>
            <div className={styles.inner}>
                <PieChart width={220} height={160}>
                    <Pie data={entries} dataKey="value" nameKey="name" cx={110} cy={80} innerRadius={36} outerRadius={64} paddingAngle={4}>
                        {entries.map((entry, idx) => (
                            <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: tooltipBg, border: '1px solid var(--card-border)', borderRadius: '12px', color: tooltipText }} />
                </PieChart>
                <div className={styles.legend}>
                    {entries.map((e) => (
                        <div key={e.name} className={styles.legendRow}><span className={styles.dot} /> {e.name} <strong>{Math.round((e.value / total) * 100)}%</strong></div>
                    ))}
                </div>
            </div>
        </ThemeCard>
    );
}
