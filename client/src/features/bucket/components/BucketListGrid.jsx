import React, { useMemo, useState } from "react";
import "./Bucket.css";

export default function BucketListGrid({ items = [], onToggleStatus }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const byStatus =
        statusFilter === "all" ? true : item.status === statusFilter;
      const byCat =
        categoryFilter === "all" ? true : item.category === categoryFilter;
      return byStatus && byCat;
    });
  }, [items, statusFilter, categoryFilter]);

  return (
    <div className="bk-card">
      <div className="bk-header">
        <span className="bk-badge">Bucket List</span>
        <p className="bk-subtitle">
          All your couple goals in one place — tap to mark as done. ✅
        </p>
      </div>

      {/* filters */}
      <div className="bk-filters">
        <div className="bk-filter-field">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="bk-filter-field">
          <label>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
            <option value="adventure">Adventure</option>
            <option value="date">Date idea</option>
            <option value="learning">Learning</option>
            <option value="random">Random cute</option>
          </select>
        </div>
      </div>

      <div className="bk-grid">
        {filtered.length === 0 ? (
          <p className="bk-empty">No bucket tasks found for this filter. ✨</p>
        ) : (
          filtered.map((item) => (
            <article
              key={item.id}
              className={`bk-item ${item.status === "done" ? "bk-item-done" : ""}`}
            >
              <div className="bk-item-main">
                <h3 className="bk-item-title">{item.title}</h3>
                <p className="bk-item-meta">
                  <span className={`bk-chip bk-chip-cat-${item.category}`}>
                    {item.category}
                  </span>
                  <span className="bk-chip bk-chip-for">
                    {item.together === "both"
                      ? "Both"
                      : item.together === "him"
                      ? "Him"
                      : "Her"}
                  </span>
                </p>
                {item.notes && (
                  <p className="bk-item-notes">{item.notes}</p>
                )}
              </div>
              <div className="bk-item-side">
                {item.targetDate && (
                  <p className="bk-item-date">
                    {new Date(item.targetDate).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                <button
                  type="button"
                  className={`bk-status-btn ${
                    item.status === "done" ? "bk-status-btn-done" : ""
                  }`}
                  onClick={() => onToggleStatus && onToggleStatus(item.id)}
                >
                  {item.status === "done" ? "Mark pending" : "Mark done"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
