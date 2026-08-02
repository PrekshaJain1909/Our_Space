import React, { useState } from "react";
import { FaHeart, FaGift, FaCheckCircle } from "react-icons/fa";
import { toLocalDate, toLocalDateString } from "../utils/dateUtils";

export default function TodayPeriodBanner({ settings, onConfirmPeriod, isFemale }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [notes, setNotes] = useState("");

  if (!settings?.lastPeriodStart) return null;

  const normalizeDate = (value) => toLocalDate(value);

  const addDays = (date, days) => {
    const result = toLocalDate(date);
    if (!result) return null;
    result.setDate(result.getDate() + Number(days));
    return result;
  };

  const lastStart = normalizeDate(settings.lastPeriodStart);
  const predictedNext = addDays(lastStart, Math.max(0, settings.cycleLength || 28));
  const today = normalizeDate(new Date());

  const diffTime = today.getTime() - predictedNext.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isStartingSoon = diffDays === -2;
  const isVisible = diffDays >= -2;

  if (!isVisible) return null;

  const handleConfirm = async () => {
    await onConfirmPeriod({ date: toLocalDateString(today), notes });
    setIsConfirming(false);
  };

  return (
    <div className="w-full bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-purple-500/15 border border-pink-500/30 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center text-xl shadow-inner">
            💖
          </div>
          <div>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
              Expected Period Window
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-600 font-semibold">
                {diffDays === 0
                  ? "Due Today"
                  : diffDays < 0
                  ? `Due in ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`
                  : `${diffDays} day${diffDays > 1 ? "s" : ""} past predicted`}
              </span>
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              {isStartingSoon
                ? "🩸 Your period may start soon."
                : "Confirm your period start date to update cycle predictions and unlock special partner surprises! 🎁"}
            </p>
          </div>
        </div>

        {isFemale ? (
          <button
            onClick={() => setIsConfirming(true)}
            className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <FaHeart className="text-white" /> Today is My Period
          </button>
        ) : (
          <div className="text-xs text-secondary bg-surface-subtle px-3 py-1.5 rounded-lg border border-theme">
            Waiting for partner confirmation 🌸
          </div>
        )}
      </div>

      {/* Confirmation Modal / Inline Form */}
      {isConfirming && (
        <div className="pt-3 border-t border-pink-500/20 space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-primary">
            Confirm period start for today ({today.toLocaleDateString()})?
          </p>
          <input
            type="text"
            placeholder="Optional daily note (e.g. Started in morning)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-theme bg-surface-subtle focus:outline-none focus:border-pink-500 text-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsConfirming(false)}
              className="px-3 py-1.5 rounded-lg text-xs border border-theme text-secondary hover:text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded-lg text-xs bg-pink-500 text-white font-bold hover:bg-pink-600 transition-all flex items-center gap-1.5"
            >
              <FaCheckCircle /> Confirm & Reveal Surprises
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
