import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './LoveActivityChart.module.css';

export default function LoveActivityChart({ series = [] }) {
    // series expected: [{date,label, loveNotes, memories, mood, healing, playtime}]
    const data = series.length ? series : Array.from({ length: 7 }).map((_, i) => ({ date: `Day ${i + 1}`, loveNotes: Math.random() * 4, memories: Math.random() * 3, mood: Math.random() * 5, healing: Math.random() * 2, playtime: Math.random() * 3 }));

    return (
        <div className={styles.card}>
            <h4>Love Activity (Last 7 days)</h4>
            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="loveNotes" stroke="#e854b8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="memories" stroke="#8a5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="mood" stroke="#61d24d" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
