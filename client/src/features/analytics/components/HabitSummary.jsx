import React, { useMemo } from "react";

function avg(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function formatMoney(value) {
  return `$${Math.round(value)}`;
}

export default function HabitSummary({ habit }) {
  const history = habit.history || [];

  const summary = useMemo(() => {
    const totalLogs = history.length;
    const quantities = history.map((h) => Number(h.count || 0));
    const smokeFreeDays = history.filter((h) => h.status === "Good").length;
    const lowDays = history.filter((h) => h.status === "Moderate").length;
    const heavyDays = history.filter((h) => h.status === "Bad").length;
    const averageQuantity = avg(quantities).toFixed(1);
    const byDate = Object.fromEntries(history.map((h) => [h.date, h]));
    const dates = history.map((h) => h.date).sort();

    let bestStreak = 0;
    let currentStreak = 0;
    let previous = null;

    dates.forEach((date) => {
      const entry = byDate[date];
      if (entry?.status === "Good") {
        if (previous) {
          const prevDate = new Date(previous);
          const currentDate = new Date(date);
          const diff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
          currentStreak = diff === 1 ? currentStreak + 1 : 1;
        } else {
          currentStreak = 1;
        }
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
      previous = date;
    });

    const mid = Math.floor(quantities.length / 2);
    const firstAvg = avg(quantities.slice(0, mid));
    const secondAvg = avg(quantities.slice(mid));
    const improvement = firstAvg === 0 ? 0 : Math.round(((firstAvg - secondAvg) / firstAvg) * 100);
    const recoveryScore = Math.min(100, Math.max(18, Math.round(40 + smokeFreeDays * 2.5 + bestStreak * 2 - heavyDays * 1.25)));
    const moneySaved = smokeFreeDays * 3.5;

    const milestones = [];
    if (smokeFreeDays >= 14) milestones.push("14-day smoke-free streak");
    if (bestStreak >= 7) milestones.push("7-day recovery streak");
    if (history.length >= 30) milestones.push("30 logs recorded");
    if (!milestones.length) milestones.push("Keep going — small wins add up");

    const today = new Date();
    const chartDays = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const entry = byDate[key];
      return {
        key,
        label: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
        count: entry?.count || 0,
      };
    });

    return {
      totalLogs,
      averageQuantity,
      bestStreak,
      improvement,
      smokeFreeDays,
      moneySaved,
      recoveryScore,
      milestones,
      chartDays,
    };
  }, [history]);

  const maxCount = Math.max(...summary.chartDays.map((item) => item.count), 1);
  const chartPoints = summary.chartDays
    .map((item, index) => {
      const x = (index / (summary.chartDays.length - 1)) * 100;
      const y = 100 - ((item.count / maxCount) * 76 + 12);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="smoking-summary-card smoking-chart-card">
      <div className="smoking-chart-header">
        <div>
          <div className="smoking-panel-label">Monthly Summary</div>
          <div className="smoking-panel-copy">A premium view of your smoking journey and recovery metrics.</div>
        </div>
      </div>

      <div className="smoking-summary-cards">
        <div className="smoking-metric-card">
          <div className="smoking-metric-icon">📝</div>
          <div>
            <div className="smoking-metric-title">Total Logs</div>
            <div className="smoking-metric-value">{summary.totalLogs}</div>
          </div>
        </div>

        <div className="smoking-metric-card">
          <div className="smoking-metric-icon">🔥</div>
          <div>
            <div className="smoking-metric-title">Best Streak</div>
            <div className="smoking-metric-value">{summary.bestStreak} days</div>
          </div>
        </div>




        <div className="smoking-metric-card">
          <div className="smoking-metric-icon">🌿</div>
          <div>
            <div className="smoking-metric-title">Smoke-Free Days</div>
            <div className="smoking-metric-value">{summary.smokeFreeDays}</div>
          </div>
        </div>
      </div>

      <div className="smoking-trend-panel">
        <div className="smoking-panel-label">Trend</div>
        <div className="smoking-trend-chart">
          {summary.totalLogs === 0 ? (
            <div className="smoking-chart-empty">No trend data yet — start logging for insights.</div>
          ) : (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="smoking-trend-svg"
            >
              <defs>
                <linearGradient id="smokingTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(236,72,153,0.32)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.04)" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,100 ${chartPoints} 100,100`}
                fill="url(#smokingTrendGradient)"
                opacity="0.85"
              />
              <polyline
                fill="none"
                stroke="var(--accent-secondary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                points={chartPoints}
              />
              {summary.chartDays.map((item, index) => {
                const x = (index / (summary.chartDays.length - 1)) * 100;
                const y = 100 - ((item.count / maxCount) * 76 + 12);
                return (
                  <circle
                    key={item.key}
                    cx={x}
                    cy={y}
                    r="2.8"
                    fill="#fff"
                    stroke="var(--accent-primary)"
                    strokeWidth="1.4"
                  />
                );
              })}
            </svg>
          )}
        </div>

        <div className="smoking-trend-labels">
          {summary.chartDays.map((item) => (
            <div key={item.key} className="smoking-trend-label">
              {item.label}
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
