import React, { useState } from "react";
import "./Bucket.css";

export default function BucketListForm({ onAdd, partners = [] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("travel");
  const [targetDate, setTargetDate] = useState("");
  const [together, setTogether] = useState(""); // '' = placeholder, otherwise partner name or 'both'
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const item = {
      id: Date.now(),
      title: title.trim(),
      category,
      targetDate: targetDate || null,
      together,
      notes: notes.trim(),
      status: "pending", // pending | done
      createdAt: new Date().toISOString(),
      doneAt: null,
    };

    onAdd && onAdd(item);

    setTitle("");
    setNotes("");
    // keep category / together for convenience
  };

  return (
    <div className="bk-card">
      <div className="bk-header">
        <span className="bk-badge">Bucket List Task</span>
        <p className="bk-subtitle">
          Add things you both want to experience — big or small. ✈️🍿
        </p>
      </div>

      <form className="bk-form" onSubmit={handleSubmit}>
        <div className="bk-field">
          <label>Task name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Goa trip, movie marathon, rooftop dinner…"
            required
          />
        </div>

        <div className="bk-row">
          <div className="bk-field">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="travel">Travel</option>
              <option value="food">Food</option>
              <option value="adventure">Adventure</option>
              <option value="date">Date idea</option>
              <option value="learning">Learning</option>
              <option value="random">Random cute</option>
            </select>
          </div>

          <div className="bk-field">
            <label>Target date (optional)</label>
            <input
              type="date"
              value={targetDate || ""}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="bk-field">
            <label>For</label>
            <div className="bk-select-wrapper">
              <select
                className={`bk-select ${together ? 'has-value' : ''}`}
                value={together}
                onChange={(e) => setTogether(e.target.value)}
              >
                <option value="" disabled>
                  Choose who this memory is for
                </option>
                {partners && partners.length > 0 ? (
                  <>
                    <option value={partners[0]}>{partners[0]}</option>
                    {partners[1] ? <option value={partners[1]}>{partners[1]}</option> : null}
                    <option value="both">Both of us</option>
                  </>
                ) : (
                  <>
                    <option value="both">Both of us</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="bk-field">
          <label>Notes (optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any small details, budget ideas or references…"
          />
        </div>

        <button type="submit" className="bk-primary-btn">
          Add to bucket list
        </button>
      </form>
    </div>
  );
}
