import React, { useMemo, useState } from "react";
import "./Mood.css";

const moodEmojiFromEntry = (entry) => entry?.emoji || "";

export default function MoodCalendar({ moodsByDate = {} }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const { days, weeks } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    // leading empty cells
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const iso = dateObj.toISOString().slice(0, 10);
      cells.push({
        dateObj,
        iso,
        dayNum: d,
        entry: moodsByDate[iso] || null,
      });
    }

    // pad to full weeks (42 cells)
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return {
      days: cells,
      weeks,
    };
  }, [currentMonth, moodsByDate]);

  const goPrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  return (
    <div className="md-card">
      <div className="md-header">
        <span className="md-badge">Mood Calendar</span>
        <p className="md-subtitle">
          A monthly calendar where each day shows the emoji you logged. Updating
          today’s mood will change this instantly.
        </p>
      </div>

      <div className="md-calendar-header">
        <button
          type="button"
          className="md-cal-nav-btn"
          onClick={goPrevMonth}
        >
          ‹
        </button>
        <p className="md-calendar-title">{monthLabel}</p>
        <button
          type="button"
          className="md-cal-nav-btn"
          onClick={goNextMonth}
        >
          ›
        </button>
      </div>

      <div className="md-calendar-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="md-calendar-headcell">
            {d}
          </div>
        ))}

        {weeks.map((week, wi) =>
          week.map((cell, ci) => {
            if (!cell) {
              return (
                <div
                  key={`${wi}-${ci}`}
                  className="md-calendar-cell md-calendar-cell-empty"
                />
              );
            }

            const isToday =
              cell.dateObj.toDateString() === today.toDateString();
            const emoji = moodEmojiFromEntry(cell.entry);

            return (
              <div
                key={cell.iso}
                className={`md-calendar-cell ${
                  isToday ? "md-calendar-cell-today" : ""
                } ${cell.entry ? "md-calendar-cell-has" : ""}`}
              >
                <span className="md-calendar-daynum">{cell.dayNum}</span>
                <span className="md-calendar-emoji">{emoji}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
