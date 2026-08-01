import React, { useState } from "react";
import { FaCalendarAlt, FaFemale, FaMale, FaCheck, FaPlus, FaTrash } from "react-icons/fa";

export default function FirstTimeSetupModal({ isOpen, onSave, isSaving, initialData, userGender }) {
  const [lastPeriodStart, setLastPeriodStart] = useState(
    initialData?.lastPeriodStart
      ? new Date(initialData.lastPeriodStart).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [cycleLength, setCycleLength] = useState(initialData?.cycleLength || 28);
  const [dontRememberCycle, setDontRememberCycle] = useState(false);
  const [periodLength, setPeriodLength] = useState(initialData?.periodLength || 5);
  const [gender, setGender] = useState(userGender || "female");

  const [phases, setPhases] = useState(
    initialData?.phases?.length > 0 ? initialData.phases : [
      { key: "period", name: "Period Days", desc: "Rest and hydration", color: "#FCA5A5", startDay: 1, endDay: 5 },
      { key: "freshStart", name: "Fresh Start", desc: "Recovery and renewed energy", color: "#86EFAC", startDay: 6, endDay: 10 },
      { key: "bestDays", name: "Best Days", desc: "Energetic and confident", color: "#FDE047", startDay: 11, endDay: 16 },
      { key: "calmDays", name: "Calm Days", desc: "Balanced phase", color: "#A7F3D0", startDay: 17, endDay: 23 },
      { key: "takeCare", name: "Take Care Days", desc: "Period may be approaching; cravings or bloating possible", color: "#FDBA74", startDay: 24, endDay: 28 },
    ]
  );

  if (!isOpen) return null;

  const handlePhaseChange = (index, field, value) => {
    const newPhases = [...phases];
    newPhases[index][field] = field === "startDay" || field === "endDay" ? Number(value) : value;
    setPhases(newPhases);
  };

  const handleAddPhase = () => {
    setPhases([...phases, {
      key: `custom_${Date.now()}`,
      name: "New Phase",
      desc: "",
      color: "#D1D5DB",
      startDay: 1,
      endDay: 1,
      isCustom: true
    }]);
  };

  const handleRemovePhase = (index) => {
    const newPhases = phases.filter((_, i) => i !== index);
    setPhases(newPhases);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCycleLength = dontRememberCycle ? 28 : Number(cycleLength);
    onSave({
      lastPeriodStart,
      cycleLength: finalCycleLength,
      periodLength: Number(periodLength),
      gender,
      phases,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-surface border border-theme rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] text-primary">
        {/* Header */}
        <div className="text-center space-y-2 mb-6 shrink-0">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-500/10 text-pink-500 text-2xl mb-1">
            🌸
          </div>
          <h2 className="text-2xl font-bold">Shared Period Tracker Setup</h2>
          <p className="text-sm text-secondary">
            Set up your cycle parameters and customize phases together.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
          <form id="setup-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Gender / Role Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                Your Role / Gender in App
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    gender === "female"
                      ? "border-pink-500 bg-pink-500/10 text-pink-500 font-bold shadow"
                      : "border-theme bg-surface-subtle text-secondary hover:text-primary"
                  }`}
                >
                  <FaFemale className="text-lg" />
                  <span>Female Partner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    gender === "male"
                      ? "border-blue-500 bg-blue-500/10 text-blue-500 font-bold shadow"
                      : "border-theme bg-surface-subtle text-secondary hover:text-primary"
                  }`}
                >
                  <FaMale className="text-lg" />
                  <span>Male Partner</span>
                </button>
              </div>
            </div>

            {/* Last Period Start Date */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                1. Last Period Start Date
              </label>
              <input
                type="date"
                value={lastPeriodStart}
                onChange={(e) => setLastPeriodStart(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-theme bg-surface-subtle focus:outline-none focus:border-pink-500 text-primary"
              />
            </div>

            {/* Cycle Length */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                  2. Average Cycle Length (21–35 days)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dontRememberCycle}
                    onChange={(e) => {
                      setDontRememberCycle(e.target.checked);
                      if (e.target.checked) setCycleLength(28);
                    }}
                    className="rounded border-theme text-pink-500 focus:ring-0"
                  />
                  <span>I don't remember (Default 28)</span>
                </label>
              </div>
              {!dontRememberCycle ? (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="21"
                    max="35"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    className="w-full accent-pink-500"
                  />
                  <span className="w-12 text-center font-bold text-pink-500 text-lg">
                    {cycleLength}d
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-surface-subtle text-xs text-secondary rounded-xl text-center">
                  Using standard 28-day cycle length.
                </div>
              )}
            </div>

            {/* Period Duration */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                3. Average Period Length (2–10 days)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
                  className="w-full accent-pink-500"
                />
                <span className="w-12 text-center font-bold text-pink-500 text-lg">
                  {periodLength}d
                </span>
              </div>
            </div>

            {/* Phase Configuration */}
            <div className="space-y-4 pt-4 border-t border-theme">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                  4. Customize Cycle Phases
                </label>
                <button
                  type="button"
                  onClick={handleAddPhase}
                  className="flex items-center gap-1.5 text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors bg-pink-500/10 px-2 py-1 rounded-md"
                >
                  <FaPlus /> Add Phase
                </button>
              </div>

              <div className="space-y-3">
                {phases.map((phase, idx) => (
                  <div key={idx} className="p-3 bg-surface-subtle border border-theme rounded-xl space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemovePhase(idx)}
                      className="absolute top-2 right-2 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash size={12} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-secondary uppercase">Name</label>
                        <input
                          type="text"
                          value={phase.name}
                          onChange={(e) => handlePhaseChange(idx, "name", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-theme bg-surface focus:outline-none focus:border-pink-500 text-primary"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-secondary uppercase">Color Hex</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={phase.color}
                            onChange={(e) => handlePhaseChange(idx, "color", e.target.value)}
                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={phase.color}
                            onChange={(e) => handlePhaseChange(idx, "color", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded-lg border border-theme bg-surface focus:outline-none focus:border-pink-500 text-primary uppercase"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-secondary uppercase">Start Day</label>
                        <input
                          type="number"
                          min="1"
                          max="35"
                          value={phase.startDay}
                          onChange={(e) => handlePhaseChange(idx, "startDay", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-theme bg-surface focus:outline-none focus:border-pink-500 text-primary"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-secondary uppercase">End Day</label>
                        <input
                          type="number"
                          min="1"
                          max="35"
                          value={phase.endDay}
                          onChange={(e) => handlePhaseChange(idx, "endDay", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-theme bg-surface focus:outline-none focus:border-pink-500 text-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-4 border-t border-theme shrink-0">
          <button
            type="submit"
            form="setup-form"
            disabled={isSaving}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <FaCheck /> Save & Open Period Tracker
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
