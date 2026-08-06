import React from 'react';
import styles from './RecentMemories.module.css';
import ThemeCard from './ThemeCard';
import { motion } from 'framer-motion';

export default function RecentMemories({ items = [] }) {
    const hasItems = Array.isArray(items) && items.length > 0;

    return (
        <ThemeCard className={styles.card}>
            <div className={styles.header}><h4>Recent Memories</h4><button className={styles.viewAll}>View All</button></div>
            {hasItems ? (
                <div className={styles.grid}>
                    {items.slice(0, 4).map((it, idx) => (
                        <motion.div key={it._id || idx} whileHover={{ scale: 1.03 }} className={styles.item} style={{ backgroundImage: `url(${it.cover || it.photo || ''})` }} />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📷</div>
                    <h4>No memories yet</h4>
                    <p>Start saving your favorite moments to unlock this space.</p>
                </div>
            )}
        </ThemeCard>
    );
}
