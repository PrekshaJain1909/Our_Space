import React, { useState } from "react";
import "./Mood.css";

export default function UpsetForm({ pov = "female", onSubmitUpset }) {
  const [reason, setReason] = useState("");
  const [trigger, setTrigger] = useState("");
  const [need, setNeed] = useState("");
  const [intensity, setIntensity] = useState(5); // 1–10

  const todayIso = new Date().toISOString().slice(0, 10);

  const isMale = pov === "male";

  const titleText = isMale
    ? "Why am I upset? (His POV)"
    : "Why am I upset? (Her POV)";

  const placeholderReason = isMale
    ? "e.g. I felt ignored when she was on her phone."
    : "e.g. I felt he didn’t try to understand me.";

  const placeholderNeed = isMale
    ? "e.g. I need her to listen and reassure me."
    : "e.g. I need him to ask how I feel and stay patient.";

  const bgClass = isMale ? "md-upset-male" : "md-upset-female";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const entry = {
      id: Date.now(),
      date: todayIso,
      pov,
      reason: reason.trim(),
      trigger: trigger.trim(),
      need: need.trim(),
      intensity: Number(intensity),
    };

    onSubmitUpset && onSubmitUpset(entry);

    setReason("");
    setTrigger("");
    setNeed("");
    setIntensity(5);
  };

  return (
    <form className={`md-upset-form ${bgClass}`} onSubmit={handleSubmit}>
      <h3 className="md-upset-title">{titleText}</h3>

      <div className="md-row">
        <div className="md-field">
          <label>What hurt you?</label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholderReason}
            required
          />
        </div>
      </div>

      <div className="md-row">
        <div className="md-field">
          <label>What exactly triggered it? (situation)</label>
          <textarea
            rows={2}
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="e.g. he replied late / she cancelled plan / tone felt harsh…"
          />
        </div>
      </div>

      <div className="md-row">
        <div className="md-field">
          <label>What would make you feel better?</label>
          <textarea
            rows={2}
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder={placeholderNeed}
          />
        </div>
      </div>

      <div className="md-row">
        <div className="md-field md-intensity-field">
          <label>
            Intensity <span>(1 - chill, 10 - very upset)</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
          />
          <p className="md-intensity-value">Current: {intensity}/10</p>
        </div>
      </div>

      <button type="submit" className="md-primary-btn md-upset-btn">
        Save “I’m upset” entry
      </button>
    </form>
  );
}
