import React from 'react';
import styles from './MoodOverview.module.css';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#61d24d', '#f96fb7', '#b9b4f0', '#ef5e7a', '#5573ff', '#ff7a85'];

export default function MoodOverview({ distribution = {} }) {
    const entries = Object.keys(distribution).map((k) => ({ name: k, value: distribution[k] }));
    const total = entries.reduce((s, e) => s + e.value, 0) || 1;

    return (
        <div className={styles.card}>
            <h4>Mood Overview</h4>
            <div className={styles.inner}>
                <PieChart width={220} height={160}>
                    <Pie data={entries} dataKey="value" nameKey="name" cx={110} cy={80} innerRadius={36} outerRadius={64} paddingAngle={4}>
                        {entries.map((entry, idx) => (
                            <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                <div className={styles.legend}>
                    {entries.map((e) => (
                        <div key={e.name} className={styles.legendRow}><span className={styles.dot} /> {e.name} <strong>{Math.round((e.value / total) * 100)}%</strong></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
