import React, { useState } from "react";
import "./Playtime.css";

const DEFAULT_CHALLENGES = [
  "Send each other your favourite selfie right now.",
  "Say 'I love you' in the cheesiest way possible.",
  "Plan your next date idea in 60 seconds.",
  "Share one secret fantasy date.",
  "Swap phones for 2 minutes (no snooping allowed).",
  "Write a one-line poem for them.",
  "Give a 20-second tight hug.",
];

export default function SpinChallenges() {
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [current, setCurrent] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleSpin = () => {
    if (spinning || challenges.length === 0) return;
    setSpinning(true);

    const index = Math.floor(Math.random() * challenges.length);
    const chosen = challenges[index];

    setTimeout(() => {
      setCurrent(chosen);
      setSpinning(false);
    }, 1200); // fake spin timing
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const value = customInput.trim();
    if (!value) return;
    setChallenges((prev) => [...prev, value]);
    setCustomInput("");
  };

  return (
    <div className="pt-card">
      <div className="pt-header">
        <span className="pt-badge">Spin Challenges</span>
        <p className="pt-subtitle">
          Cute random challenges you both must do together. 🎡
        </p>
      </div>

      <div className="pt-spin-circle">
        <div className={`pt-spin-inner ${spinning ? "pt-spin-anim" : ""}`}>
          <span className="pt-spin-label">
            {spinning ? "Spinning..." : "Tap to spin"}
          </span>
        </div>
      </div>

      <div className="pt-actions-row">
        <button
          type="button"
          className="pt-primary-btn"
          onClick={handleSpin}
          disabled={spinning || challenges.length === 0}
        >
          {spinning ? "Spinning..." : "Spin a challenge"}
        </button>
      </div>

      <div className="pt-prompt-box">
        <p className="pt-prompt-label">Current challenge</p>
        <p className="pt-prompt-text">
          {current || "Spin to get your first challenge ✨"}
        </p>
      </div>

      <form className="pt-add-form" onSubmit={handleAdd}>
        <label className="pt-add-label">Add your own challenge</label>
        <div className="pt-add-row">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. Take a selfie with the goofiest pose"
          />
          <button type="submit" className="pt-add-btn">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
