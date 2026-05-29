import React, { useState } from "react";
import "./HealingZone.css";
import forgivenessApi from '../../../api/forgivenessApi';

/**
 * entries = [{ id, apologizer, forgiver, why, ... }]
 */
export default function ForgivenessForm({ entries = [], onAddForgiveness }) {
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  const pendingEntries = entries.filter((e) => e.status !== "done");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const payload = { forgivenessMessage: message.trim() };
    if (selectedEntryId) payload.originalEntryId = selectedEntryId;
    if (title && title.trim()) payload.title = title.trim();

    try {
      const resp = await forgivenessApi.createForgiveness(payload);
      const saved = resp?.data?.data || resp?.data || resp;
      if (saved && onAddForgiveness) onAddForgiveness(saved);
    } catch (err) {
      console.error('Failed to send forgiveness', err);
    }

    setSelectedEntryId("");
    setMessage("");
    setTitle("");
  };

  return (
    <div className="hz-card">
      <div className="hz-header">
        <span className="hz-badge">Forgiveness Form</span>
        <p className="hz-subtitle">
          Officially close the loop with a sweet forgiveness message. 🤍
        </p>
      </div>

      <form className="hz-form" onSubmit={handleSubmit}>
        <div className="hz-field">
          <label>Title (optional)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title (optional)" />
        </div>

        <div className="hz-field">
          <label>Select entry to forgive</label>
          <select
            value={selectedEntryId}
            onChange={(e) => setSelectedEntryId(e.target.value)}
          >
            <option value="">No specific entry</option>
            {pendingEntries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.apologizer} → {e.forgiver} — {e.why.slice(0, 25)}
                {e.why.length > 25 ? "..." : ""}
              </option>
            ))}
          </select>
          <p className="hz-field-help">You can skip choosing an entry and send a direct forgiveness message.</p>
        </div>

        <div className="hz-field">
          <label>Forgiveness message</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I forgive you, but next time you’re bringing me chocolate 😌"
            required
          />
        </div>

        <button type="submit" className="hz-primary-btn">
          Send forgiveness
        </button>
      </form>
    </div>
  );
}