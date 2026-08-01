import { useEffect, useState, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';

export default function useDashboardData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // These endpoints are placeholders and should exist server-side.
            const [summaryRes, healthRes, activityRes, memoriesRes, notesRes, moodRes, analyticsRes] = await Promise.all([
                axiosClient.get('/moods/summary'),
                axiosClient.get('/moods/stats/month'),
                axiosClient.get('/moods/trend'),
                axiosClient.get('/memories?limit=6'),
                axiosClient.get('/love-notes?limit=5'),
                axiosClient.get('/moods/distribution'),
                axiosClient.get('/analytics/overview'),
            ]);

            setData({
                coupleName: 'You & Love',
                aiSummary: summaryRes?.data?.data?.summary || summaryRes?.data?.data || null,
                aiUpdatedAt: new Date().toISOString(),
                coupleStartedAt: null,
                health: healthRes?.data?.data || null,
                activitySeries: activityRes?.data?.data || [],
                recentMemories: memoriesRes?.data?.data || [],
                recentNotes: notesRes?.data?.data || [],
                moodDistribution: moodRes?.data?.data || {},
                analytics: analyticsRes?.data?.data || {},
                actions: [
                    { id: 'note', title: 'Write Love Note' },
                    { id: 'memory', title: 'Add Memory' },
                    { id: 'mood', title: 'Update Mood' },
                    { id: 'play', title: 'Start Playtime' },
                ],
            });
        } catch (err) {
            console.error('Dashboard load failed', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refresh: fetch };
}
