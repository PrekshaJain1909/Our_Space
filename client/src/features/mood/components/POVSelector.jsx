import React from "react";
import "./Mood.css";

export default function POVSelector({ pov, onChange }) {
  return (
    <div className="md-pov-toggle">
      <button
        type="button"
        className={`md-pov-btn ${pov === "male" ? "md-pov-btn-active" : ""}`}
        onClick={() => onChange && onChange("male")}
      >
        <span className="md-pov-emoji">👦</span>
        <span>Male POV</span>
      </button>
      <button
        type="button"
        className={`md-pov-btn ${pov === "female" ? "md-pov-btn-active" : ""}`}
        onClick={() => onChange && onChange("female")}
      >
        <span className="md-pov-emoji">👧</span>
        <span>Female POV</span>
      </button>
    </div>
  );
}
