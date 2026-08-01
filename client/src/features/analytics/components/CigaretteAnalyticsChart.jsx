import React, { useMemo } from "react";
import "./Analytics.css";

/**
 * Props:
 *   logs: [{ type: "cigarette", date: "YYYY-MM-DD", count }]
 */
export default function CigaretteAnalyticsChart({ logs = [] }) {
  const { days, maxCount, totalWeek, trendText } = useMemo(() => {
    const today = new Date();
    const normalizedLogs = logs || [];

    // last 7 days
    const daysArr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const count = normalizedLogs
        .filter((l) => l.date === iso)
        .reduce((s, l) => s + l.count, 0);

      daysArr.push({
        key: iso,
        label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
        count,
      });
    }

    const max = daysArr.reduce((m, d) => (d.count > m ? d.count : m), 0) || 1;
    const total = daysArr.reduce((s, d) => s + d.count, 0);

    // reduction trend: compare first 3 days vs last 3 days avg
    const first3 = daysArr.slice(0, 3);
    const last3 = daysArr.slice(-3);
    const avgFirst =
      first3.reduce((s, d) => s + d.count, 0) / (first3.length || 1);
    const avgLast = last3.reduce((s, d) => s + d.count, 0) / (last3.length || 1);

    let trendText = "Not enough data yet.";
    if (total > 0) {
      if (avgLast < avgFirst) {
        const diff = avgFirst - avgLast;
        const perc = avgFirst ? Math.round((diff / avgFirst) * 100) : 0;
        trendText = `Good job! Last 3 days are down by ~${perc}% compared to earlier. ⬇️`;
      } else if (avgLast > avgFirst) {
        const diff = avgLast - avgFirst;
        const perc = avgFirst ? Math.round((diff / avgFirst) * 100) : 0;
        trendText = `Cigs went up by ~${perc}% in the last 3 days. You can get back on track. 💪`;
      } else {
        trendText = "Last 3 days are similar to the earlier days.";
      }
    }

    return {
      days: daysArr,
      maxCount: max,
      totalWeek: total,
      trendText,
    };
  }, [logs]);

  return (
    <div className="an-card">
      <div className="an-header">
        <span className="an-badge">Cigarette Analytics</span>
        <p className="an-subtitle">
          Weekly smoking log with a small reduction progress hint.
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="an-empty">
          No cigarette logs yet. Start logging to see your progress 📉
        </p>
      ) : (
        <>
          <div className="an-chart-bars">
            {days.map((d) => {
              const height = (d.count / maxCount) * 100;
              return (
                <div key={d.key} className="an-bar-column">
                  <div className="an-bar-wrapper">
                    <div
                      className="an-bar an-bar-cig"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="an-bar-label">{d.label}</p>
                  <p className="an-bar-value">{d.count}</p>
                </div>
              );
            })}
          </div>
          <p className="an-chart-total">
            Weekly total: <span>{totalWeek}</span>
          </p>
          <p className="an-trend-text">{trendText}</p>
        </>
      )}
    </div>
  );
}
