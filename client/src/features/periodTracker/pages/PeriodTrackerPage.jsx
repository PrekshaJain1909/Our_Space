import React, { useState, useEffect } from "react";
import {
  getPeriodSettings,
  savePeriodSettings,
  getPeriodCalendar,
  confirmTodayPeriod,
  savePeriodDailyLog,
  getPeriodSurprises,
  createPeriodSurprise,
  deletePeriodSurprise,
  getPeriodStats,
} from "../../../api/periodApi";

import FirstTimeSetupModal from "../components/FirstTimeSetupModal";
import PhaseStudioModal from "../components/PhaseStudioModal";
import TodayPeriodBanner from "../components/TodayPeriodBanner";
import PeriodCalendarView from "../components/PeriodCalendarView";
import SurprisePlanner from "../components/SurprisePlanner";
import MoodSymptomTracker from "../components/MoodSymptomTracker";
import PeriodStats from "../components/PeriodStats";

import { FaCalendarAlt, FaGift, FaSmile, FaChartBar, FaCog } from "react-icons/fa";

export default function PeriodTrackerPage() {
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' | 'surprises' | 'mood' | 'stats' | 'settings'

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [userGender, setUserGender] = useState(null);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const [baseStartDate, setBaseStartDate] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [surprises, setSurprises] = useState([]);
  const [stats, setStats] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPhaseStudio, setShowPhaseStudio] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingPhaseStudio, setIsSavingPhaseStudio] = useState(false);

  // Load Initial Settings & Setup Status
  const fetchSettingsAndStatus = async () => {
    try {
      setIsLoading(true);
      const data = await getPeriodSettings();
      setSettings(data.settings);
      setUserGender(data.userGender);

      if (!data.settings) {
        setShowSetupModal(true);
      } else {
        await loadCalendarData(currentYear, currentMonth);
        await loadSurprises();
        await loadStats();
      }
    } catch (err) {
      console.error("Failed to load period tracker settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCalendarData = async (year, month) => {
    try {
      const res = await getPeriodCalendar(year, month);
      if (res.isConfigured) {
        setSettings(res.settings);
        setBaseStartDate(res.baseStartDate);
        setCycles(res.cycles || []);
        setLogs(res.logs || []);
        setSurprises(res.surprises || []);
        setUserGender(res.userGender);
      }
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    }
  };

  const loadSurprises = async () => {
    try {
      const res = await getPeriodSurprises();
      setSurprises(res.surprises || []);
    } catch (err) {
      console.error("Failed to load surprises:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getPeriodStats();
      setStats(res.stats || null);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  useEffect(() => {
    fetchSettingsAndStatus();
  }, []);

  const handleMonthYearChange = (year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    loadCalendarData(year, month);
  };

  const handleSaveSetup = async (formData) => {
    try {
      setIsSavingSettings(true);
      const res = await savePeriodSettings(formData);
      setSettings(res.settings);
      setUserGender(res.userGender);
      setShowSetupModal(false);
      await loadCalendarData(currentYear, currentMonth);
      await loadStats();
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSavePhaseStudio = async (updatedPhases) => {
    try {
      setIsSavingPhaseStudio(true);
      const res = await savePeriodSettings({
        lastPeriodStart: settings?.lastPeriodStart,
        cycleLength: settings?.cycleLength,
        periodLength: settings?.periodLength,
        gender: userGender,
        phases: updatedPhases,
      });
      setSettings(res.settings);
      setShowPhaseStudio(false);
      await loadCalendarData(currentYear, currentMonth);
      await loadStats();
    } catch (err) {
      console.error("Failed to save phase studio:", err);
    } finally {
      setIsSavingPhaseStudio(false);
    }
  };

  const handleConfirmPeriod = async (payload) => {
    try {
      await confirmTodayPeriod(payload);
      await loadCalendarData(currentYear, currentMonth);
      await loadSurprises();
      await loadStats();
    } catch (err) {
      console.error("Failed to confirm period:", err);
    }
  };

  const handleSaveDailyLog = async (logData) => {
    try {
      await savePeriodDailyLog(logData);
      await loadCalendarData(currentYear, currentMonth);
    } catch (err) {
      console.error("Failed to save daily log:", err);
    }
  };

  const handleCreateSurprise = async (surpriseData) => {
    try {
      await createPeriodSurprise(surpriseData);
      await loadSurprises();
    } catch (err) {
      console.error("Failed to create surprise:", err);
    }
  };

  const handleDeleteSurprise = async (id) => {
    try {
      await deletePeriodSurprise(id);
      await loadSurprises();
    } catch (err) {
      console.error("Failed to delete surprise:", err);
    }
  };

  const isFemale = userGender === "female";
  const selectedLog = logs.find((l) => l.date === selectedDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in text-primary">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-theme rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2">
            <span>🌸 Shared Period Tracker</span>
          </h1>
          <p className="text-sm text-secondary">
            Sync cycles, track mood & symptoms, and unlock private partner surprises together.
          </p>
        </div>

        <button
          onClick={() => setShowSetupModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-theme hover:bg-surface-subtle transition-all flex items-center gap-2"
        >
          <FaCog className="text-pink-500" /> Tracker Settings
        </button>
      </div>

      {/* Today is My Period Action Banner */}
      <TodayPeriodBanner
        settings={settings}
        onConfirmPeriod={handleConfirmPeriod}
        isFemale={isFemale}
      />

      {/* Period History */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-surface border border-theme rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                🩸 Period History
              </p>
              <h2 className="mt-2 text-xl font-bold text-primary">Confirmed start dates</h2>
              <p className="mt-2 text-sm text-secondary max-w-xl">
                Keep track of confirmed cycle starts only — no extra details, just the dates that matter.
              </p>
            </div>
            {cycles.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllHistory((prev) => !prev)}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500 hover:text-pink-600"
              >
                {showAllHistory ? "Show less" : "View all →"}
              </button>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {cycles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-theme bg-surface-subtle p-6 text-center text-sm text-secondary">
                No confirmed period history yet. Confirm your next period to begin automatic tracking.
              </div>
            ) : (
              (showAllHistory ? cycles : cycles.slice(0, 4)).map((cycle) => (
                <div
                  key={cycle._id}
                  className="flex items-center justify-between rounded-3xl border border-theme/70 bg-surface-subtle p-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-primary">
                      {new Date(cycle.startDate).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-secondary">Confirmed period start</div>
                  </div>
                  <div className="text-2xl">🩸</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface border border-theme rounded-3xl p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
            Premium insights
          </div>
          <div className="mt-4 space-y-3 text-sm text-secondary">
            <p>Automatic predictions update when your partner confirms today's period.</p>
            <p>Phase colors, calendar emojis, and history refresh immediately.</p>
            <p>Tap Manage Phases any time to tune the experience for your relationship.</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-surface border border-theme rounded-2xl text-xs font-semibold no-scrollbar">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "calendar"
              ? "bg-pink-500 text-white shadow-md font-bold"
              : "text-secondary hover:text-primary hover:bg-surface-subtle"
          }`}
        >
          <FaCalendarAlt /> Calendar & Phases
        </button>

        <button
          onClick={() => setActiveTab("surprises")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "surprises"
              ? "bg-pink-500 text-white shadow-md font-bold"
              : "text-secondary hover:text-primary hover:bg-surface-subtle"
          }`}
        >
          <FaGift /> Surprise Planner
        </button>

        <button
          onClick={() => setActiveTab("mood")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "mood"
              ? "bg-pink-500 text-white shadow-md font-bold"
              : "text-secondary hover:text-primary hover:bg-surface-subtle"
          }`}
        >
          <FaSmile /> Mood & Symptoms
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "stats"
              ? "bg-pink-500 text-white shadow-md font-bold"
              : "text-secondary hover:text-primary hover:bg-surface-subtle"
          }`}
        >
          <FaChartBar /> Statistics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "calendar" && (
        <PeriodCalendarView
          settings={settings}
          baseStartDate={baseStartDate}
          logs={logs}
          surprises={surprises}
          onOpenPhaseStudio={() => setShowPhaseStudio(true)}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setActiveTab("mood");
          }}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onChangeMonthYear={handleMonthYearChange}
        />
      )}

      {activeTab === "surprises" && (
        <SurprisePlanner
          surprises={surprises}
          isFemale={isFemale}
          onCreateSurprise={handleCreateSurprise}
          onDeleteSurprise={handleDeleteSurprise}
        />
      )}

      {activeTab === "mood" && (
        <MoodSymptomTracker
          selectedDate={selectedDate}
          existingLog={selectedLog}
          onSaveLog={handleSaveDailyLog}
        />
      )}

      {activeTab === "stats" && <PeriodStats stats={stats} />}

      {/* First Time Setup Modal */}
      <FirstTimeSetupModal
        isOpen={showSetupModal}
        initialData={settings}
        userGender={userGender}
        onSave={handleSaveSetup}
        isSaving={isSavingSettings}
      />

      {/* Phase Studio Modal */}
      <PhaseStudioModal
        isOpen={showPhaseStudio}
        phases={settings?.phases || []}
        cycleLength={settings?.cycleLength || 28}
        periodLength={settings?.periodLength || 5}
        onClose={() => setShowPhaseStudio(false)}
        onSave={handleSavePhaseStudio}
        isSaving={isSavingPhaseStudio}
      />
    </div>
  );
}
