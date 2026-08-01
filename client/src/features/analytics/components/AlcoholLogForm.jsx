import React, { useState } from "react";
import "./Analytics.css";

/**
 * Props:
 *   onAdd(log)
 * log = {
 *   id, type: "alcohol", date: "YYYY-MM-DD",
 *   amount: number, unit: string, note: string
 * }
 */
export default function AlcoholLogForm({ onAdd }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("drinks"); // drinks / shots / glasses
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const log = {
      id: Date.now(),
      type: "alcohol",
      date,
      amount: Number(amount),
      unit,
      note: note.trim(),
    };

    onAdd && onAdd(log);
    setAmount("");
    setNote("");
  };

  return (
    <div className="an-card">
      <div className="an-header">
        <span className="an-badge">Alcohol Log</span>
        <p className="an-subtitle">
          Gently track how much you drank today — no judgment, just awareness. 🌙
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
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2"
              required
            />
          </div>

          <div className="an-field">
            <label>Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="drinks">Drinks</option>
              <option value="shots">Shots</option>
              <option value="glasses">Glasses</option>
            </select>
          </div>
        </div>

        <div className="an-field">
          <label>Note (optional)</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. celebration dinner, stress, friends meetup..."
          />
        </div>

        <button type="submit" className="an-primary-btn">
          Save alcohol log
        </button>
      </form>
    </div>
  );
}
