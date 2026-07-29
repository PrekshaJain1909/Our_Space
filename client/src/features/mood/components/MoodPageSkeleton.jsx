import React from 'react';
import styles from '../pages/MoodPage.module.css';
import { motion } from 'framer-motion';

export default function MoodPageSkeleton() {
    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className={styles.hero}
                >
                    <div className={styles.heroContent}>
                        <div className={styles.badge}>😊 MOOD & UPSET</div>
                        <div className={styles.title} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 18, height: 42 }} />
                        <div style={{ display: 'grid', gap: 10 }}>
                            <div style={{ height: 16, width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: 12 }} />
                            <div style={{ height: 16, width: '65%', background: 'rgba(255,255,255,0.1)', borderRadius: 12 }} />
                        </div>
                    </div>
                    <div className={styles.heroVisual}>
                        <div style={{ width: 120, height: 120, borderRadius: 28, background: 'rgba(255,255,255,0.12)' }} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
