import React from 'react';
import styles from './GreetingCard.module.css';
import { motion } from 'framer-motion';

export default function GreetingCard({ coupleName = 'You & Love' }) {
    return (
        <motion.section className={styles.card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.left}>
                <h3>Good Morning,</h3>
                <h1>{coupleName} ❤️</h1>
                <p>Every moment with you is another beautiful memory.</p>
            </div>
            <div className={styles.right}>
                <div className={styles.meta}>Today • <strong>Live</strong></div>
            </div>
        </motion.section>
    );
}
