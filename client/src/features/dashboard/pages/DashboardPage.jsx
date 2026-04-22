import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TodayMoodWidget from "../components/TodayMoodWidget";
import QuickLinksGrid from "../components/QuickLinksGrid";
import NextPromiseCard from "../components/NextPromiseCard";
import BucketProgressCard from "../components/BucketProgressCard";
import PunishmentSummaryCard from "../components/PunishmentSummaryCard";
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
  const isActiveCouple = Boolean(user?.isActive);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-overlay" />

      <div className="dashboard-inner">
        <header className="dashboard-header">
          <span className="dashboard-badge">Dashboard</span>
          <h1 className="dashboard-title">Welcome back, {displayName} ✨</h1>
          <p className="dashboard-subtitle">
            {isActiveCouple
              ? "Your shared space is active. Here is your relationship pulse for today."
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
                moodLabel: isActiveCouple ? "No mood set" : "Not connected yet",
                note: isActiveCouple
                  ? "Waiting for partner mood update."
                  : "Invite your partner to start sharing mood check-ins.",
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
        </section>
      </div>
    </div>
  );
}
