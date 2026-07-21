import React, { useState, useMemo } from "react";
import "./HealingZone.css";
import { useHealing } from '../context/HealingContext';
import CoupleContext from '../../../context/CoupleContext';
import useAuth from '../../../hooks/useAuth';

const CATEGORIES = [
  { value: 'sleep', label: '🌙 Sleep' },
  { value: 'study', label: '📚 Study' },
  { value: 'health', label: '💧 Health' },
  { value: 'food', label: '🍔 Food' },
  { value: 'communication', label: '📞 Communication' },
  { value: 'relationship', label: '💕 Relationship' },
  { value: 'custom', label: '🎉 Custom' },
];

export default function PromiseEntryForm({ onAddPromise }) {
  const healingCtx = useHealing();
  const { couple } = React.useContext(CoupleContext) || {};
  const { isAuthenticated, user } = useAuth();

  const currentUserName = user?.name || 'You';
  const partnerName = couple?.partnerA?.name === currentUserName
    ? couple?.partnerB?.name
    : couple?.partnerB?.name === currentUserName
      ? couple?.partnerA?.name
      : couple?.femaleName || couple?.maleName || 'Your partner';

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState('relationship');
  const [dueDate, setDueDate] = useState("");

  const disabledSelects = !isAuthenticated;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!title || !title.trim()) return;

    const payload = {
      title: title.trim(),
      promiseText: description || title.trim(),
      description: description.trim(),
      category,
      dueDate: dueDate || null,
    };

    if (onAddPromise) onAddPromise(payload);
    else if (healingCtx && healingCtx.addPromise) healingCtx.addPromise(payload);

    setTitle("");
    setDescription("");
    setDueDate("");
    setCategory('relationship');
  };

  return (
    <div className="hz-card">
      <div className="hz-header">
        <span className="hz-badge">Promise Entry</span>
        <p className="hz-subtitle">Turn your “I will” moments into trackable promises. 🌙</p>
      </div>

      <form className="hz-form" onSubmit={handleSubmit}>
        {!isAuthenticated && (
          <div className="hz-subtitle" style={{ marginBottom: 12 }}>
            Login to create promises and see them live with your partner.
          </div>
        )}

        <div className="hz-row">
          <div className="hz-field">
            <label>Made by</label>
            <input type="text" value={currentUserName} readOnly />
          </div>
          <div className="hz-field">
            <label>Promise to</label>
            <input type="text" value={partnerName || 'Your partner'} readOnly />
          </div>
        </div>

        <div className="hz-field">
          <label>Promise title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. I promise I’ll sleep before 11 PM" disabled={!isAuthenticated} required />
        </div>

        <div className="hz-field">
          <label>Description (optional)</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="More details about this promise…" disabled={!isAuthenticated} />
        </div>

        <div className="hz-row">
          <div className="hz-field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={disabledSelects}>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="hz-field">
            <label>Due date (optional)</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={!isAuthenticated} />
          </div>
        </div>

        <button type="submit" className="hz-primary-btn" disabled={!isAuthenticated}>Save promise</button>
      </form>
    </div>
  );
}