import React, { useState } from "react";
import "./Playtime.css";

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

const diceFaces = {
  1: "⚀",
  2: "⚁",
  3: "⚂",
  4: "⚃",
  5: "⚄",
  6: "⚅",
};

export default function DiceGame() {
  const [youRoll, setYouRoll] = useState(null);
  const [partnerRoll, setPartnerRoll] = useState(null);
  const [resultText, setResultText] = useState("");

  const handleRoll = () => {
    const y = rollDie();
    const p = rollDie();
    setYouRoll(y);
    setPartnerRoll(p);

    if (y > p) {
      setResultText("You win! They owe you a cute punishment 😏");
    } else if (p > y) {
      setResultText("They win! You owe them something romantic 💗");
    } else {
      setResultText("It’s a tie! Both get a hug 🤝");
    }
  };

  return (
    <div className="pt-card">
      <div className="pt-header">
        <span className="pt-badge">Dice Game</span>
        <p className="pt-subtitle">
          Roll the dice to decide tiny rewards or punishments. 🎲
        </p>
      </div>

      <div className="pt-dice-row">
        <div className="pt-dice-col">
          <p className="pt-dice-label">You</p>
          <div className="pt-dice-face">
            {youRoll ? diceFaces[youRoll] : "–"}
          </div>
        </div>
        <div className="pt-dice-col">
          <p className="pt-dice-label">Partner</p>
          <div className="pt-dice-face">
            {partnerRoll ? diceFaces[partnerRoll] : "–"}
          </div>
        </div>
      </div>

      <div className="pt-actions-row">
        <button
          type="button"
          className="pt-primary-btn"
          onClick={handleRoll}
        >
          Roll both dice
        </button>
      </div>

      {resultText && (
        <p className="pt-dice-result">{resultText}</p>
      )}
    </div>
  );
}
