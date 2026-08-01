import React, { useState } from "react";
import "./Analytics.css";

/**
 * Props:
 *   onAdd(log)
 * log = {
 *   id, type: "cigarette", date: "YYYY-MM-DD",
 *   count: number, note: string
 * }
 */
export default function CigaretteLogForm({ onAdd }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [count, setCount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!count || Number(count) <= 0) return;

    const log = {
      id: Date.now(),
      type: "cigarette",
      date,
      count: Number(count),
      note: note.trim(),
    };

    onAdd && onAdd(log);
    setCount("");
    setNote("");
  };

  return (
    <div className="an-card">
      <div className="an-header">
        <span className="an-badge">Cigarette Log</span>
        <p className="an-subtitle">
          Track cigarettes per day so you can gently reduce over time. 🌫️
        </p>
      </div>

      <form className="an-form" onSubmit={handleSubmit}>
        <div className="an-row">
          <div className="an-field">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="an-field">
            <label>Number of cigarettes</label>
            <input
              type="number"
              min="0"
              step="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="e.g. 5"
              required
            />
          </div>
        </div>

        <div className="an-field">
          <label>Note (optional)</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. stressful day, social smoking, trying to cut down…"
          />
        </div>

        <button type="submit" className="an-primary-btn">
          Save cigarette log
        </button>
      </form>
    </div>
  );
}
