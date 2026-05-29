import React from "react";
import "./Timeline.css";

export default function TimelineEvents({
  events = [],
  onAddEvent,
  title,
  setTitle,
  date,
  setDate,
  type,
  setType,
  description,
  setDescription,
  tagsInput,
  setTagsInput,
}) {

  return (
    <div className="tl-card tl-events-card">
      {/* Form */}
      <div className="tl-header">
        <span className="tl-badge">Add Timeline Event</span>
        <p className="tl-subtitle">
          Add anniversaries, meetups, trips or any tiny memory you care about. 🌟
        </p>
      </div>

      <form className="tl-form" onSubmit={onAddEvent}>
        <div className="tl-row">
          <div className="tl-field">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First date, first trip, big fight resolved…"
              required
            />
          </div>

          <div className="tl-field">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="tl-row">
          <div className="tl-field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="first-talk">First talk</option>
              <option value="first-date">First date</option>
              <option value="anniversary">Anniversary</option>
              <option value="trip">Trip</option>
              <option value="fight-resolved">Fight resolved</option>
              <option value="random">Random cute moment</option>
            </select>
          </div>

          <div className="tl-field">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. delhi, coffee, rain"
            />
          </div>
        </div>

        <div className="tl-field">
          <label>Description (optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write what happened and how it felt…"
          />
        </div>
        {/* Reminder moved to separate card (TimelineReminder) */}

        <button type="submit" className="tl-primary-btn">
          Add event
        </button>
      </form>

      {/* Timeline list */}
      <div className="tl-timeline-list">
        {events.length === 0 ? (
          <p className="tl-empty">
            No events yet. Start by adding your first memory together ✨
          </p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="tl-event-row">
              <div className="tl-event-date">
                <p className="tl-event-day">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    day: "2-digit",
                  })}
                </p>
                <p className="tl-event-month">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    month: "short",
                  })}
                </p>
                <p className="tl-event-year">
                  {new Date(event.date).getFullYear()}
                </p>
              </div>

              <div className="tl-event-main">
                <div className="tl-event-title-row">
                  <h3 className="tl-event-title">{event.title}</h3>
                  <span className={`tl-chip tl-chip-type-${event.type}`}>
                    {event.type.replace("-", " ")}
                  </span>
                </div>

                {event.description && (
                  <p className="tl-event-desc">{event.description}</p>
                )}

                {event.tags?.length > 0 && (
                  <p className="tl-event-tags">
                    {event.tags.map((t, i) => (
                      <span key={i} className="tl-tag-pill">
                        #{t}
                      </span>
                    ))}
                  </p>
                )}

                {event.reminderDate && event.reminderChannels?.length > 0 && (
                  <p className="tl-event-reminder">
                    Reminder on{" "}
                    <strong>
                      {new Date(event.reminderDate).toLocaleDateString()}
                    </strong>{" "}
                    via{" "}
                    <strong>
                      {event.reminderChannels.join(", ").toUpperCase()}
                    </strong>
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
