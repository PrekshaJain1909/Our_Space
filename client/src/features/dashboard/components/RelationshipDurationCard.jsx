import React from 'react';
import styles from './RelationshipDurationCard.module.css';
import ThemeCard from './ThemeCard';
import { motion } from 'framer-motion';

function humanDuration(start) {
    if (!start) return { years: 0, months: 0, days: 0 };
    const s = new Date(start);
    const now = new Date();
    let years = now.getFullYear() - s.getFullYear();
    let months = now.getMonth() - s.getMonth();
    let days = now.getDate() - s.getDate();
    if (days < 0) { months -= 1; days += 30; }
    if (months < 0) { years -= 1; months += 12; }
    return { years, months, days };
}

export default function RelationshipDurationCard({ startedAt }) {
    const { years, months, days } = humanDuration(startedAt);
    return (
        <ThemeCard as={motion.div} className={styles.card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.head}>Together Since</div>
            <div className={styles.photo}>👩‍❤️‍👨</div>
            <div className={styles.counts}>
                <div><strong>{years}</strong><span>Years</span></div>
                <div><strong>{months}</strong><span>Months</span></div>
                <div><strong>{days}</strong><span>Days</span></div>
            </div>
        </ThemeCard>
    );
}
