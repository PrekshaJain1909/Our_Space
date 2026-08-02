import React, { useEffect, useState } from "react";
import { FaCheck, FaGripVertical, FaPlus, FaRedo, FaTrash } from "react-icons/fa";

const DEFAULT_PHASES = [
  {
    key: "period",
    emoji: "🩸",
    name: "Period Days",
    desc: "Rest and hydration",
    color: "#FCA5A5",
    enabled: true,
    order: 0,
    isCustom: false,
    offsetStart: 0,
    offsetEnd: null,
  },
  {
    key: "takeCare",
    emoji: "☁️",
    name: "Take Care Days",
    desc: "Period may be approaching; cravings or bloating possible",
    color: "#FDBA74",
    enabled: true,
    order: 1,
    isCustom: false,
    offsetStart: -1,
    offsetEnd: -1,
  },
  {
    key: "freshStart",
    emoji: "✨",
    name: "Fresh Start",
    desc: "Recovery and renewed energy",
    color: "#86EFAC",
    enabled: true,
    order: 2,
    isCustom: false,
    offsetStart: 1,
    offsetEnd: 4,
  },
  {
    key: "bestDays",
    emoji: "🌟",
    name: "Best Days",
    desc: "Energetic and confident",
    color: "#FDE047",
    enabled: true,
    order: 3,
    isCustom: false,
    offsetStart: 8,
    offsetEnd: 14,
  },
  {
    key: "calmDays",
    emoji: "🌿",
    name: "Calm Days",
    desc: "Balanced phase",
    color: "#A7F3D0",
    enabled: true,
    order: 4,
    isCustom: false,
    offsetStart: 15,
    offsetEnd: 22,
  },
];

const colorSwatches = [
  "#F472B6",
  "#FB7185",
  "#A78BFA",
  "#C7D2FE",
  "#38BDF8",
  "#6EE7B7",
  "#34D399",
  "#FACC15",
  "#FB923C",
  "#FCA5A5",
];

const hslToHex = (h, s = 80, l = 70) => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
  } else if (h >= 120 && h < 180) {
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (value) => {
    const hex = Math.round((value + m) * 255).toString(16).padStart(2, "0");
    return hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const normalizePhases = (phases = []) =>
  phases
    .map((phase, index) => ({
      key: phase.key || `custom_${Date.now()}_${index}`,
      emoji: phase.emoji || "✨",
      name: phase.name || "New Phase",
      desc: phase.desc || "",
      color: phase.color || "#D1D5DB",
      hue: phase.hue || 0,
      enabled: phase.enabled !== false,
      offsetStart:
        phase.offsetStart !== undefined && !Number.isNaN(Number(phase.offsetStart))
          ? Number(phase.offsetStart)
          : 0,
      offsetEnd:
        phase.offsetEnd !== undefined && !Number.isNaN(Number(phase.offsetEnd))
          ? Number(phase.offsetEnd)
          : phase.offsetStart !== undefined && !Number.isNaN(Number(phase.offsetStart))
          ? Number(phase.offsetStart)
          : 0,
      order: Number(phase.order) || index,
      isCustom: phase.isCustom !== false,
    }))
    .sort((a, b) => a.order - b.order);

const reorderPhases = (phases, fromIndex, toIndex) => {
  const updated = [...phases];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated.map((phase, idx) => ({ ...phase, order: idx }));
};

const gradientPreview = (hex) => `linear-gradient(135deg, ${hex} 0%, #ffffff33 100%)`;

export default function PhaseStudioModal({
  isOpen,
  phases = [],
  cycleLength = 28,
  periodLength = 5,
  onClose,
  onSave,
  isSaving,
}) {
  const [editedPhases, setEditedPhases] = useState(normalizePhases(phases));

  useEffect(() => {
    if (isOpen) {
      setEditedPhases(normalizePhases(phases));
    }
  }, [isOpen, phases]);

  if (!isOpen) {
    return null;
  }

  const handlePhaseChange = (index, field, value) => {
    const updated = [...editedPhases];
    updated[index] = {
      ...updated[index],
      [field]: field === "enabled"
        ? Boolean(value)
        : field === "offsetStart" || field === "offsetEnd"
        ? Number(value)
        : value,
    };
    setEditedPhases(updated);
  };

  const handleAddPhase = () => {
    setEditedPhases((current) => [
      ...current,
      {
        key: `custom_${Date.now()}`,
        emoji: "✨",
        name: "New Phase",
        desc: "",
        color: "#D1D5DB",
        enabled: true,
        offsetStart: 1,
        offsetEnd: 2,
        order: current.length,
        isCustom: true,
      },
    ]);
  };

  const handleRemovePhase = (index) => {
    const updated = editedPhases.filter((_, idx) => idx !== index);
    setEditedPhases(updated.map((phase, idx) => ({ ...phase, order: idx })));
  };

  const handleDragStart = (event, index) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDrop = (event, index) => {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (fromIndex === index) return;
    setEditedPhases((current) => reorderPhases(current, fromIndex, index));
  };

  const handleRestoreDefaults = () => {
    setEditedPhases(normalizePhases(DEFAULT_PHASES));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editedPhases.length === 0) {
      return;
    }
    onSave(
      editedPhases.map((phase, idx) => {
        const { hue, ...cleanPhase } = phase;
        return { ...cleanPhase, order: idx };
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xl p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-theme bg-surface text-primary shadow-2xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <div className="flex flex-col gap-4 border-b border-theme bg-surface-subtle p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                Premium Phase Studio
              </p>
              <h2 className="mt-2 text-3xl font-bold text-primary">Manage Phases</h2>
              <p className="mt-2 text-sm text-secondary max-w-2xl">
                Edit emojis, names, descriptions, and colors for your shared cycle phases. Changes apply instantly for both partners.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="inline-flex items-center gap-2 rounded-3xl border border-theme bg-surface px-4 py-3 text-xs font-semibold text-secondary transition hover:border-pink-500 hover:text-pink-600"
              >
                <FaRedo /> Restore Defaults
              </button>
              <button
                type="button"
                onClick={handleAddPhase}
                className="inline-flex items-center gap-2 rounded-3xl bg-pink-500 px-4 py-3 text-xs font-semibold text-white shadow hover:bg-pink-600"
              >
                <FaPlus /> Add Phase
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="rounded-[32px] border border-theme bg-surface-subtle p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                Phase Preview
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {editedPhases.map((phase) => (
                  <div key={phase.key} className="rounded-3xl border border-theme bg-surface p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-3xl" style={{ backgroundColor: phase.color, opacity: 0.15 }}>
                        <span className="text-xl">{phase.emoji}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">{phase.name}</div>
                        <div className="text-xs text-secondary">{phase.desc || "No description"}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ background: gradientPreview(phase.color) }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="max-h-[62vh] overflow-y-auto space-y-4 custom-scrollbar">
              {editedPhases.map((phase, index) => (
                <div
                  key={phase.key}
                  draggable
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, index)}
                  className="group rounded-[32px] border border-theme bg-surface-subtle p-5 shadow-sm transition hover:border-pink-500"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl" style={{ backgroundColor: phase.color, opacity: 0.18 }}>
                        <span className="text-2xl">{phase.emoji}</span>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
                          Phase {index + 1}
                        </div>
                        <div className="mt-1 text-xl font-semibold text-primary">{phase.name}</div>
                        <p className="mt-1 text-sm text-secondary">{phase.desc || "Add a short phase description."}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-full border border-theme bg-surface px-4 py-2 text-sm text-secondary transition hover:border-pink-500 hover:text-pink-600">
                        <input
                          type="checkbox"
                          checked={phase.enabled}
                          onChange={(event) => handlePhaseChange(index, "enabled", event.target.checked)}
                          className="h-4 w-4 rounded text-pink-500"
                        />
                        Enabled
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(index)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-theme text-secondary transition hover:border-red-500 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-theme text-secondary">
                        <FaGripVertical />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <label className="space-y-2 text-sm text-secondary">
                      Emoji
                      <input
                        type="text"
                        maxLength={2}
                        value={phase.emoji}
                        onChange={(event) => handlePhaseChange(index, "emoji", event.target.value)}
                        className="w-full rounded-3xl border border-theme bg-surface px-4 py-3 text-base text-primary focus:outline-none focus:border-pink-500"
                        placeholder="😀"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-secondary">
                      Name
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(event) => handlePhaseChange(index, "name", event.target.value)}
                        className="w-full rounded-3xl border border-theme bg-surface px-4 py-3 text-base text-primary focus:outline-none focus:border-pink-500"
                        placeholder="Phase name"
                        required
                      />
                    </label>

                    <label className="space-y-2 text-sm text-secondary lg:col-span-2">
                      Description
                      <textarea
                        value={phase.desc}
                        onChange={(event) => handlePhaseChange(index, "desc", event.target.value)}
                        rows={2}
                        className="w-full rounded-3xl border border-theme bg-surface px-4 py-3 text-base text-primary focus:outline-none focus:border-pink-500 resize-none"
                        placeholder="What does this phase feel like?"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
                      <label className="space-y-2 text-sm text-secondary">
                        Offset Start
                        <input
                          type="number"
                          value={phase.offsetStart}
                          onChange={(event) => handlePhaseChange(index, "offsetStart", event.target.value)}
                          disabled={phase.key === "period"}
                          className="w-full rounded-3xl border border-theme bg-surface px-4 py-3 text-base text-primary focus:outline-none focus:border-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="e.g. -1 or 1"
                        />
                        <p className="text-[11px] text-secondary/80">
                          Relative to period start. Use negative values for pre-period days.
                        </p>
                      </label>

                      <label className="space-y-2 text-sm text-secondary">
                        Offset End
                        <input
                          type="number"
                          value={phase.offsetEnd ?? ""}
                          onChange={(event) => handlePhaseChange(index, "offsetEnd", event.target.value)}
                          disabled={phase.key === "period"}
                          className="w-full rounded-3xl border border-theme bg-surface px-4 py-3 text-base text-primary focus:outline-none focus:border-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="e.g. -1 or 4"
                        />
                        <p className="text-[11px] text-secondary/80">
                          Relative end day of this phase from period start.
                        </p>
                      </label>
                    </div>

                    <div className="space-y-2 text-sm text-secondary">
                      <div className="flex items-center justify-between">
                        <span>Color</span>
                        <span className="text-xs text-secondary/80">Quick palette</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {colorSwatches.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handlePhaseChange(index, "color", color)}
                            className="h-11 w-full rounded-3xl border transition"
                            style={{
                              backgroundColor: color,
                              borderColor: phase.color === color ? "#ec4899" : "transparent",
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 rounded-3xl border border-theme bg-surface px-4 py-3">
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-secondary">
                          <span>Advanced</span>
                          <span className="text-[10px] text-secondary/70">Hue control</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={phase.hue ?? 0}
                          onChange={(event) => {
                            const hue = Number(event.target.value);
                            const hex = hslToHex(hue, 80, 70);
                            handlePhaseChange(index, "color", hex);
                            handlePhaseChange(index, "hue", hue);
                          }}
                          className="w-full accent-pink-500"
                        />
                        <div className="mt-4 flex items-center gap-3">
                          <input
                            type="text"
                            value={phase.color}
                            onChange={(event) => handlePhaseChange(index, "color", event.target.value)}
                            className="w-full rounded-3xl border border-theme bg-surface px-4 py-3 text-base text-primary focus:outline-none focus:border-pink-500"
                            placeholder="#A7F3D0 or rgb(...)"
                          />
                          <div
                            className="h-12 w-16 rounded-3xl border border-theme"
                            style={{ background: phase.color }}
                          />
                        </div>
                        <div
                          className="mt-3 h-12 rounded-3xl border border-theme"
                          style={{ background: gradientPreview(phase.color) }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-theme bg-surface-subtle p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-secondary">
              Your phase settings are saved in shared settings for both partners and apply immediately.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-3xl border border-theme bg-surface px-5 py-3 text-sm font-semibold text-secondary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || editedPhases.length === 0}
                className="rounded-3xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving�" : (
                  <span className="inline-flex items-center gap-2"><FaCheck /> Save Phase Studio</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
