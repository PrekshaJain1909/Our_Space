import React, { useState, useEffect, useContext } from "react";
import "./HealingZone.css";
import CoupleContext from '../../../context/CoupleContext';
import useAuth from '../../../hooks/useAuth';
import useToast from '../../../hooks/useToast';
import { useHealing } from '../context/HealingContext';

const isLikelyObjectId = (value) => typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

export default function HealingEntryForm({ onAddEntry }) {
  const { couple } = useContext(CoupleContext);
  const { user } = useAuth();
  const healingCtx = useHealing();
  const { success, error: showError } = useToast();

  const partners = [];
  if (couple) {
    if (couple.partnerA) partners.push({ id: couple.partnerA._id || couple.partnerA, name: couple.partnerA.name || couple.partnerA });
    if (couple.partnerB) partners.push({ id: couple.partnerB._id || couple.partnerB, name: couple.partnerB.name || couple.partnerB });
  }

  const meId = user?._id || user?.userId || null;
  const hasSinglePartner = partners.length === 1;
  const singlePartnerLabel = partners[0]?.name || user?.name || "Your partner";

  const [apologizerId, setApologizerId] = useState(meId || "");
  const [forgiverId, setForgiverId] = useState("");
  const [why, setWhy] = useState("");
  const [punishment, setPunishment] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!couple) return;

    if (partners.length === 1) {
      setApologizerId(meId || partners[0].id);
      setForgiverId("");
      return;
    }

    if (!meId && partners.length === 2) {
      setApologizerId(partners[0].id);
      setForgiverId(partners[1].id);
      return;
    }

    if (meId && partners.length === 2) {
      setApologizerId(meId);
      const other = partners.find((p) => p.id !== meId);
      setForgiverId(other ? other.id : partners[0].id);
    }
  }, [couple, meId, partners.length]);

  const handleSubmit = async (e) => {
    console.log("[HealingEntryForm] Save button clicked");
    e.preventDefault();
    console.log("[HealingEntryForm] form values", { apologizerId, forgiverId, why: why.trim(), punishment: punishment.trim() });

    setFormError("");

    if (!why.trim()) {
      const validationError = "Please tell us what happened before saving.";
      console.warn("[HealingEntryForm] validation failed:", validationError);
      setFormError(validationError);
      showError(validationError);
      return;
    }

    const normalizedApologizerId = apologizerId || meId || "";
    const normalizedForgiverId = forgiverId || "";
    const selectedPartner = partners.find((p) => p.id === normalizedForgiverId);
    const normalizedAssignedTo = isLikelyObjectId(normalizedForgiverId) ? normalizedForgiverId : null;

    const formData = {
      reason: why.trim(),
      punishment: punishment.trim(),
      description: description.trim(),
      assignedTo: normalizedAssignedTo,
      apologizer: user?.name || "You",
      forgiver: hasSinglePartner ? singlePartnerLabel : (selectedPartner?.name || user?.name || "Your partner"),
      type: "punishment",
    };

    console.log("[HealingEntryForm] formData", formData);

    try {
      setIsSubmitting(true);
      if (onAddEntry) {
        await onAddEntry(formData);
      } else if (healingCtx && healingCtx.addEntry) {
        await healingCtx.addEntry(formData);
      }

      console.log("[HealingEntryForm] save completed successfully");
      success("Entry saved successfully");
      setWhy("");
      setPunishment("");
      setDescription("");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to save entry right now.";
      console.error("[HealingEntryForm] save failed", err);
      setFormError(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
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
                if (partners.length > 1) {
                  const other = partners.find((p) => p.id !== v);
                  setForgiverId(other ? other.id : partners[0]?.id || '');
                } else {
                  setForgiverId('');
                }
              }}
              required
              className="bg-white text-gray-900 placeholder-gray-500 dark:bg-[#07001fcc] dark:text-white"
            >
              {partners.length === 0 ? (
                <option value="">{user?.name || "You"}</option>
              ) : (
                partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="hz-field">
            <label>Forgiver</label>
            <select
              value={forgiverId}
              onChange={(e) => setForgiverId(e.target.value)}
              required={!hasSinglePartner}
              disabled={hasSinglePartner}
              className="bg-white text-gray-900 placeholder-gray-500 dark:bg-[#07001fcc] dark:text-white"
            >
              {hasSinglePartner ? (
                <option value="">{singlePartnerLabel}</option>
              ) : partners.length === 0 ? (
                <option value="">{user?.name || "You"}</option>
              ) : (
                partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
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

        {formError ? <p className="hz-form-error">{formError}</p> : null}

        <button type="submit" className="hz-primary-btn" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save entry"}
        </button>
      </form>
    </div>
  );
}