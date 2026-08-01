import React, { useMemo, useState } from "react";
import "./Analytics.css";

/**
 * Props:
 *   logs: [{ type: "alcohol", date: "YYYY-MM-DD", amount, unit }]
 * Note: parent should already filter to alcohol logs if you prefer.
 */
export default function AlcoholAnalyticsChart({ logs = [] }) {
  const [range, setRange] = useState("week"); // "week" | "month"

  const { bars, maxAmount, total, label } = useMemo(() => {
    const today = new Date();
    const normalizedLogs = logs || [];

    if (range === "week") {
      // last 7 days, daily bars
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const amount = normalizedLogs
          .filter((log) => log.date === iso)
          .reduce((sum, l) => sum + l.amount, 0);

        days.push({
          key: iso,
          label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
          amount,
        });
      }
      const max = days.reduce((m, d) => (d.amount > m ? d.amount : m), 0) || 1;
      const total = days.reduce((s, d) => s + d.amount, 0);
      return { bars: days, maxAmount: max, total, label: "Last 7 days" };
    } else {
      // month view: group into 4 weeks (approx)
      const buckets = [
        { key: "W4", label: "W-4", from: 21, to: 27, amount: 0 },
        { key: "W3", label: "W-3", from: 14, to: 20, amount: 0 },
        { key: "W2", label: "W-2", from: 7, to: 13, amount: 0 },
        { key: "W1", label: "W-1", from: 0, to: 6, amount: 0 },
      ];

      normalizedLogs.forEach((log) => {
        const logDate = new Date(log.date);
        const diffMs = today - logDate;
        const dayDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (dayDiff < 0 || dayDiff > 27) return; // only last ~4 weeks

        buckets.forEach((b) => {
          if (dayDiff >= b.from && dayDiff <= b.to) {
            b.amount += log.amount;
          }
        });
      });

      const max = buckets.reduce((m, b) => (b.amount > m ? b.amount : m), 0) || 1;
      const total = buckets.reduce((s, b) => s + b.amount, 0);
      return { bars: buckets, maxAmount: max, total, label: "Last 4 weeks" };
    }
  }, [logs, range]);

  const average = bars.length ? (total / bars.length).toFixed(1) : 0;

  return (
    <div className="an-card">
      <div className="an-header">
        <span className="an-badge">Alcohol Analytics</span>
        <p className="an-subtitle">
          Intake trends by {range === "week" ? "week" : "month"} to help you stay mindful.
        </p>
      </div>

      <div className="an-range-toggle">
        <button
          type="button"
          className={`an-range-btn ${range === "week" ? "an-range-btn-active" : ""}`}
          onClick={() => setRange("week")}
        >
          Week
        </button>
        <button
          type="button"
          className={`an-range-btn ${range === "month" ? "an-range-btn-active" : ""}`}
          onClick={() => setRange("month")}
        >
          Month
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="an-empty">
          No alcohol logs yet. Add a few and your chart will appear here 📈
        </p>
      ) : (
        <>
          <div className="an-chart-bars">
            {bars.map((b) => {
              const height = (b.amount / maxAmount) * 100;
              return (
                <div key={b.key} className="an-bar-column">
                  <div className="an-bar-wrapper">
                    <div className="an-bar" style={{ height: `${height}%` }} />
                  </div>
                  <p className="an-bar-label">{b.label}</p>
                  <p className="an-bar-value">{b.amount}</p>
                </div>
              );
            })}
          </div>
          <p className="an-chart-total">
            {label}: <span>{total}</span>{" "}
            <span style={{ opacity: 0.85, fontSize: 11 }}>
              (avg {average} per {range === "week" ? "day" : "bucket"})
            </span>
          </p>
        </>
      )}
    </div>
  );
}
