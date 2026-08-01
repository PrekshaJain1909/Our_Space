import React, { useMemo } from "react";
import "./Mood.css";

export default function MoodAnalytics({ moodsByDate = {}, upsetLogs = [] }) {
  const stats = useMemo(() => {
    const entries = Object.entries(moodsByDate).map(([date, entry]) => ({
      date,
      ...entry,
    }));

    const totalDays = entries.length;

    const countsByMood = entries.reduce((acc, e) => {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
      return acc;
    }, {});

    let topMood = null;
    let topCount = 0;
    Object.entries(countsByMood).forEach(([mood, count]) => {
      if (count > topCount) {
        topMood = mood;
        topCount = count;
      }
    });

    // Last 7 days average mood score (happy higher, sad/anxious lower)
    const moodScoreMap = {
      excited: 3,
      happy: 2,
      romantic: 2,
      okay: 1,
      tired: 0,
      sad: -1,
      anxious: -1,
      angry: -2,
    };

    const today = new Date();
    const last7 = entries.filter((e) => {
      const d = new Date(e.date);
      const diff = (today - d) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 6;
    });

    const totalScore = last7.reduce(
      (sum, e) => sum + (moodScoreMap[e.mood] ?? 0),
      0
    );
    const avgScore = last7.length ? totalScore / last7.length : 0;

    // count upset entries per POV
    const maleUpset = upsetLogs.filter((u) => u.pov === "male").length;
    const femaleUpset = upsetLogs.filter((u) => u.pov === "female").length;

    // convert to small chart data
    const moodOrder = [
      "excited",
      "happy",
      "romantic",
      "okay",
      "tired",
      "sad",
      "anxious",
      "angry",
    ];
    const moodBarData = moodOrder.map((m) => ({
      mood: m,
      count: countsByMood[m] || 0,
    }));
    const maxCount =
      moodBarData.reduce((max, m) => (m.count > max ? m.count : max), 0) || 1;

    return {
      totalDays,
      countsByMood,
      topMood,
      moodBarData,
      maxCount,
      avgScore: Number(avgScore.toFixed(2)),
      maleUpset,
      femaleUpset,
    };
  }, [moodsByDate, upsetLogs]);

  const scoreLabel =
    stats.avgScore > 1
      ? "Overall pretty positive last 7 days ✨"
      : stats.avgScore > 0
      ? "Slightly positive mood recently 🙂"
      : stats.avgScore === 0
      ? "Mixed moods recently."
      : stats.avgScore > -1
      ? "Bit heavy last week, go easy on yourselves. 💗"
      : "Tough week emotionally — time for extra care & patience. 🌧️";

  const labelForMood = (mood) => {
    switch (mood) {
      case "excited":
        return "Excited";
      case "happy":
        return "Happy";
      case "romantic":
        return "Romantic";
      case "okay":
        return "Okay";
      case "tired":
        return "Tired";
      case "sad":
        return "Sad";
      case "anxious":
        return "Anxious";
      case "angry":
        return "Angry";
      default:
        return mood;
    }
  };

  return (
    <div className="md-card">
      <div className="md-header">
        <span className="md-badge">Mood Analytics</span>
        <p className="md-subtitle">
          Simple stats from your mood logs and upset entries to understand patterns.
        </p>
      </div>

      <div className="md-analytics-top">
        <div className="md-analytics-item">
          <p className="md-analytics-label">Days tracked</p>
          <p className="md-analytics-value">{stats.totalDays}</p>
        </div>

        <div className="md-analytics-item">
          <p className="md-analytics-label">Most frequent mood</p>
          <p className="md-analytics-value">
            {stats.topMood ? labelForMood(stats.topMood) : "—"}
          </p>
        </div>

        <div className="md-analytics-item">
          <p className="md-analytics-label">Last 7 days score</p>
          <p className="md-analytics-value">{stats.avgScore}</p>
        </div>
      </div>

      <p className="md-analytics-note">{scoreLabel}</p>

      {/* Mood bar mini chart */}
      <div className="md-analytics-bars">
        {stats.moodBarData.map((m) => {
          if (!m.count) return null;
          const height = (m.count / stats.maxCount) * 100;
          return (
            <div key={m.mood} className="md-bar-col">
              <div className="md-bar-wrapper">
                <div
                  className={`md-bar md-bar-${m.mood}`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <p className="md-bar-label">{labelForMood(m.mood)}</p>
              <p className="md-bar-count">{m.count}</p>
            </div>
          );
        })}
        {stats.totalDays === 0 && (
          <p className="md-empty">No mood data yet. Start logging to see stats ✨</p>
        )}
      </div>

      {/* Upset stats */}
      <div className="md-upset-stats">
        <div className="md-upset-stat-row">
          <span className="md-upset-stat-label">His upset entries</span>
          <span className="md-upset-stat-value">{stats.maleUpset}</span>
        </div>
        <div className="md-upset-stat-row">
          <span className="md-upset-stat-label">Her upset entries</span>
          <span className="md-upset-stat-value">{stats.femaleUpset}</span>
        </div>
        <p className="md-upset-hint">
          Try to talk whenever either of these counts feels too high. The goal isn’t
          zero, it’s understanding. 💬
        </p>
      </div>
    </div>
  );
}
