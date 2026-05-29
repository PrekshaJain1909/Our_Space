import React, { useState } from "react";
import "../components/Playtime.css";

import TruthOrDareGame from "../components/TruthOrDareGame";
import LoveBingoGame from "../components/LoveBingoGame";
import DiceGame from "../components/DiceGame";
import SpinChallenges from "../components/SpinChallenges";

export default function PlaytimePage() {
  const [activeTab, setActiveTab] = useState("truthOrDare");

  const tabs = [
    { id: "truthOrDare", label: "Truth or Dare" },
    { id: "loveBingo", label: "Love Bingo" },
    { id: "dice", label: "Dice Game" },
    { id: "spin", label: "Spin Challenges" },
  ];

  return (
    <div className="playtime-wrapper">
      
      <div className="playtime-overlay" />

      <div className="playtime-inner">
        
        {/* Header */}
        <p className="playtime-badge">Playtime</p>
        <br />
        <header className="playtime-header floating-note">
          
          <h1 className="playtime-title">Games for You Two</h1>
          <p className="playtime-subtitle">
            Turn boring evenings into laughter, dares and cute challenges. 🎮💞
          </p>
        </header>

        {/* Tabs */}
        <div className="playtime-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`playtime-tab-btn ${
                activeTab === tab.id ? "playtime-tab-btn-active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <section className="playtime-tab-content">
          {activeTab === "truthOrDare" && (
            <div className="playtime-block">
              <TruthOrDareGame />
            </div>
          )}

          {activeTab === "loveBingo" && (
            <div className="playtime-block">
              <LoveBingoGame />
            </div>
          )}

          {activeTab === "dice" && (
            <div className="playtime-block">
              <DiceGame />
            </div>
          )}

          {activeTab === "spin" && (
            <div className="playtime-block">
              <SpinChallenges />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
