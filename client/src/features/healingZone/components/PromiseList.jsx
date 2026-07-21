import React from 'react';
import './HealingZone.css';
import { useHealing } from '../context/HealingContext';
import useAuth from '../../../hooks/useAuth';

export default function PromiseList({ onRequestComplete }) {
  const { promises, completePromise, acceptPromise, declinePromise, breakPromise } = useHealing();
  const { user } = useAuth();

  const currentUserId = user?._id || user?.id || user?.userId;

  const formatDate = (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (err) {
      return String(value);
    }
  };

  const normalizeId = (promise) => promise.id || promise._id || `noid:${JSON.stringify(promise)}`;
  const dedupedPromises = Array.from(
    new Map((promises || []).map((promise) => [normalizeId(promise), { ...promise, id: normalizeId(promise) }])).values()
  );

  const pending = dedupedPromises.filter((p) => String(p.status).toLowerCase() === 'pending');
  const active = dedupedPromises.filter((p) => String(p.status).toLowerCase() === 'active');
  const completed = dedupedPromises.filter((p) => String(p.status).toLowerCase() === 'completed');
  const broken = dedupedPromises.filter((p) => String(p.status).toLowerCase() === 'broken');
  const declined = dedupedPromises.filter((p) => String(p.status).toLowerCase() === 'declined');

  const canRespond = (promise) => currentUserId && String(currentUserId) === String(promise.assignedTo);
  const canModify = (promise) =>
    currentUserId &&
    (String(currentUserId) === String(promise.assignedTo) || String(currentUserId) === String(promise.createdBy));

  if (!promises || promises.length === 0) {
    return (
      <div className="hz-card">
        <p className="hz-empty-sub">No promises yet — add one above to get started. ✨</p>
      </div>
    );
  }

  return (
    <div className="hz-card">
      {pending.length > 0 && (
        <>
          <div className="hz-header">
            <span className="hz-badge">Pending Promise Requests</span>
            <p className="hz-subtitle">Accept or decline your partner’s promise requests.</p>
          </div>

          <div className="hz-table-list">
            {pending.map((promise) => (
              <article key={promise.id} className="hz-entry-row pending" style={{ transition: 'all 240ms ease' }}>
                <div className="hz-entry-main">
                  <p className="hz-entry-who">
                    <span className="hz-chip hz-chip-apologizer">{promise.from || 'Requester'}</span>
                    <span className="hz-entry-arrow">→</span>
                    <span className="hz-chip hz-chip-forgiver">{promise.to || 'Partner'}</span>
                  </p>
                  <p className="hz-entry-why">{promise.title || promise.promiseText || promise.description}</p>
                  {promise.description && <p className="hz-entry-punish">{promise.description}</p>}
                </div>
                <div className="hz-entry-meta">
                  <span className="hz-status hz-status-pending">Pending acceptance</span>
                  <span className="hz-entry-date">Requested {formatDate(promise.createdAt)}</span>
                  {canRespond(promise) ? (
                    <div className="hz-button-row">
                      <button type="button" className="hz-secondary-btn" onClick={() => declinePromise(promise.id)}>
                        Decline
                      </button>
                      <button type="button" className="hz-primary-btn" onClick={() => acceptPromise(promise.id)}>
                        Accept
                      </button>
                    </div>
                  ) : (
                    <div className="hz-entry-completed">Waiting for {promise.to || 'your partner'}</div>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div style={{ height: 12 }} />
        </>
      )}

      <div className="hz-header">
        <span className="hz-badge">Active Promises</span>
        <p className="hz-subtitle">Promises that are accepted and in progress.</p>
      </div>

      <div className="hz-table-list">
        {active.length === 0 && <p className="hz-empty">No active promises. 🎈</p>}
        {active.map((promise) => (
          <article key={promise.id} className="hz-entry-row" style={{ transition: 'all 240ms ease' }}>
            <div className="hz-entry-main">
              <p className="hz-entry-who">
                <span className="hz-chip hz-chip-apologizer">{promise.from || 'Requester'}</span>
                <span className="hz-entry-arrow">→</span>
                <span className="hz-chip hz-chip-forgiver">{promise.to || 'Partner'}</span>
              </p>
              <p className="hz-entry-why">{promise.title || promise.promiseText || promise.description}</p>
              {promise.description && <p className="hz-entry-punish">{promise.description}</p>}
            </div>
            <div className="hz-entry-meta">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={promise.status === 'completed'}
                  onChange={() => (onRequestComplete ? onRequestComplete(promise.id) : completePromise?.(promise.id))}
                />
                <span className="hz-status hz-status-active">Active</span>
              </label>
              <span className="hz-entry-date">{formatDate(promise.createdAt)}</span>
              {promise.dueDate && <div className="hz-entry-completed">Due by {formatDate(promise.dueDate)}</div>}
              {canModify(promise) && (
                <button type="button" className="hz-secondary-btn" onClick={() => breakPromise(promise.id)}>
                  Mark broken
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {(completed.length > 0 || broken.length > 0 || declined.length > 0) && <div style={{ height: 12 }} />}

      {completed.length > 0 && (
        <>
          <div className="hz-header">
            <span className="hz-badge">Completed Promises</span>
            <p className="hz-subtitle">Promises that were fulfilled successfully.</p>
          </div>
          <div className="hz-table-list">
            {completed.map((promise) => (
              <article key={promise.id} className="hz-entry-row completed" style={{ transition: 'all 300ms ease' }}>
                <div className="hz-entry-main">
                  <p className="hz-entry-who">
                    <span className="hz-chip hz-chip-apologizer">{promise.from || 'Requester'}</span>
                    <span className="hz-entry-arrow">→</span>
                    <span className="hz-chip hz-chip-forgiver">{promise.to || 'Partner'}</span>
                  </p>
                  <p className="hz-entry-why">{promise.title || promise.promiseText || promise.description}</p>
                </div>
                <div className="hz-entry-meta">
                  <span className="hz-status hz-status-done">Completed</span>
                  <span className="hz-entry-date">{formatDate(promise.createdAt)}</span>
                  {promise.fulfilledAt && (
                    <div className="hz-entry-completed">Fulfilled on {formatDate(promise.fulfilledAt)} ❤️</div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {broken.length > 0 && (
        <>
          <div className="hz-header">
            <span className="hz-badge">Broken Promises</span>
            <p className="hz-subtitle">Promises that were marked as broken.</p>
          </div>
          <div className="hz-table-list">
            {broken.map((promise) => (
              <article key={promise.id} className="hz-entry-row broken" style={{ transition: 'all 300ms ease' }}>
                <div className="hz-entry-main">
                  <p className="hz-entry-who">
                    <span className="hz-chip hz-chip-apologizer">{promise.from || 'Requester'}</span>
                    <span className="hz-entry-arrow">→</span>
                    <span className="hz-chip hz-chip-forgiver">{promise.to || 'Partner'}</span>
                  </p>
                  <p className="hz-entry-why">{promise.title || promise.promiseText || promise.description}</p>
                </div>
                <div className="hz-entry-meta">
                  <span className="hz-status hz-status-broken">Broken</span>
                  <span className="hz-entry-date">{formatDate(promise.createdAt)}</span>
                  {promise.brokenAt && <div className="hz-entry-completed">Broken on {formatDate(promise.brokenAt)}</div>}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {declined.length > 0 && (
        <>
          <div className="hz-header">
            <span className="hz-badge">Declined Requests</span>
            <p className="hz-subtitle">Promise requests your partner declined.</p>
          </div>
          <div className="hz-table-list">
            {declined.map((promise) => (
              <article key={promise.id} className="hz-entry-row declined" style={{ transition: 'all 300ms ease' }}>
                <div className="hz-entry-main">
                  <p className="hz-entry-who">
                    <span className="hz-chip hz-chip-apologizer">{promise.from || 'Requester'}</span>
                    <span className="hz-entry-arrow">→</span>
                    <span className="hz-chip hz-chip-forgiver">{promise.to || 'Partner'}</span>
                  </p>
                  <p className="hz-entry-why">{promise.title || promise.promiseText || promise.description}</p>
                </div>
                <div className="hz-entry-meta">
                  <span className="hz-status hz-status-declined">Declined</span>
                  <span className="hz-entry-date">{formatDate(promise.createdAt)}</span>
                  {promise.declinedAt && <div className="hz-entry-completed">Declined on {formatDate(promise.declinedAt)}</div>}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
