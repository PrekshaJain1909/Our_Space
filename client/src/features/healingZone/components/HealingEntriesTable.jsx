import React, { useMemo, useState } from "react";
import "./HealingZone.css";

/**
 * entries = [
 *  { id, apologizer, forgiver, why, punishment, status, createdAt, doneAt }
 * ]
 */
export default function HealingEntriesTable({ entries = [], onComplete = null, onDelete = null, onRequestComplete = null }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesStatus =
        statusFilter === "all" ? true : e.status === statusFilter;

      const matchesPerson = personFilter
        ? e.apologizer.toLowerCase().includes(personFilter.toLowerCase()) ||
          e.forgiver.toLowerCase().includes(personFilter.toLowerCase())
        : true;

      const matchesDate = dateFilter
        ? new Date(e.createdAt).toISOString().slice(0, 10) === dateFilter
        : true;

      return matchesStatus && matchesPerson && matchesDate;
    });
  }, [entries, statusFilter, personFilter, dateFilter]);

  return (
    <div className="hz-card">
      <div className="hz-header">
        <span className="hz-badge">Healing Entries</span>
        <p className="hz-subtitle">
          All mistakes & punishments listed as a soft little to-do. 📋
        </p>
      </div>

      {/* filters */}
      <div className="hz-filters">
        <div className="hz-filter-field">
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

        <div className="hz-filter-field">
          <label>Person</label>
          <input
            type="text"
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            placeholder="Filter by name"
          />
        </div>

        <div className="hz-filter-field">
          <label>Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* list */}
      <div className="hz-table-list">
        {filteredEntries.length === 0 ? (
          <p className="hz-empty">No entries for these filters yet. ✨</p>
        ) : (
          filteredEntries.map((e) => {
            const isPromise = e.type === 'promise';
            return (
              <article key={e.id} className={`hz-entry-row ${e.status === 'done' || e.status === 'completed' ? 'completed' : ''}`}>
                <div className="hz-entry-main">
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span className="hz-entry-type" style={{fontSize:12,opacity:0.9}}>{isPromise ? 'Promise 💖' : 'Healing Entry 🌸'}</span>
                  </div>
                  <p className="hz-entry-who">
                    <span className="hz-chip hz-chip-apologizer">
                      {e.apologizer}
                    </span>
                    <span className="hz-entry-arrow">→</span>
                    <span className="hz-chip hz-chip-forgiver">
                      {e.forgiver}
                    </span>
                  </p>
                  <p className="hz-entry-why">{isPromise ? (e.punishment || e.title || e.description || e.promiseText) : e.why}</p>
                  {e.punishment && (
                    <p className="hz-entry-punish">
                      Punishment: <span>{e.punishment}</span>
                    </p>
                  )}
                </div>
                <div className="hz-entry-meta">
                  <label style={{display:'flex',alignItems:'center',gap:8}}>
                    <input
                      type="checkbox"
                      checked={e.status === 'done' || e.status === 'completed'}
                      onChange={() => onRequestComplete ? onRequestComplete(e) : (onComplete && onComplete(e.id))}
                    />
                    <span className={`hz-status hz-status-${e.status}`}>
                      {e.status === "done" || e.status === 'completed' ? "Completed" : "Active"}
                    </span>
                  </label>

                  <span className="hz-entry-date">
                    {new Date(e.createdAt).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {e.doneAt && (
                    <div className="hz-entry-completed">Completed on {new Date(e.doneAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} ❤️</div>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  );
}
