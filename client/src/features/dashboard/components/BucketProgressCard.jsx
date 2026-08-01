import React from "react";
import "./BucketProgressCard.css";
/**
 * Props example:
 * <BucketProgressCard
 *   total={12}
 *   completed={5}
 *   onViewClick={() => navigate("/bucket")}
 * />
 */

export default function BucketProgressCard({ total = 0, completed = 0, onViewClick }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  return (
    <div className="bpc-card">
      <div className="bpc-header">
        <span className="bpc-badge">Bucket List</span>
        <p className="bpc-subtitle">How far have you both gone in your shared dreams?</p>
      </div>

      <div className="bpc-progress">
        <div className="bpc-bar">
          <div className="bpc-fill" style={{ width: `${percentage}%` }} />
        </div>
        <p className="bpc-percent">{percentage}% complete</p>
      </div>

      <div className="bpc-stats">
        <div className="bpc-stat">
          <p className="bpc-stat-number">{completed}</p>
          <p className="bpc-stat-label">Done</p>
        </div>
        <div className="bpc-stat">
          <p className="bpc-stat-number">{remaining}</p>
          <p className="bpc-stat-label">Remaining</p>
        </div>
        <div className="bpc-stat">
          <p className="bpc-stat-number">{total}</p>
          <p className="bpc-stat-label">Total goals</p>
        </div>
      </div>

      <div className="bpc-footer">
        <button type="button" className="bpc-view-btn" onClick={onViewClick}>
          View Bucket List
        </button>
      </div>
    </div>
  );
}
