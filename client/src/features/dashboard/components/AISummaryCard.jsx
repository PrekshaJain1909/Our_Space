import React from 'react';
import styles from './AISummaryCard.module.css';
import ThemeCard from './ThemeCard';
import { motion } from 'framer-motion';

export default function AISummaryCard({ summary, stats = {}, activeDays = 0, onRefresh }) {
    const hasSummary = Boolean(summary);
    const requiredDays = 5;
    const progress = Math.min(100, Math.round((activeDays / requiredDays) * 100));

    return (
        <ThemeCard as={motion.article} className={styles.card} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.header}>
                <div className={styles.headerMeta}>
                    <div className={styles.tag}>AI Relationship Summary</div>
                    <div className={styles.titleRow}>
                        <h3 className={styles.title}>Your relationship pulse</h3>
                        <div className={styles.badgeIcon}>💜</div>
                    </div>
                </div>
                {hasSummary && (
                    <button className={styles.refresh} onClick={onRefresh}>Refresh</button>
                )}
            </div>

            {hasSummary ? (
                <div className={styles.summaryCard}>
                    <p className={styles.summary}>{summary}</p>
                    <div className={styles.summaryList}>
                        <span>❤️ {stats?.loveNotes || 0} love notes exchanged</span>
                        <span>📸 {stats?.memories || 0} memories created</span>
                        <span>😊 Happy mood on {stats?.happyMoodDays || 0} days</span>
                        <span>🌸 Healing used {stats?.healingLogs || 0} times</span>
                        <span>💍 Wedding planning updated {stats?.weddingUpdates || 0} times</span>
                    </div>
                </div>
            ) : (
                <div className={styles.onboardingCard}>
                    <p className={styles.onboardingTitle}>Need 5 days of relationship activity to generate your first AI summary.</p>
                    <p className={styles.onboardingText}>Keep using Together by writing Love Notes, updating your Mood, saving Memories and completing Healing entries.</p>

                    <div className={styles.progressRow}>
                        <div className={styles.progressLabel}>Current Progress</div>
                        <div className={styles.progressAmount}>Day {activeDays} / {requiredDays}</div>
                    </div>

                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <div className={styles.progressPercent}>{progress}%</div>

                    <div className={styles.statsGrid}>
                        <div>• Love Notes: {stats?.loveNotes || 0}</div>
                        <div>• Mood Entries: {stats?.moodEntries || 0}</div>
                        <div>• Memories: {stats?.memories || 0}</div>
                        <div>• Healing Logs: {stats?.healingLogs || 0}</div>
                    </div>

                    <div className={styles.unlockText}>✨ AI Summary unlocks automatically after 5 active days.</div>
                </div>
            )}
        </ThemeCard>
    );
}
