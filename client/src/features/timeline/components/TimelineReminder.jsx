import React from "react";
import "./Timeline.css";

export default function TimelineReminder({ reminderDate, setReminderDate, reminderChannels, setReminderChannels }) {
  const handleChannelToggle = (channel) => {
    setReminderChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  return (
    <div>
      <div className="tl-header">
        <span className="tl-badge">Reminder Settings</span>
        <p className="tl-subtitle">Choose when and how you'd like to be reminded.</p>
      </div>

      <div className="tl-reminder-block" style={{ marginTop: 8 }}>
        <div className="tl-reminder-row">
          <div className="tl-field">
            <label>Reminder date (optional)</label>
            <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
          </div>

          <div className="tl-reminder-channels">
            <p className="tl-reminder-label">Reminder via (UI only)</p>
            <div className="tl-reminder-chip-row">
              <label className="tl-reminder-chip">
                <input type="checkbox" checked={reminderChannels.whatsapp} onChange={() => handleChannelToggle('whatsapp')} />
                <span>WhatsApp</span>
              </label>
              <label className="tl-reminder-chip">
                <input type="checkbox" checked={reminderChannels.sms} onChange={() => handleChannelToggle('sms')} />
                <span>SMS</span>
              </label>
              <label className="tl-reminder-chip">
                <input type="checkbox" checked={reminderChannels.email} onChange={() => handleChannelToggle('email')} />
                <span>Email</span>
              </label>
            </div>
            <p className="tl-reminder-note">This app only stores your preferences. Actual sending needs backend integration later.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
