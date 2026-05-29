import React, { useState } from "react";
import "../components/Mood.css";

import MoodTodayForm from "../components/MoodTodayForm";
import MoodCalendar from "../components/MoodCalendar";
import POVSelector from "../components/POVSelector";
import UpsetForm from "../components/UpsetForm";
import MoodAnalytics from "../components/MoodAnalytics";

export default function MoodPage() {
  // moodsByDate: { "YYYY-MM-DD": { mood, emoji, note } }
  const [moodsByDate, setMoodsByDate] = useState({});
  const [selectedPov, setSelectedPov] = useState("female"); // "male" | "female"
  const [upsetLogs, setUpsetLogs] = useState([]);

  const handleSaveMood = (date, moodEntry) => {
    setMoodsByDate((prev) => ({
      ...prev,
      [date]: moodEntry,
    }));
  };

  const handleSubmitUpset = (entry) => {
    setUpsetLogs((prev) => [entry, ...prev]);
  };

  return (
    <div className="mood-wrapper">
      <div className="mood-overlay" />

      <div className="mood-inner">
        {/* Header */}
         <p className="mood-badge">Mood & Upset Space</p>
         <br/>
        <header className="mood-header floating-note">
         
          <h1 className="mood-title">How Are We Really Doing?</h1>
          <p className="mood-subtitle">
            Two moods, two perspectives, one journey of understanding ✨
          </p>
        </header>

        <section className="mood-column">
          {/* Today mood form */}
          <div className="mood-block">
            <MoodTodayForm onSaveMood={handleSaveMood} />
          </div>

          {/* POV selector + upset form */}
          <div className="mood-block">
            <div className="md-card">
              <div className="md-header">
                <span className="md-badge">Why Am I Upset?</span>
                <p className="md-subtitle">
                  Switch between male & female POVs — the tone and prompts adjust
                  automatically.
                </p>
              </div>

              <POVSelector pov={selectedPov} onChange={setSelectedPov} />

              <UpsetForm pov={selectedPov} onSubmitUpset={handleSubmitUpset} />
            </div>
          </div>

          {/* Mood calendar */}
          <div className="mood-block">
            <MoodCalendar moodsByDate={moodsByDate} />
          </div>

          {/* Mood analytics */}
          <div className="mood-block">
            <MoodAnalytics moodsByDate={moodsByDate} upsetLogs={upsetLogs} />
          </div>
        </section>
      </div>
    </div>
  );
}
