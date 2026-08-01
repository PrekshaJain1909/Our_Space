import React, { useState } from "react";
import "./Playtime.css";

const DEFAULT_TRUTHS = [
  "What is one thing you’re afraid to tell me?",
  "When did you feel most loved by me?",
  "What’s your favorite memory of us?",
  "What is something you want us to try together?",
  "What was your first impression of me?",
];

const DEFAULT_DARES = [
  "Give me a 30-second tight hug.",
  "Say three things you love about me.",
  "Send me a cheesy voice note right now.",
  "Do a dramatic proposal pose.",
  "Let me choose your next story caption.",
];

export default function TruthOrDareGame() {
  const [mode, setMode] = useState("truth"); // truth | dare
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [truths, setTruths] = useState(DEFAULT_TRUTHS);
  const [dares, setDares] = useState(DEFAULT_DARES);

  const prompts = mode === "truth" ? truths : dares;

  const getRandomPrompt = () => {
    if (prompts.length === 0) {
      setCurrentPrompt("Add some prompts first ✨");
      return;
    }
    const index = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[index]);
  };

  const handleAddPrompt = (e) => {
    e.preventDefault();
    const value = customInput.trim();
    if (!value) return;

    if (mode === "truth") {
      setTruths((prev) => [...prev, value]);
    } else {
      setDares((prev) => [...prev, value]);
    }
    setCustomInput("");
  };

  return (
    <div className="pt-card">
      <div className="pt-header">
        <span className="pt-badge">Truth or Dare</span>
        <p className="pt-subtitle">
          Choose truth or dare and let fate pick a spicy question or task. 🔥
        </p>
      </div>

      {/* Toggle */}
      <div className="pt-toggle">
        <button
          type="button"
          className={`pt-toggle-btn ${mode === "truth" ? "pt-toggle-btn-active" : ""}`}
          onClick={() => setMode("truth")}
        >
          Truth
        </button>
        <button
          type="button"
          className={`pt-toggle-btn ${mode === "dare" ? "pt-toggle-btn-active" : ""}`}
          onClick={() => setMode("dare")}
        >
          Dare
        </button>
      </div>

      {/* Current prompt */}
      <div className="pt-prompt-box">
        <p className="pt-prompt-label">
          {mode === "truth" ? "Truth question" : "Dare challenge"}
        </p>
        <p className="pt-prompt-text">
          {currentPrompt || "Tap “Generate” to get your first prompt ✨"}
        </p>
      </div>

      {/* Controls */}
      <div className="pt-actions-row">
        <button
          type="button"
          className="pt-primary-btn"
          onClick={getRandomPrompt}
        >
          Generate {mode === "truth" ? "truth" : "dare"}
        </button>
      </div>

      {/* Add custom prompt */}
      <form className="pt-add-form" onSubmit={handleAddPrompt}>
        <label className="pt-add-label">
          Add your own {mode === "truth" ? "truth question" : "dare"}
        </label>
        <div className="pt-add-row">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={
              mode === "truth"
                ? "e.g. What did you first notice about me?"
                : "e.g. Sing a song in a funny voice"
            }
          />
          <button type="submit" className="pt-add-btn">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
