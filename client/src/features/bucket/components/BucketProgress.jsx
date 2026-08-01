import React, { useMemo } from "react";
import "./Bucket.css";

export default function BucketProgress({ items = [] }) {
  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.status === "done").length;
    const pending = total - done;
    const percent = total ? Math.round((done / total) * 100) : 0;

    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || { total: 0, done: 0 };
      acc[item.category].total += 1;
      if (item.status === "done") acc[item.category].done += 1;
      return acc;
    }, {});

    return { total, done, pending, percent, byCategory };
  }, [items]);

  const categories = Object.entries(stats.byCategory);

  return (
    <div className="bk-card">
      <div className="bk-header">
        <span className="bk-badge">Bucket List Progress</span>
        <p className="bk-subtitle">
          See how many dreams you’ve already ticked off together. 🎯
        </p>
      </div>

      <div className="bk-progress-main">
        <div className="bk-progress-ring-wrapper">
          <div className="bk-progress-ring-bg" />
          <div
            className="bk-progress-ring-fill"
            style={{ "--bk-progress": `${stats.percent}` }}
          />
          <div className="bk-progress-center">
            <p className="bk-progress-percent">{stats.percent}%</p>
            <p className="bk-progress-label">Completed</p>
          </div>
        </div>

        <div className="bk-progress-stats">
          <p className="bk-progress-line">
            Total tasks: <span>{stats.total}</span>
          </p>
          <p className="bk-progress-line">
            Done: <span>{stats.done}</span> · Pending: <span>{stats.pending}</span>
          </p>
          <p className="bk-progress-note">
            Aim to reach 100% before your next big milestone together. 💫
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="bk-progress-cats">
          {categories.map(([cat, data]) => {
            const cPercent = data.total
              ? Math.round((data.done / data.total) * 100)
              : 0;
            return (
              <div key={cat} className="bk-cat-row">
                <span className="bk-cat-label">{cat}</span>
                <div className="bk-cat-bar">
                  <div
                    className="bk-cat-fill"
                    style={{ width: `${cPercent}%` }}
                  />
                </div>
                <span className="bk-cat-value">
                  {data.done}/{data.total}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
