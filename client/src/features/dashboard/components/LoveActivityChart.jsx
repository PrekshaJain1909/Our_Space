import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import ThemeCard from './ThemeCard';
import styles from './LoveActivityChart.module.css';

export default function LoveActivityChart({ series = [] }) {
    // series expected: [{date,label, loveNotes, memories, mood, healing, playtime}]
    const data = series.length ? series : Array.from({ length: 7 }).map((_, i) => ({ date: `Day ${i + 1}`, loveNotes: Math.random() * 4, memories: Math.random() * 3, mood: Math.random() * 5, healing: Math.random() * 2, playtime: Math.random() * 3 }));
    const rootStyles = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const textColor = rootStyles?.getPropertyValue('--text-primary').trim() || '#FFFFFF';
    const secondaryColor = rootStyles?.getPropertyValue('--text-secondary').trim() || '#CFC6E8';
    const gridColor = rootStyles?.getPropertyValue('--card-border').trim() || 'rgba(255,255,255,0.08)';
    const tooltipBg = rootStyles?.getPropertyValue('--card-bg').trim() || 'rgba(30, 18, 50, 0.92)';

    return (
        <ThemeCard className={styles.card}>
            <h4>Love Activity (Last 7 days)</h4>
            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data}>
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: tooltipBg,
                            border: `1px solid ${gridColor}`,
                            borderRadius: '16px',
                            color: secondaryColor,
                        }}
                        labelStyle={{ color: secondaryColor }}
                        itemStyle={{ color: secondaryColor }}
                    />
                    <Legend wrapperStyle={{ color: textColor, fontSize: 12 }} />
                    <Line type="monotone" dataKey="loveNotes" stroke="#ff75c6" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="memories" stroke="#8a5cf6" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="mood" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </ThemeCard>
    );
}
