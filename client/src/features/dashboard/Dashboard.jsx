import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import GreetingCard from './components/GreetingCard';
import AISummaryCard from './components/AISummaryCard';
import RelationshipDurationCard from './components/RelationshipDurationCard';
import RelationshipHealthCard from './components/RelationshipHealthCard';
import QuickActions from './components/QuickActions';
import RecentMemories from './components/RecentMemories';
import RecentLoveNotes from './components/RecentLoveNotes';
import MoodOverview from './components/MoodOverview';
import AnalyticsPreview from './components/AnalyticsPreview';
import Footer from './components/Footer';
import styles from './Dashboard.module.css';
import useDashboardData from './hooks/useDashboardData';

const LoveActivityChart = lazy(() => import('./components/LoveActivityChart'));

export default function Dashboard() {
    const { data, loading, error, refresh } = useDashboardData();

    return (
        <div className={styles.page}>
            <div className={styles.topRow}>
                <AISummaryCard summary={data?.aiSummary} stats={data?.summaryStats} activeDays={data?.activeDays} onRefresh={refresh} />
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.mainColumn}>
                    <div className={styles.chartsRow}>
                        <motion.div layout className={styles.chartCard}>
                            <Suspense fallback={<div className={styles.chartFallback}>Loading chart…</div>}>
                                <LoveActivityChart series={data?.activitySeries} />
                            </Suspense>
                        </motion.div>

                        <div className={styles.sideCards}>
                            <RelationshipDurationCard startedAt={data?.coupleStartedAt} />
                            <RelationshipHealthCard stats={data?.health} />
                        </div>
                    </div>

                    <div className={styles.actionRow}>
                        <QuickActions actions={data?.actions} />
                    </div>

                    <div className={styles.contentRow}>
                        <RecentMemories items={data?.recentMemories} />
                        <RecentLoveNotes notes={data?.recentNotes} />
                        <MoodOverview distribution={data?.moodDistribution} />
                    </div>
                </div>

                <div className={styles.asideColumn}>
                    <AnalyticsPreview stats={data?.analytics} />
                    <Footer />
                </div>
            </div>
        </div>
    );
}
