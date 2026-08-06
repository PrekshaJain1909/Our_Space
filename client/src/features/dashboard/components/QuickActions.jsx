import React from 'react';
import styles from './QuickActions.module.css';
import ThemeCard from './ThemeCard';
import { motion } from 'framer-motion';

export default function QuickActions({ actions = [] }) {
    return (
        <ThemeCard className={styles.card}>
            <div className={styles.grid}>
                {actions.map((a) => (
                    <motion.button key={a.id} whileHover={{ y: -4 }} className={styles.action}>{a.title}</motion.button>
                ))}
            </div>
        </ThemeCard>
    );
}
