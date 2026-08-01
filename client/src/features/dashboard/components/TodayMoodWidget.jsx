import React from "react";
import "./TodayMoodWidget.css";
/**
 * Props example:
 * <TodayMoodWidget
 *   you={{
 *     name: "You",
 *     emoji: "😊",
 *     moodLabel: "Happy",
 *     note: "Excited for our weekend date 💗",
 *   }}
 *   partner={{
 *     name: "Partner",
 *     emoji: "😴",
 *     moodLabel: "Tired",
 *     note: "Had a long day at work",
 *   }}
 *   onUpdateClick={() => navigate("/mood")}
 * />
 */

export default function TodayMoodWidget({
  you,
  partner,
  onUpdateClick,
}) {
  const defaultYou = {
    name: "You",
    emoji: "🙂",
    moodLabel: "No mood set",
    note: "Tap update to set how you feel today.",
  };

  const defaultPartner = {
    name: "Partner",
    emoji: "🙂",
    moodLabel: "No mood set",
    note: "Waiting for them to share their mood.",
  };

  const youData = you || defaultYou;
  const partnerData = partner || defaultPartner;

  return (
    <div className="tmw-card">
      <div className="tmw-header">
        <span className="tmw-badge">Today’s Mood</span>
        <p className="tmw-subtitle">A tiny check-in for both of you 💞</p>
      </div>

      <div className="tmw-body">
        <MoodPill
          side="left"
          name={youData.name}
          emoji={youData.emoji}
          label={youData.moodLabel}
          note={youData.note}
        />
        <MoodPill
          side="right"
          name={partnerData.name}
          emoji={partnerData.emoji}
          label={partnerData.moodLabel}
          note={partnerData.note}
        />
      </div>

      <div className="tmw-footer">
        <button
          type="button"
          className="tmw-update-btn"
          onClick={onUpdateClick}
        >
          Update today’s mood
        </button>
      </div>
    </div>
  );
}

function MoodPill({ side, name, emoji, label, note }) {
  return (
    <div className={`tmw-pill tmw-pill-${side}`}>
      <div className="tmw-pill-top">
        <div className="tmw-emoji-bubble">
          <span className="tmw-emoji">{emoji}</span>
        </div>
        <div className="tmw-pill-text">
          <p className="tmw-name">{name}</p>
          <p className="tmw-label">{label}</p>
        </div>
      </div>
      <p className="tmw-note">{note}</p>
    </div>
  );
}
