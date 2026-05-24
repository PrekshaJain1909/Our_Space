import React from 'react';
import './HealingZone.css';
import { useHealing } from '../context/HealingContext';

export default function RecentEntries({ max = 6, onRequestComplete = null }) {
  const { entries, completeEntry } = useHealing();

  if (!entries || entries.length === 0) {
    return <div className="hz-card"><p className="hz-empty">No recent entries yet. ✨</p></div>;
  }

  const recent = entries.slice(0, max);

  return (
    <div className="hz-card">
      <div className="hz-header">
        <span className="hz-badge">Recent Entries</span>
        <p className="hz-subtitle">Latest mistakes & punishments</p>
      </div>

      <div className="hz-table-list">
        {recent.map((e) => (
          <article key={e.id} className={`hz-entry-row ${e.status === 'done' ? 'completed' : ''}`}>
            <div className="hz-entry-main">
              <p className="hz-entry-who">
                <span className="hz-chip hz-chip-apologizer">{e.apologizer}</span>
                <span className="hz-entry-arrow">→</span>
                <span className="hz-chip hz-chip-forgiver">{e.forgiver}</span>
              </p>
              <p className="hz-entry-why">{e.why}</p>
              {e.punishment && (
                <p className="hz-entry-punish">Punishment: <span>{e.punishment}</span></p>
              )}
              {e.metadata && (e.metadata.forgivenAt || e.metadata.forgivenessMessage) && (
                <div className="hz-entry-forgiveness">
                  <span className="hz-badge hz-badge-forgiven">Forgiven</span>
                  {e.metadata.forgivenessMessage && <div className="hz-entry-forgive-preview">{String(e.metadata.forgivenessMessage).slice(0, 140)}</div>}
                  {e.metadata.forgivenAt && <div className="hz-entry-forgive-date">{new Date(e.metadata.forgivenAt).toLocaleString()}</div>}
                </div>
              )}
            </div>
            <div className="hz-entry-meta">
              <label style={{display:'flex',alignItems:'center',gap:8}}>
                <input
                  type="checkbox"
                  checked={e.status === 'done' || e.status === 'completed'}
                  onChange={() => onRequestComplete ? onRequestComplete(e.id) : (completeEntry && completeEntry(e.id))}
                />
                <span className={`hz-status hz-status-${e.status}`}>{e.status === 'done' ? 'Completed ❤️' : 'Active'}</span>
              </label>
              <span className="hz-entry-date">{new Date(e.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              {e.doneAt && (
                <div className="hz-entry-completed">Completed on {new Date(e.doneAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} <span className="hz-heart">❤️</span></div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
