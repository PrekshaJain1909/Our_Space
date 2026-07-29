import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TodayMoodWidget from "../components/TodayMoodWidget";
import QuickLinksGrid from "../components/QuickLinksGrid";
import NextPromiseCard from "../components/NextPromiseCard";
import BucketProgressCard from "../components/BucketProgressCard";
import PunishmentSummaryCard from "../components/PunishmentSummaryCard";
import AnalyticsPreview from "../components/AnalyticsPreview";
import MoodOverview from "../components/MoodOverview";
import LoveActivityChart from "../components/LoveActivityChart";
import AISummaryCard from "../components/AISummaryCard";
import RecentMemories from "../components/RecentMemories";
import RecentLoveNotes from "../components/RecentLoveNotes";
import Footer from "../components/Footer";
import useDashboardData from "../hooks/useDashboardData";
import "./DashboardPage.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem("user");

      try {
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener("user-data-updated", syncUser);
    window.addEventListener("auth-token-updated", syncUser);
    return () => {
      window.removeEventListener("user-data-updated", syncUser);
      window.removeEventListener("auth-token-updated", syncUser);
    };
  }, []);

  const quickLinks = useMemo(
    () => [
      {
        id: "love-notes",
        label: "Love Notes",
        description: "Write one sweet note today",
        emoji: "💌",
        to: "/love-notes",
      },
      {
        id: "mood",
        label: "Mood Check",
        description: "Track how both of you feel",
        emoji: "😊",
        to: "/mood",
      },
      {
        id: "healing",
        label: "Healing Zone",
        description: "Promises, repairs, and growth",
        emoji: "💗",
        to: "/healing-zone",
      },
      {
        id: "bucket",
        label: "Bucket List",
        description: "Shared dreams to complete",
        emoji: "🎯",
        to: "/bucket",
      },
    ],
    []
  );

  const displayName = user?.name || "Guest";
  const { data, loading, error, refresh } = useDashboardData();
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay" />

      <div className="dashboard-inner">


        <header className="memory-hero">
          <div className="memory-hero-copy">
            <p className="memory-badge">Dashboard</p>
            <h1>Welcome back, {displayName} ✨</h1>
          </div>
          <p className="dashboard-subtitle">
            {user
              ? "Your space is ready — create, edit, and share memories together ✨"
              : "Browse everything in guest mode. Login or register when you are ready to edit."}
          </p>
        </header>

        <section className="dashboard-column">
          <div className="dashboard-block">
            <TodayMoodWidget
              you={{
                name: user?.name || "You",
                emoji: "🙂",
                moodLabel: "No mood set",
                note: "Add your mood check-in for today.",
              }}
              partner={{
                name: "Partner",
                emoji: "🙂",
                moodLabel: "Not connected yet",
                note: "Invite your partner to start sharing mood check-ins.",
              }}
              onUpdateClick={() => navigate("/mood")}
            />
          </div>

          <div className="dashboard-block">
            <QuickLinksGrid links={quickLinks} onNavigate={(to) => navigate(to)} />
          </div>

          <div className="dashboard-block">
            <NextPromiseCard
              nextPromise={null}
              onViewAll={() => navigate("/healing-zone")}
            />
          </div>

          <div className="dashboard-block">
            <BucketProgressCard
              total={0}
              completed={0}
              onViewClick={() => navigate("/bucket")}
            />
          </div>

          <div className="dashboard-block">
            <PunishmentSummaryCard
              pending={0}
              completed={0}
              maleCompleted={0}
              femaleCompleted={0}
              onViewClick={() => navigate("/healing-zone")}
            />
          </div>

          <div className="dashboard-block">
            {loading ? (
              <div style={{ padding: 12 }}>Loading dashboard…</div>
            ) : (
              <div className="dashboard-grid">
                <div className="grid-item grid-span-2">
                  <AnalyticsPreview stats={data?.analytics} />
                  <div style={{ height: 12 }} />
                  <LoveActivityChart series={data?.activitySeries} />
                </div>

                <div className="grid-item">
                  <AISummaryCard summary={data?.aiSummary} updatedAt={data?.aiUpdatedAt} onRefresh={refresh} />
                  <div style={{ height: 12 }} />
                  <MoodOverview distribution={data?.moodDistribution} />
                  <div style={{ height: 12 }} />
                  <RecentMemories items={data?.recentMemories} />
                  <div style={{ height: 12 }} />
                  <RecentLoveNotes items={data?.recentNotes} />
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-block">
            <Footer />
          </div>
        </section>
      </div>
    </div>
  );
}
