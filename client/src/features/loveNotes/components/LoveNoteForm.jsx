import React, { useState, useCallback, useMemo } from "react";

export default function LoveNoteForm({
  onAdd,
  femaleName,
  maleName,
  isAuthenticated,
  // if false (default) then authenticated users cannot change selects
  allowSelectWhenAuthenticated = false,
}) {

  // Build partners list dynamically and dedupe
  const partners = useMemo(() => {
    const list = [];
    if (femaleName) list.push(femaleName);
    if (maleName && maleName !== femaleName) list.push(maleName);
    // fallback to placeholders if list too small
    if (list.length === 0) return ["Partner A", "Partner B"];
    if (list.length === 1) return [list[0], "Partner B"];
    return list;
  }, [femaleName, maleName]);

  // indices into `partners` array
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(() => (partners.length > 1 ? 1 : 0));

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const pickOther = useCallback(
    (excludeIndex) => partners.findIndex((_, i) => i !== excludeIndex),
    [partners]
  );

  const handleFromChange = useCallback(
    (e) => {
      const newFrom = Number(e.target.value);
      if (Number.isNaN(newFrom) || newFrom < 0 || newFrom >= partners.length) return;
      if (newFrom === toIndex) {
        const newTo = pickOther(newFrom);
        setFromIndex(newFrom);
        setToIndex(newTo);
      } else {
        setFromIndex(newFrom);
      }
    },
    [partners.length, pickOther, toIndex]
  );

  const handleToChange = useCallback(
    (e) => {
      const newTo = Number(e.target.value);
      if (Number.isNaN(newTo) || newTo < 0 || newTo >= partners.length) return;
      if (newTo === fromIndex) {
        const newFrom = pickOther(newTo);
        setToIndex(newTo);
        setFromIndex(newFrom);
      } else {
        setToIndex(newTo);
      }
    },
    [partners.length, pickOther, fromIndex]
  );

  const disabledSelects = !isAuthenticated || !allowSelectWhenAuthenticated;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!content) return;

    // Server computes from/to from authenticated user; keep selects for UI only
    onAdd({
      title: title,
      content: content,
      createdAt: new Date(),
    });

    // reset
    setFromIndex(0);
    setToIndex(partners.length > 1 ? 1 : 0);
    setTitle("");
    setContent("");
  };

  return (
    <div className="ln-card">

      <div className="ln-header">
        <div className="ln-badge">Add Love Note</div>
        <div className="ln-subtitle">
          Write a little note of love to re-read on sad days 💖
        </div>
      </div>

      <form className="ln-form" onSubmit={handleSubmit}>
        {!isAuthenticated && (
          <div className="ln-subtitle" style={{ marginBottom: 12 }}>
            Guest mode: this form is visible but locked until you login or register.
          </div>
        )}

        <div className="ln-form-row">

          <div className="ln-field">
            <label>From</label>
            <select value={fromIndex} onChange={handleFromChange} disabled={disabledSelects}>
              {partners.map((p, i) => (
                <option key={p + i} value={i}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="ln-field">
            <label>To</label>
            <select value={toIndex} onChange={handleToChange} disabled={disabledSelects}>
              {partners.map((p, i) => (
                <option key={p + i} value={i} disabled={i === fromIndex}>
                  {p}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="ln-field">
          <input
            placeholder="e.g. Reasons I love you..."
            value={title}
            disabled={!isAuthenticated}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="ln-field">
          <textarea
            rows="4"
            placeholder="Write your heart out…"
            value={content}
            disabled={!isAuthenticated}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button className="ln-primary-btn" disabled={!isAuthenticated}>
          {isAuthenticated ? "Save Love Note" : "Save Love Note (Login Required)"}
        </button>

      </form>
    </div>
  );
}