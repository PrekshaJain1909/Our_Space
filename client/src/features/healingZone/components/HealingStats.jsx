import React, { useMemo } from "react";
import "./HealingZone.css";

/**
 * entries = [{ apologizer, forgiver, status }]
 * forgivenessList = [{ entryId, message }]
 */
export default function HealingStats({
  entries = [],
  forgivenessList = [],
  maleLabel = "Him",
  femaleLabel = "Her",
}) {
  const stats = useMemo(() => {
    const apologizerCount = {};
    const forgiverCount = {};
    let pending = 0;
    let done = 0;

    entries.forEach((e) => {
      // status
      if (e.status === "done") done++;
      else pending++;

      // who messed up
      apologizerCount[e.apologizer] = (apologizerCount[e.apologizer] || 0) + 1;

      // who forgives more
      forgiverCount[e.forgiver] = (forgiverCount[e.forgiver] || 0) + 1;
    });

    const mostMessedUp = Object.entries(apologizerCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const mostForgiving = Object.entries(forgiverCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // male vs female completion (based on apologizer name matching labels)
    const doneEntries = entries.filter((e) => e.status === "done");
    const maleDone = doneEntries.filter((e) => e.apologizer === maleLabel).length;
    const femaleDone = doneEntries.filter((e) => e.apologizer === femaleLabel).length;

    const totalDone = maleDone + femaleDone;
    const malePercent = totalDone ? Math.round((maleDone / totalDone) * 100) : 0;
    const femalePercent = totalDone ? 100 - malePercent : 0;

    return {
      totalEntries: entries.length,
      pending,
      done,
      forgivenessCount: forgivenessList.length,
      mostMessedUp: mostMessedUp
        ? { name: mostMessedUp[0], count: mostMessedUp[1] }
        : null,
      mostForgiving: mostForgiving
        ? { name: mostForgiving[0], count: mostForgiving[1] }
        : null,
      maleDone,
      femaleDone,
      malePercent,
      femalePercent,
    };
  }, [entries, forgivenessList, maleLabel, femaleLabel]);

  return (
    <div className="hz-card">
      <div className="hz-header">
        <span className="hz-badge">Healing Stats</span>
        <p className="hz-subtitle">
          Kindness leaderboard & punishment completion overview. 📊
        </p>
      </div>

      <div className="hz-stats-grid">
        <div className="hz-stat-box">
          <p className="hz-stat-label">Total entries</p>
          <p className="hz-stat-value">{stats.totalEntries}</p>
          <p className="hz-stat-sub">
            Pending: {stats.pending} · Done: {stats.done}
          </p>
        </div>

        <div className="hz-stat-box">
          <p className="hz-stat-label">Forgiveness given</p>
          <p className="hz-stat-value">{stats.forgivenessCount}</p>
          <p className="hz-stat-sub">Closed loops & happy endings 💕</p>
        </div>

        <div className="hz-stat-box">
          <p className="hz-stat-label">Who messed up more?</p>
          <p className="hz-stat-value">
            {stats.mostMessedUp ? stats.mostMessedUp.name : "—"}
          </p>
          <p className="hz-stat-sub">
            {stats.mostMessedUp
              ? `${stats.mostMessedUp.count} mistakes logged`
              : "No data yet"}
          </p>
        </div>

        <div className="hz-stat-box">
          <p className="hz-stat-label">Who forgives more?</p>
          <p className="hz-stat-value">
            {stats.mostForgiving ? stats.mostForgiving.name : "—"}
          </p>
          <p className="hz-stat-sub">
            {stats.mostForgiving
              ? `${stats.mostForgiving.count} times forgiving`
              : "No data yet"}
          </p>
        </div>
      </div>

      {/* male vs female bar */}
      <div className="hz-male-female">
        <p className="hz-male-female-title">
          Punishment completion (by {maleLabel} vs {femaleLabel})
        </p>
        <div className="hz-mf-bar">
          <div
            className="hz-mf-segment hz-mf-male"
            style={{ width: `${stats.malePercent}%` }}
          >
            {stats.maleDone > 0 && (
              <span className="hz-mf-label">
                {maleLabel}: {stats.maleDone} ({stats.malePercent}%)
              </span>
            )}
          </div>
          <div
            className="hz-mf-segment hz-mf-female"
            style={{ width: `${stats.femalePercent}%` }}
          >
            {stats.femaleDone > 0 && (
              <span className="hz-mf-label">
                {femaleLabel}: {stats.femaleDone} ({stats.femalePercent}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}