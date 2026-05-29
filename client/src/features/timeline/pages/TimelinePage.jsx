import React, { useMemo, useState } from "react";
import "../components/Timeline.css";

import TimelineFilters from "../components/TimelineFilters";
import TimelineEvents from "../components/TimelineEvents";
import TimelineReminder from "../components/TimelineReminder";
import AnniversaryCountdown from "../components/AnniversaryCountdown";

export default function TimelinePage() {
  const [events, setEvents] = useState([
    // optional starter example
    // {
    //   id: 1,
    //   title: "First time we talked",
    //   date: "2024-02-14",
    //   type: "first-talk",
    //   description: "Random chat that never stopped.",
    //   tags: ["first", "online"],
    //   reminderDate: null,
    //   reminderChannels: [],
    // },
  ]);

  const [anniversaryDate, setAnniversaryDate] = useState(""); // YYYY-MM-DD

  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reminderFilter, setReminderFilter] = useState("all"); // all | has | none

  const handleAddEvent = (event) => {
    setEvents((prev) => [event, ...prev]);
  };

  // Controlled add-event form state (lifted so reminder settings live separately)
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newType, setNewType] = useState("random");
  const [newDescription, setNewDescription] = useState("");
  const [newTagsInput, setNewTagsInput] = useState("");

  // reminder settings (Section 3)
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderChannels, setNewReminderChannels] = useState({ whatsapp: false, sms: false, email: false });

  const handleAddEventFromForm = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const selectedChannels = Object.entries(newReminderChannels)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const newEvent = {
      id: Date.now(),
      title: newTitle.trim(),
      date: newDate,
      type: newType,
      description: newDescription.trim(),
      tags: newTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      reminderDate: newReminderDate || null,
      reminderChannels: selectedChannels,
      createdAt: new Date().toISOString(),
    };

    handleAddEvent(newEvent);

    setNewTitle("");
    setNewDate(new Date().toISOString().slice(0, 10));
    setNewType("random");
    setNewDescription("");
    setNewTagsInput("");
    setNewReminderDate("");
    setNewReminderChannels({ whatsapp: false, sms: false, email: false });
  };

  const years = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (e.date) set.add(e.date.slice(0, 4));
    });
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        const byType = typeFilter === "all" ? true : e.type === typeFilter;
        const byYear =
          yearFilter === "all" ? true : e.date?.slice(0, 4) === yearFilter;

        const s = search.trim().toLowerCase();
        const bySearch = s
          ? e.title.toLowerCase().includes(s) ||
            (e.description || "").toLowerCase().includes(s) ||
            (e.tags || []).some((t) => t.toLowerCase().includes(s))
          : true;

        const hasReminder = !!e.reminderDate && e.reminderChannels?.length > 0;
        const byReminder =
          reminderFilter === "all"
            ? true
            : reminderFilter === "has"
            ? hasReminder
            : !hasReminder;

        return byType && byYear && bySearch && byReminder;
      })
      .sort((a, b) => (a.date < b.date ? -1 : 1)); // oldest → newest timeline
  }, [events, typeFilter, yearFilter, search, reminderFilter]);

  return (
    <div className="timeline-wrapper">
      <div className="timeline-overlay" />

      <div className="timeline-inner">
        {/* Header */}
         <p className="timeline-badge">Timelines</p>
         <br/>
        <header className="timeline-header floating-note">
         
          <h1 className="timeline-title">Your Love Story Timeline</h1>
          <p className="timeline-subtitle">
            Track milestones, set reminders, and count down together 📅✨
          </p>
        </header>

        <div className="timeline-grid">
          <section className="timeline-card filters-card">
            <TimelineFilters
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              yearFilter={yearFilter}
              setYearFilter={setYearFilter}
              years={years}
              search={search}
              setSearch={setSearch}
              reminderFilter={reminderFilter}
              setReminderFilter={setReminderFilter}
            />

            <div style={{ marginTop: 12 }}>
              <AnniversaryCountdown
                anniversaryDate={anniversaryDate}
                onChangeDate={setAnniversaryDate}
              />
            </div>
          </section>

          <section className="timeline-card event-card">
            <TimelineEvents
              events={filteredEvents}
              title={newTitle}
              setTitle={setNewTitle}
              date={newDate}
              setDate={setNewDate}
              type={newType}
              setType={setNewType}
              description={newDescription}
              setDescription={setNewDescription}
              tagsInput={newTagsInput}
              setTagsInput={setNewTagsInput}
              onAddEvent={handleAddEventFromForm}
            />
          </section>
        </div>

        <section className="timeline-card reminder-card" style={{ marginTop: 16 }}>
          <TimelineReminder
            reminderDate={newReminderDate}
            setReminderDate={setNewReminderDate}
            reminderChannels={newReminderChannels}
            setReminderChannels={setNewReminderChannels}
          />
        </section>
      </div>
    </div>
  );
}
