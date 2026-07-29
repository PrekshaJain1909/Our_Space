import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import './dashboardTheme.css';
import './Dashboard.css';
import Navbar from './Navbar';
import HeroCard from './HeroCard';
import TogetherCounter from './TogetherCounter';

export default function Dashboard() {
    const [couple, setCouple] = useState(null);
    const [summary, setSummary] = useState('');

    useEffect(() => {
        let mounted = true;

        async function loadAll() {
            try {
                const [coupleRes, loveRes, memRes, healRes, recentMemRes] = await Promise.all([
                    axiosClient.get('/couple'),
                    axiosClient.get('/love-notes/stats'),
                    axiosClient.get('/memories/stats'),
                    axiosClient.get('/healing/stats/overview'),
                    axiosClient.get('/memories?limit=6')
                ]);

                if (!mounted) return;

                setCouple(coupleRes?.data?.data || { name: 'Couple Name', startDate: null });

                const loveCount = loveRes?.data?.data?.total || 0;
                const memCount = memRes?.data?.data?.total || 0;
                const healPending = healRes?.data?.data?.pending || 0;
                const recentMemList = recentMemRes?.data?.data || [];

                setSummary(`You've shared ${loveCount} love notes, created ${memCount} memories, and have ${healPending} healing items pending. Consider writing an appreciation note today or planning a cozy date night.`);
            } catch (err) {
                if (!mounted) return;
                setSummary('Unable to load dashboard insights right now.');
                setCouple({ name: 'Couple Name' });
            }
        }

        loadAll();
        return () => { mounted = false; };
    }, []);

    const refresh = () => {
        setSummary('Refreshing...');
        // re-run the same loaders
        Promise.all([
            axiosClient.get('/love-notes/stats'),
            axiosClient.get('/memories/stats'),
            axiosClient.get('/healing/stats/overview')
        ]).then(([loveRes, memRes, healRes]) => {
            try {
                const loveCount = loveRes?.data?.data?.total || 0;
                const memCount = memRes?.data?.data?.total || 0;
                const healPending = healRes?.data?.data?.pending || 0;

                setSummary(`You've shared ${loveCount} love notes, created ${memCount} memories, and have ${healPending} healing items pending.`);
            } catch (e) {
                setSummary('Failed to refresh');
            }
        }).catch(() => setSummary('Failed to refresh'));
    };

    return (
        <div className="dashboard-root">
            <aside className="dash-sidebar card">
                <h4 style={{ marginTop: 4 }}>Together</h4>
                <p style={{ color: 'var(--muted)' }}>Your relationship hub</p>
            </aside>

            <main className="dash-main">
                <Navbar couple={couple} />

                <div className="dash-grid">
                    <div className="col-span-8">
                        <HeroCard summary={summary} onRefresh={refresh} />
                    </div>

                    <div className="col-span-4">
                        <TogetherCounter startDate={couple?.startDate || '2021-01-01'} />
                    </div>

                    <div className="col-span-4">
                        <div className="card">Relationship Health (placeholder)</div>
                    </div>

                    <div className="col-span-8">
                        <div className="card">Love Activity Chart (placeholder)</div>
                    </div>
                </div>
            </main>
        </div>
    );
}
