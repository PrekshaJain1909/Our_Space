import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HabitCalendar from "../components/HabitCalendar";
import HabitSummary from "../components/HabitSummary";
import HabitHistoryTimeline from "../components/HabitHistoryTimeline";
import CoupleContext from "../../../context/CoupleContext";

export default function HabitDetailPage() {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customHabits:v1') || '[]'); } catch (e) { return [] }
  });

  const handleBack = () => {
    if (location.state?.fromAnalytics) {
      navigate('/analytics');
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const onStorage = () => {
      try { setHabits(JSON.parse(localStorage.getItem('customHabits:v1') || '[]')); } catch (e) { }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const habit = useMemo(() => habits.find(h => h.id === habitId), [habits, habitId]);

  const saveHabit = (updated) => {
    const next = habits.map(h => h.id === habitId ? { ...h, ...updated } : h);
    setHabits(next);
    try { localStorage.setItem('customHabits:v1', JSON.stringify(next)); } catch (e) { }
  };

  if (!habit) return (
    <div className="p-6">
      <div className="mb-4">
        <button type="button" onClick={handleBack} className="memory-modal-back-btn">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>
      <div className="text-gray-400">Habit not found. Return to <span onClick={() => navigate('/analytics')} className="underline cursor-pointer">Analytics</span>.</div>
    </div>
  );

  const { couple } = useContext(CoupleContext);

  let updaterName = "";
  if (habit.ownerName && couple) {
    const a = couple.partnerA?.name || couple.partnerA;
    const b = couple.partnerB?.name || couple.partnerB;
    if (a === habit.ownerName) updaterName = b;
    else if (b === habit.ownerName) updaterName = a;
  }

  return (
    <div className="analytics-wrapper smoking-page">
      <div className="analytics-overlay" />
      <div className="analytics-inner smoking-inner">

        <div className="analytics-back-row">
          <button type="button" onClick={handleBack} className="memory-modal-back-btn">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        <header className="healing-hero-card">
          <div className="healing-hero-glow" />

          <p className="healing-badge">
            {habit.name} Progress
          </p>

          <p className="healing-subtitle">
            Tracked For{" "}
            {updaterName ? (
              <strong>{habit.ownerName || "You"}</strong>
            ) : (
              "You"
            )}
          </p>

          <p className="healing-subtitle">
            {updaterName
              ? `Last updated by ${updaterName}`
              : "You are the only one tracking this habit."}
          </p>
        </header>


        <div className="smoking-dashboard-grid">
          <div className="smoking-main-panel">


            <div className="smoking-calendar-panel">
              <HabitCalendar habit={habit} onSave={(updatedHistory) => saveHabit({ history: updatedHistory })} />
            </div>
          </div>

          <aside className="smoking-summary-panel">
            <HabitSummary habit={habit} />
          </aside>
        </div>

        <HabitHistoryTimeline habit={habit} />
      </div>
    </div>
  );
}
