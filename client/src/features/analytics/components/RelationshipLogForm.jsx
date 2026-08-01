import React, { useState } from "react";
import "./Analytics.css";

/**
 * Props:
 *   onAdd(log)
 * log = { id, date: "YYYY-MM-DD", kind: "kiss"|"hug"|"meetup", count, note }
 */
export default function RelationshipLogForm({ onAdd }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [kind, setKind] = useState("kiss");
  const [count, setCount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!count || Number(count) <= 0) return;

    const log = {
      id: Date.now(),
      date,
      kind,
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
        <span className="an-badge">Relationship Log</span>
        <p className="an-subtitle">
          Count kisses, hugs and meetups — because tiny moments matter. 💕
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
            <label>Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="kiss">Kiss</option>
              <option value="hug">Hug</option>
              <option value="meetup">Meetup</option>
            </select>
          </div>

          <div className="an-field">
            <label>Count</label>
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
            placeholder="e.g. long hug after a rough day"
          />
        </div>

        <button type="submit" className="an-primary-btn">
          Save relationship log
        </button>
      </form>
    </div>
  );
}
