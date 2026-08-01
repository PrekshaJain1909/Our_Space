import React, { useState, useEffect } from "react";
import { FaSmile, FaNotesMedical, FaSave, FaCheck } from "react-icons/fa";

const MOOD_OPTIONS = [
  { id: "Happy", label: "Happy", emoji: "😊" },
  { id: "Calm", label: "Calm", emoji: "😌" },
  { id: "Tired", label: "Tired", emoji: "😴" },
  { id: "Emotional", label: "Emotional", emoji: "🥺" },
  { id: "Anxious", label: "Anxious", emoji: "😰" },
  { id: "Irritable", label: "Irritable", emoji: "😤" },
  { id: "Cozy", label: "Cozy", emoji: "🥰" },
  { id: "Energetic", label: "Energetic", emoji: "⚡" },
];

const SYMPTOM_OPTIONS = [
  { id: "Cramps", label: "Cramps", emoji: "⚡" },
  { id: "Headache", label: "Headache", emoji: "🤕" },
  { id: "Bloating", label: "Bloating", emoji: "🎈" },
  { id: "Fatigue", label: "Fatigue", emoji: "🥱" },
  { id: "Acne", label: "Acne", emoji: "✨" },
  { id: "Backache", label: "Backache", emoji: "🪵" },
  { id: "Cravings", label: "Cravings", emoji: "🍫" },
  { id: "Mood Swings", label: "Mood Swings", emoji: "🎭" },
];

export default function MoodSymptomTracker({ selectedDate, existingLog, onSaveLog }) {
  const [moods, setMoods] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setMoods(existingLog.moods || []);
      setSymptoms(existingLog.symptoms || []);
      setNotes(existingLog.notes || "");
    } else {
      setMoods([]);
      setSymptoms([]);
      setNotes("");
    }
  }, [existingLog, selectedDate]);

  const toggleMood = (id) => {
    setMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleSymptom = (id) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveLog({
      date: selectedDate,
      moods,
      symptoms,
      notes,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-surface border border-theme rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-theme pb-4">
        <div>
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <FaSmile className="text-pink-500" /> Daily Mood & Symptoms
          </h3>
          <p className="text-xs text-secondary">
            Log feelings and physical symptoms for {selectedDate || "selected date"}.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <FaCheck /> Saved!
            </>
          ) : (
            <>
              <FaSave /> {isSaving ? "Saving..." : "Save Daily Log"}
            </>
          )}
        </button>
      </div>

      {/* Mood Picker */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
          Select Moods
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MOOD_OPTIONS.map((item) => {
            const isSelected = moods.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleMood(item.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? "border-pink-500 bg-pink-500/10 text-pink-600 shadow-sm"
                    : "border-theme bg-surface-subtle text-secondary hover:text-primary"
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Symptoms Picker */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
          Select Physical Symptoms
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SYMPTOM_OPTIONS.map((item) => {
            const isSelected = symptoms.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSymptom(item.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? "border-rose-500 bg-rose-500/10 text-rose-600 shadow-sm"
                    : "border-theme bg-surface-subtle text-secondary hover:text-primary"
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Notes */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <FaNotesMedical className="text-pink-500" /> Daily Notes
        </label>
        <textarea
          rows="3"
          placeholder="How are you feeling today? Any specific notes or food cravings?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-theme bg-surface-subtle focus:outline-none focus:border-pink-500 text-primary"
        />
      </div>
    </div>
  );
}
