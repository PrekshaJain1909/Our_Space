import React from "react";

const statusDot = (s) =>
  s === "Good" ? "🟢" : s === "Moderate" ? "🟡" : s === "Bad" ? "🔴" : "⚪";

export default function HabitHistoryTimeline({ habit }) {
  const history = (habit.history || [])
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <>
      <div className="smoking-panel-header">
        <div>
          <div className="smoking-panel-label">Daily Habit Heatmap</div>
          <div className="smoking-panel-copy">Tap any day to log entries, notes, and status updates.</div>
        </div>
        <div className="smoking-legend">
          <div className="smoking-legend-item">
            <span className="smoking-legend-dot status-good" /> Smoke Free
          </div>
          <div className="smoking-legend-item">
            <span className="smoking-legend-dot status-moderate" /> Low
          </div>
          <div className="smoking-legend-item">
            <span className="smoking-legend-dot status-caution" /> Medium
          </div>
          <div className="smoking-legend-item">
            <span className="smoking-legend-dot status-bad" /> Heavy
          </div>
        </div>
      </div>
      <div className="an-card smoking-activity-card">

        <div className="smoking-activity-title">Recent Activity</div>
        {history.length === 0 ? (
          <div className="an-subtitle">No recent logs yet.</div>
        ) : (
          <div className="smoking-timeline-list">
            {history.slice(0, 8).map((h) => (
              <div key={h.id || h.date} className="smoking-timeline-item">
                <div className="smoking-timeline-badge">{h.date}</div>
                <div className="smoking-timeline-main">
                  <div className="smoking-timeline-status">{h.note || "Logged entry"}</div>
                  <div className="smoking-timeline-note">Updated by {h.updatedByName || "Partner"}</div>
                  <div className="smoking-timeline-meta">
                    <span>{h.count != null ? `${h.count} cigarettes` : "No quantity"}</span>
                  </div>
                </div>
                <div className={`smoking-timeline-pill ${h.status === "Good" ? "status-good" : h.status === "Moderate" ? "status-moderate" : h.status === "Bad" ? "status-bad" : "status-unknown"}`}>
                  {statusDot(h.status)} {h.status || "None"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
