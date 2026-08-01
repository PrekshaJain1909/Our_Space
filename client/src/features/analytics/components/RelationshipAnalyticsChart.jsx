import React, { useMemo } from "react";
import "./Analytics.css";

/**
 * Props:
 *   logs: [{ date, kind: "kiss"|"hug"|"meetup", count }]
 */
export default function RelationshipAnalyticsChart({ logs = [] }) {
  const stats = useMemo(() => {
    const totals = { kiss: 0, hug: 0, meetup: 0 };

    logs.forEach((l) => {
      if (totals[l.kind] != null) {
        totals[l.kind] += l.count;
      }
    });

    const maxVal = Math.max(totals.kiss, totals.hug, totals.meetup, 1);
    const totalAll = totals.kiss + totals.hug + totals.meetup;

    return { totals, maxVal, totalAll };
  }, [logs]);

  const { kiss, hug, meetup } = stats.totals;
  const calcWidth = (v) => `${(v / stats.maxVal) * 100}%`;

  return (
    <div className="an-card">
      <div className="an-header">
        <span className="an-badge">Relationship Analytics</span>
        <p className="an-subtitle">
          Simple overview of kisses, hugs and meetups you’ve logged so far. 💑
        </p>
      </div>

      {stats.totalAll === 0 ? (
        <p className="an-empty">
          No relationship logs yet. Start tracking your cute moments ✨
        </p>
      ) : (
        <>
          <div className="an-rel-bars">
            <div className="an-rel-row">
              <span className="an-rel-label">Kisses</span>
              <div className="an-rel-track">
                <div
                  className="an-rel-fill an-rel-kiss"
                  style={{ width: calcWidth(kiss) }}
                />
              </div>
              <span className="an-rel-value">{kiss}</span>
            </div>

            <div className="an-rel-row">
              <span className="an-rel-label">Hugs</span>
              <div className="an-rel-track">
                <div
                  className="an-rel-fill an-rel-hug"
                  style={{ width: calcWidth(hug) }}
                />
              </div>
              <span className="an-rel-value">{hug}</span>
            </div>

            <div className="an-rel-row">
              <span className="an-rel-label">Meetups</span>
              <div className="an-rel-track">
                <div
                  className="an-rel-fill an-rel-meetup"
                  style={{ width: calcWidth(meetup) }}
                />
              </div>
              <span className="an-rel-value">{meetup}</span>
            </div>
          </div>

          <p className="an-chart-total">
            Total moments logged: <span>{stats.totalAll}</span>
          </p>
        </>
      )}
    </div>
  );
}
