import React, { useState, useMemo, useCallback } from "react";
import "./HealingZone.css";
import { useHealing } from '../context/HealingContext';
import CoupleContext from '../../../context/CoupleContext';
import useAuth from '../../../hooks/useAuth';

export default function PromiseEntryForm({ onAddPromise }) {
  const healingCtx = useHealing();
  const { couple } = React.useContext(CoupleContext) || {};
  const { isAuthenticated, user } = useAuth();

  const femaleName = couple?.partnerA?.name || couple?.femaleName || null;
  const maleName = couple?.partnerB?.name || couple?.maleName || null;

  const partners = useMemo(() => {
    const list = [];
    if (femaleName) list.push(femaleName);
    if (maleName && maleName !== femaleName) list.push(maleName);
    if (list.length === 0) return ["Partner A", "Partner B"];
    if (list.length === 1) return [list[0], "Partner B"];
    return list;
  }, [femaleName, maleName]);

  // default indices
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(() => (partners.length > 1 ? 1 : 0));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const pickOther = useCallback((excludeIndex) => partners.findIndex((_, i) => i !== excludeIndex), [partners]);

  const handleFromChange = useCallback((e) => {
    const newFrom = Number(e.target.value);
    if (Number.isNaN(newFrom) || newFrom < 0 || newFrom >= partners.length) return;
    if (newFrom === toIndex) {
      const newTo = pickOther(newFrom);
      setFromIndex(newFrom);
      setToIndex(newTo);
    } else {
      setFromIndex(newFrom);
    }
  }, [partners.length, pickOther, toIndex]);

  const handleToChange = useCallback((e) => {
    const newTo = Number(e.target.value);
    if (Number.isNaN(newTo) || newTo < 0 || newTo >= partners.length) return;
    if (newTo === fromIndex) {
      const newFrom = pickOther(newTo);
      setToIndex(newTo);
      setFromIndex(newFrom);
    } else {
      setToIndex(newTo);
    }
  }, [partners.length, pickOther, fromIndex]);

  const disabledSelects = !isAuthenticated;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!title || !title.trim()) return;

    const payload = {
      title: title.trim(),
      promiseText: description || title,
      dueDate: dueDate || null,
    };

    if (onAddPromise) onAddPromise(payload);
    else if (healingCtx && healingCtx.addPromise) healingCtx.addPromise(payload);

    setTitle("");
    setDescription("");
    setDueDate("");
    setFromIndex(0);
    setToIndex(partners.length > 1 ? 1 : 0);
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
            <label>From</label>
            <select value={fromIndex} onChange={handleFromChange} disabled={disabledSelects}>
              {partners.map((p, i) => (
                <option key={p + i} value={i}>{p}</option>
              ))}
            </select>
          </div>

          <div className="hz-field">
            <label>To</label>
            <select value={toIndex} onChange={handleToChange} disabled={disabledSelects}>
              {partners.map((p, i) => (
                <option key={p + i} value={i} disabled={i === fromIndex}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hz-field">
          <label>Promise title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monthly date night" disabled={!isAuthenticated} required />
        </div>

        <div className="hz-field">
          <label>Description (optional)</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="More details about this promise…" disabled={!isAuthenticated} />
        </div>

        <div className="hz-field">
          <label>Due date (optional)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={!isAuthenticated} />
        </div>

        <button type="submit" className="hz-primary-btn" disabled={!isAuthenticated}>Save promise</button>
      </form>
    </div>
  );
}