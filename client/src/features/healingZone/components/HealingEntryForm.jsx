import React, { useState, useEffect, useContext } from "react";
import "./HealingZone.css";
import CoupleContext from '../../../context/CoupleContext';
import useAuth from '../../../hooks/useAuth';
import { useHealing } from '../context/HealingContext';

export default function HealingEntryForm({ onAddEntry }) {
  const { couple } = useContext(CoupleContext);
  const { user } = useAuth();
  const healingCtx = useHealing();

  const partners = [];
  if (couple) {
    if (couple.partnerA) partners.push({ id: couple.partnerA._id || couple.partnerA, name: couple.partnerA.name || couple.partnerA });
    if (couple.partnerB) partners.push({ id: couple.partnerB._id || couple.partnerB, name: couple.partnerB.name || couple.partnerB });
  }

  const meId = user?._id || user?.userId || null;

  const [apologizerId, setApologizerId] = useState(meId || "");
  const [forgiverId, setForgiverId] = useState("");
  const [why, setWhy] = useState("");
  const [punishment, setPunishment] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // default selections when couple and user are known
    if (!couple) return;
    if (!meId && partners.length === 2) {
      setApologizerId(partners[0].id);
      setForgiverId(partners[1].id);
      return;
    }
    if (meId && partners.length === 2) {
      // default apologizer to current user
      setApologizerId(meId);
      const other = partners.find((p) => p.id !== meId);
      setForgiverId(other ? other.id : partners[0].id);
    }
  }, [couple]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apologizerId || !forgiverId || !why.trim()) return;

    const payload = {
      reason: why.trim(),
      punishment: punishment.trim(),
      description: description.trim(),
      // assign to forgiver id so backend links the user
      assignedTo: forgiverId,
      type: 'punishment',
    };

    // Prefer prop callback, otherwise use context provider
    if (onAddEntry) {
      onAddEntry(payload);
    } else if (healingCtx && healingCtx.addEntry) {
      healingCtx.addEntry(payload);
    }

    setWhy("");
    setPunishment("");
    setDescription("");
  };

  return (
    <div className="hz-card">
      <div className="hz-header">
        <span className="hz-badge">Mistake & Punishment Entry</span>
        <p className="hz-subtitle">
          Who messed up, who forgives, what happened and what’s the punishment? 😅
        </p>
      </div>

      <form className="hz-form" onSubmit={handleSubmit}>
        <div className="hz-row">
          <div className="hz-field">
              <label>Apologizer</label>
              <select
                value={apologizerId}
                onChange={(e) => {
                  const v = e.target.value;
                  setApologizerId(v);
                  // auto-set forgiver to the other partner
                  const other = partners.find((p) => p.id !== v);
                  setForgiverId(other ? other.id : partners[0]?.id || '');
                }}
                required
                className="bg-white text-gray-900 placeholder-gray-500 dark:bg-[#07001fcc] dark:text-white"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="hz-field">
              <label>Forgiver</label>
              <select
                value={forgiverId}
                onChange={(e) => setForgiverId(e.target.value)}
                required
                className="bg-white text-gray-900 placeholder-gray-500 dark:bg-[#07001fcc] dark:text-white"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
        </div>

        <div className="hz-field">
          <label>What happened? (Why)</label>
          <textarea
            rows={3}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Explain the mistake in your own words…"
            required
            className="bg-white text-gray-900 border border-pink-200 dark:bg-[#07001fcc] dark:text-white"
          />
        </div>

        <div className="hz-field">
          <label>Punishment</label>
          <input
            type="text"
            value={punishment}
            onChange={(e) => setPunishment(e.target.value)}
            placeholder="e.g. 20 push-ups, dance on a song, cook dinner…"
            className="bg-white text-gray-900 placeholder-gray-500 dark:bg-[#07001fcc] dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="hz-field">
          <label>Description (optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any extra details about how you’ll fix it…"
            className="bg-white text-gray-900 border border-pink-200 dark:bg-[#07001fcc] dark:text-white"
          />
        </div>

        <button type="submit" className="hz-primary-btn">
          Save entry
        </button>
      </form>
    </div>
  );
}