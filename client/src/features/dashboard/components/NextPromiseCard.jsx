
import React from "react";
import "./NextPromiseCard.css";
/**
 * Example usage:
 * <NextPromiseCard
 *   nextPromise={{
 *     title: "Take you on an ice-cream date",
 *     from: "Him",
 *     to: "Her",
 *     dueDate: "2025-12-12",  // ISO string or "YYYY-MM-DD"
 *     status: "pending",      // "pending" | "fulfilled" | "overdue"
 *   }}
 *   onViewAll={() => navigate("/healing")} // or /promises page
 * />
 */

export default function NextPromiseCard({ nextPromise, onViewAll }) {
  const promise = nextPromise || null;

  let daysLeft = null;
  let prettyDate = null;
  let computedStatus = promise?.status || "pending";

  if (promise?.dueDate) {
    const today = new Date();
    const due = new Date(promise.dueDate);
    // Clear time part
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffMs = due - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    daysLeft = diffDays;

    // override status by date if needed
    if (diffDays < 0 && computedStatus === "pending") {
      computedStatus = "overdue";
    }

    // Pretty date string
    prettyDate = due.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const renderStatusChip = () => {
    const labelMap = {
      pending: "Pending",
      fulfilled: "Fulfilled",
      overdue: "Overdue",
    };
    const label = labelMap[computedStatus] || "Pending";
    return <span className={`npc-status npc-status-${computedStatus}`}>{label}</span>;
  };

  const renderDaysLeft = () => {
    if (daysLeft === null) return "No due date";
    if (daysLeft === 0) return "Due today 🫣";
    if (daysLeft === 1) return "Due tomorrow";
    if (daysLeft < 0) return `${Math.abs(daysLeft)} day(s) late`;
    return `${daysLeft} day(s) left`;
  };

  return (
    <div className="npc-card">
      <div className="npc-header">
        <span className="npc-badge">Next Promise</span>
        <p className="npc-subtitle">The closest promise waiting to be fulfilled.</p>
      </div>

      {!promise ? (
        <div className="npc-empty">
          <p className="npc-empty-line">No upcoming promises right now ✨</p>
          <p className="npc-empty-sub">
            Add a new promise in the Healing Zone to see it here.
          </p>
        </div>
      ) : (
        <>
          <div className="npc-main">
            <div className="npc-title-row">
              <h3 className="npc-title">{promise.title}</h3>
              {renderStatusChip()}
            </div>
            <p className="npc-fromto">
              <span className="npc-chip npc-chip-from">From: {promise.from}</span>
              <span className="npc-chip npc-chip-to">To: {promise.to}</span>
            </p>
          </div>

          <div className="npc-meta-row">
            <div className="npc-meta-block">
              <p className="npc-meta-label">Due date</p>
              <p className="npc-meta-value">{prettyDate || "Not set"}</p>
            </div>
            <div className="npc-meta-block">
              <p className="npc-meta-label">Time</p>
              <p className="npc-meta-value">{renderDaysLeft()}</p>
            </div>
          </div>
        </>
      )}

      <div className="npc-footer">
        <button
          type="button"
          className="npc-view-btn"
          onClick={onViewAll}
        >
          View all promises
        </button>
      </div>
    </div>
  );
}
