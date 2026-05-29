import React from 'react';
import './HealingZone.css';
import { useHealing } from '../context/HealingContext';

export default function PromiseList({ onRequestComplete }) {
  const { promises, completePromise } = useHealing();
  // normalize id fields and dedupe by id (prefer non-temp ids)
  if (!promises || promises.length === 0) {
    return <div className="hz-card"><p className="hz-empty-sub">No promises yet — add one above to get started. ✨</p></div>;
  }

  const byId = new Map();
  for (const p of promises) {
    const id = p.id || p._id || `noid:${JSON.stringify(p)}`;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, { ...p, id });
    } else {
      const existingIsTemp = String(existing.id).startsWith('temp');
      const itIsTemp = String(id).startsWith('temp');
      if (existingIsTemp && !itIsTemp) {
        byId.set(id, { ...p, id });
      } else if (!existingIsTemp && itIsTemp) {
        // keep existing
      } else {
        // keep the one with newer createdAt
        const eTime = new Date(existing.createdAt).getTime() || 0;
        const iTime = new Date(p.createdAt).getTime() || 0;
        if (iTime > eTime) byId.set(id, { ...p, id });
      }
    }
  }

  const deduped = Array.from(byId.values());
  const active = deduped.filter((p) => p.status !== 'done');
  const completed = deduped.filter((p) => p.status === 'done');

  const formatDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return d; }
  };

  return (
    <div className="hz-card">
      <div className="hz-header">
        <span className="hz-badge">Active Promises</span>
        <p className="hz-subtitle">Shared promises between you and your partner</p>
      </div>

      <div className="hz-table-list">
        {active.length === 0 && <p className="hz-empty">No active promises. 🎈</p>}
        {active.map((p) => (
          <article key={p.id} className={`hz-entry-row ${p.status === 'done' ? 'completed' : ''}`} style={{ transition: 'all 240ms ease' }}>
            <div className="hz-entry-main">
              <p className="hz-entry-who">
                <span className="hz-chip hz-chip-apologizer">{p.apologizer}</span>
                <span className="hz-entry-arrow">→</span>
                <span className="hz-chip hz-chip-forgiver">{p.forgiver}</span>
              </p>
              <p className="hz-entry-why">{p.punishment || p.title || p.description}</p>
              {p.description && <p className="hz-entry-punish">{p.description}</p>}
            </div>
            <div className="hz-entry-meta">
              <label style={{display:'flex',alignItems:'center',gap:8}}>
                <input
                  type="checkbox"
                  checked={p.status === 'done'}
                  onChange={() => (onRequestComplete ? onRequestComplete(p.id) : (completePromise && completePromise(p.id)))}
                />
                <span className={`hz-status hz-status-${p.status}`}>{p.status === 'done' ? 'Completed ❤️' : 'Active'}</span>
              </label>
              <span className="hz-entry-date">{formatDate(p.createdAt)}</span>
              {p.dueDate && <div className="hz-entry-completed">Due by {formatDate(p.dueDate)}</div>}
            </div>
          </article>
        ))}
      </div>

      <div style={{ height: 12 }} />

      <div className="hz-header">
        <span className="hz-badge">Completed Promises</span>
        <p className="hz-subtitle">Promises you both have kept</p>
      </div>

      <div className="hz-table-list">
        {completed.length === 0 && <p className="hz-empty">No completed promises yet. 💖</p>}
        {completed.map((p) => (
          <article key={p.id} className={`hz-entry-row completed`} style={{ transition: 'all 300ms ease' }}>
            <div className="hz-entry-main">
              <p className="hz-entry-who">
                <span className="hz-chip hz-chip-apologizer">{p.apologizer}</span>
                <span className="hz-entry-arrow">→</span>
                <span className="hz-chip hz-chip-forgiver">{p.forgiver}</span>
              </p>
              <p className="hz-entry-why">{p.punishment || p.title || p.description}</p>
            </div>
            <div className="hz-entry-meta">
              <span className={`hz-status hz-status-done`}>Completed</span>
              <span className="hz-entry-date">{formatDate(p.createdAt)}</span>
              {p.doneAt && (
                <div className="hz-entry-completed">Completed on {formatDate(p.doneAt)} <span className="hz-heart">❤️</span></div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}