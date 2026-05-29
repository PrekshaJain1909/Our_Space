import React from 'react';
import './HealingZone.css';

export default function ConfirmationModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Yes, Completed 💕', cancelLabel = 'Cancel', loading = false }) {
  if (!open) return null;

  return (
    <div className="hz-modal-backdrop">
      <div className="hz-modal">
        <h3 className="hz-modal-title">{title}</h3>
        <p className="hz-modal-message">{message}</p>
        <div className="hz-modal-actions">
          <button className="hz-secondary-btn" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
          <button className="hz-primary-btn" onClick={onConfirm} disabled={loading}>{loading ? 'Saving…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}