import React from "react";
import "./PunishmentSummaryCard.css";

/**
 * Example usage:
 * <PunishmentSummaryCard
 *   pending={3}
 *   completed={8}
 *   maleCompleted={5}
 *   femaleCompleted={3}
 *   onViewClick={() => navigate("/healing")}
 * />
 */

export default function PunishmentSummaryCard({
  pending = 0,
  completed = 0,
  maleCompleted = 0,
  femaleCompleted = 0,
  onViewClick,
}) {
  const totalDone = completed || maleCompleted + femaleCompleted;

  let leaderText = "Both are equally doing punishments 🫂";
  if (maleCompleted > femaleCompleted) {
    leaderText = "He’s doing more punishments right now 😅";
  } else if (femaleCompleted > maleCompleted) {
    leaderText = "She’s doing more punishments right now 😈";
  }

  return (
    <div className="psc-card">
      <div className="psc-header">
        <span className="psc-badge">Punishments</span>
        <p className="psc-subtitle">
          A quick look at how many promises turned into fun punishments.
        </p>
      </div>

      <div className="psc-main">
        <div className="psc-block">
          <p className="psc-label">Pending</p>
          <p className="psc-number psc-number-pending">{pending}</p>
        </div>
        <div className="psc-block">
          <p className="psc-label">Completed</p>
          <p className="psc-number psc-number-completed">{totalDone}</p>
        </div>
      </div>

      <div className="psc-split">
        <div className="psc-split-block">
          <p className="psc-mini-label">Done by him</p>
          <p className="psc-mini-number">{maleCompleted}</p>
        </div>
        <div className="psc-split-block">
          <p className="psc-mini-label">Done by her</p>
          <p className="psc-mini-number">{femaleCompleted}</p>
        </div>
      </div>

      <p className="psc-leader-text">{leaderText}</p>

      <div className="psc-footer">
        <button
          type="button"
          className="psc-view-btn"
          onClick={onViewClick}
        >
          Open Healing Zone
        </button>
      </div>
    </div>
  );
}
