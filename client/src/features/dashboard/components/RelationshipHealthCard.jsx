import React from 'react';
import styles from './RelationshipHealthCard.module.css';
import { motion } from 'framer-motion';

export default function RelationshipHealthCard({ stats = {} }) {
    const hasData = Object.keys(stats).length > 0;
    const score = hasData ? stats.averageMood || 0 : null;
    const items = [
        { label: 'Communication', value: stats.communication ?? 0 },
        { label: 'Time Together', value: stats.timeTogether ?? 0 },
        { label: 'Mood', value: stats.mood ?? 0 },
        { label: 'Promises', value: stats.promises ?? 0 },
        { label: 'Healing', value: stats.healing ?? 0 },
    ];

    return (
        <motion.div className={styles.card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.left}>
                <div className={styles.circle}>{hasData ? `${score}%` : '--'}</div>
                <div className={styles.label}>Relationship Score</div>
                {!hasData && <div className={styles.note}>Not enough activity yet.</div>}
            </div>
            <div className={styles.right}>
                {hasData ? (
                    items.map((it) => (
                        <div key={it.label} className={styles.barRow}>
                            <div className={styles.barLabel}>{it.label}</div>
                            <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${it.value}%` }} /></div>
                            <div className={styles.barValue}>{it.value}%</div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>💜</div>
                        <p>Relationship health will appear once you log more activity.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
