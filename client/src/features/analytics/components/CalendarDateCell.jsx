import React from "react";

const statusEmoji = (s) =>
  s === "Good" ? "🟢" : s === "Moderate" ? "🟡" : s === "Bad" ? "🔴" : "";

export default function CalendarDateCell({ date, entry, onClick }) {
  if (!date) return <div className="calendar-cell empty" />;
  const day = date.getDate();
  const status = entry?.status || null;
  const qty = entry?.count ?? null;
  const note = entry?.note || null;
  const statusClass =
    status === "Good"
      ? "status-good"
      : status === "Moderate"
        ? "status-moderate"
        : status === "Bad"
          ? "status-bad"
          : "";

  return (
    <button
      type="button"
      className={`calendar-cell ${statusClass}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      <div className="calendar-cell-top">
        <span className="calendar-cell-day">{day}</span>
        <span className="calendar-cell-status">{statusEmoji(status)}</span>
      </div>
      <div className="calendar-cell-count">{qty != null ? qty : ""}</div>
      <div className="calendar-cell-note">{note ? `"${note}"` : ""}</div>
    </button>
  );
}
