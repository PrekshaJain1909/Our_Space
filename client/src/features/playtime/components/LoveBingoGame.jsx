import React, { useState } from "react";
import "./Playtime.css";

const DEFAULT_BINGO_ITEMS = [
  "Random forehead kiss",
  "Late night call",
  "Good morning text",
  "Shared cringe reel",
  "Long hug",
  "Inside joke moment",
  "Walk together",
  "You made me laugh hard",
  "Serious heart-to-heart",
];

export default function LoveBingoGame() {
  const [items, setItems] = useState(
    DEFAULT_BINGO_ITEMS.map((text, index) => ({
      id: index,
      text,
      checked: false,
    }))
  );

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      )
    );
  };

  const doneCount = items.filter((i) => i.checked).length;
  const percent = Math.round((doneCount / items.length) * 100);

  return (
    <div className="pt-card">
      <div className="pt-header">
        <span className="pt-badge">Love Bingo</span>
        <p className="pt-subtitle">
          Tick moments you’ve had together — try to complete the whole grid. 💘
        </p>
      </div>

      <div className="pt-bingo-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`pt-bingo-cell ${item.checked ? "pt-bingo-cell-active" : ""}`}
            onClick={() => toggleItem(item.id)}
          >
            <span className="pt-bingo-text">{item.text}</span>
          </button>
        ))}
      </div>

      <div className="pt-bingo-progress">
        <div className="pt-bingo-bar">
          <div
            className="pt-bingo-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="pt-bingo-label">
          Progress: {doneCount}/{items.length} ({percent}%)
        </p>
      </div>
    </div>
  );
}
