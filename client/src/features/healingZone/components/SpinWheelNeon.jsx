import React, { useEffect, useRef, useState } from "react";
import "./SpinWheelNeon.css";
import punishmentApi from '../../../api/punishmentApi';
import useToast from '../../../hooks/useToast';

export default function SpinWheelNeon() {
  const [punishments, setPunishments] = useState([]); // { _id, text }
  const [newPunishment, setNewPunishment] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);

  const wheelRef = useRef(null);
  const { success: toastSuccess, error: toastError } = useToast();

  // fetch templates on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    punishmentApi.getPunishments()
      .then((res) => {
        if (!mounted) return;
        const list = (res && res.data && (res.data.data || res.data)) || res.data || [];
        // normalize to { _id, text }
        const items = Array.isArray(list) ? list.map(t => ({ _id: t._id, text: t.text })) : [];
        setPunishments(items);
      })
      .catch((err) => {
        console.error('Failed to load punishments', err);
        toastError('Failed to load punishments');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const handleAddPunishment = (e) => {
    e.preventDefault();
    const value = newPunishment.trim();
    if (!value) return;
    if (punishments.some(p => p.text === value)) {
      setNewPunishment("");
      return;
    }

    // call backend to create template
    setLoading(true);
    punishmentApi.addPunishment({ text: value })
      .then((res) => {
        const tpl = (res && res.data && (res.data.data || res.data)) || res.data || res;
        const item = { _id: tpl._id, text: tpl.text };
        setPunishments((prev) => [...prev, item]);
        setNewPunishment("");
        toastSuccess('Punishment added');
      })
      .catch((err) => {
        console.error('Add failed', err);
        toastError('Failed to add punishment');
      })
      .finally(() => setLoading(false));
  };

  const handleRemovePunishment = (item) => {
    // optimistic remove
    const orig = [...punishments];
    setPunishments((prev) => prev.filter((p) => p._id !== item._id));
    punishmentApi.deletePunishment(item._id)
      .then(() => {
        toastSuccess('Punishment removed');
      })
      .catch((err) => {
        console.error('Delete failed', err);
        toastError('Failed to remove punishment');
        setPunishments(orig);
      });
    if (selected && selected._id === item._id) setSelected(null);
  };

  const handleSpin = async () => {
    if (spinning || punishments.length === 0) return;
    setSpinning(true);
    setSelected(null);

    try {
      const res = await punishmentApi.spinPunishment();
      const body = res && res.data && (res.data.data || res.data) || res.data || res;
      const serverText = body && (body.text || body);

      // find index in current list
      let index = punishments.findIndex(p => p.text === serverText);
      let addedTemp = false;
      if (index === -1) {
        // temporarily include generated item at end
        const temp = { _id: `temp-${Date.now()}`, text: serverText };
        setPunishments(prev => [...prev, temp]);
        index = punishments.length; // last index
        addedTemp = true;
      }

      const segmentAngle = 360 / (punishments.length || 1);
      const chosenAngle = index * segmentAngle + segmentAngle / 2;
      const extraTurns = 4;
      const finalRotation = rotation + extraTurns * 360 + (360 - chosenAngle);
      setRotation(finalRotation);
      setSelected({ _id: null, text: serverText });

      setTimeout(() => {
        setSpinning(false);
        // cleanup temp
        if (addedTemp) setPunishments(prev => prev.filter(p => !String(p._id).startsWith('temp-')));
      }, 4200);
    } catch (err) {
      console.error('Spin failed', err);
      toastError('Failed to spin the wheel');
      setSpinning(false);
    }
  };

  const handleSaveSelected = async () => {
    if (!selected || !selected.text) return;
    setLoading(true);
    try {
      const resp = await punishmentApi.saveGeneratedPunishment({ text: selected.text });
      toastSuccess('Saved generated punishment');
    } catch (err) {
      console.error('Save generated failed', err);
      toastError('Failed to save generated punishment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sw-wrapper">
      <div className="sw-layout">
        {/* Left: wheel */}
        <div className="sw-wheel-area">
          <div className="sw-pointer" />
          <div
            ref={wheelRef}
            className={`sw-wheel ${spinning ? "sw-wheel-spinning" : ""}`}
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Simple text in center */}
            <div className="sw-center">
              <span className="sw-center-label">
                {spinning ? "Spinning..." : "Tap to Spin"}
              </span>
            </div>

            {/* segments just for feel */}
            {punishments.map((p, idx) => (
              <div
                key={p._id}
                className="sw-segment-text"
                style={{
                  transform: `rotate(${(360 / (punishments.length || 1)) * idx}deg)`,
                }}
              >
                <span>{p.text}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="sw-spin-btn"
            onClick={handleSpin}
            disabled={spinning || punishments.length === 0}
          >
            {spinning ? "Spinning..." : "Spin the wheel"}
          </button>

          {selected && !spinning && (
            <div className="sw-result">
              <p className="sw-result-label">Selected punishment</p>
              <p className="sw-result-text">{selected.text}</p>
              <div className="mt-3 space-x-2">
                <button type="button" className="sw-save-btn" onClick={handleSaveSelected} disabled={loading}>Save</button>
              </div>
            </div>
          )}

          {punishments.length === 0 && (
            <p className="sw-empty">Add a few punishments to spin 🎡</p>
          )}
        </div>

        {/* Right: list + add form */}
        <div className="sw-list-area">
          <form className="sw-add-form" onSubmit={handleAddPunishment}>
            <label className="sw-add-label">Add punishment</label>
            <div className="sw-add-row">
              <input
                type="text"
                value={newPunishment}
                onChange={(e) => setNewPunishment(e.target.value)}
                placeholder="e.g. 10 squats, dance, cook something…"
              />
              <button type="submit" className="sw-add-btn">
                Add
              </button>
            </div>
          </form>

          <div className="sw-list">
            {punishments.map((p) => (
              <div key={p._id} className="sw-item">
                <span className="sw-item-text">{p.text}</span>
                <button
                  type="button"
                  className="sw-remove-btn"
                  onClick={() => handleRemovePunishment(p)}
                >
                  ✕
                </button>
              </div>
            ))}
            {punishments.length === 0 && (
              <p className="sw-empty-list">No punishments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
