import React from "react";
import "./Timeline.css";

export default function TimelineFilters({
  typeFilter,
  setTypeFilter,
  yearFilter,
  setYearFilter,
  years = [],
  search,
  setSearch,
  reminderFilter,
  setReminderFilter,
}) {
  return (
    <div className="tl-card">
      <div className="tl-header">
        <span className="tl-badge">Filters</span>
        <p className="tl-subtitle">
          Find moments by type, year, search or reminder status.
        </p>
      </div>

      <div className="tl-filters">
        <div className="tl-field">
          <label>Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="first-talk">First talk</option>
            <option value="first-date">First date</option>
            <option value="anniversary">Anniversary</option>
            <option value="trip">Trip</option>
            <option value="fight-resolved">Fight resolved</option>
            <option value="random">Random cute moment</option>
          </select>
        </div>

        <div className="tl-field">
          <label>Year</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="tl-field">
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, description or tag…"
          />
        </div>

        <div className="tl-field">
          <label>Reminder</label>
          <select
            value={reminderFilter}
            onChange={(e) => setReminderFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="has">Has reminder</option>
            <option value="none">No reminder</option>
          </select>
        </div>
      </div>
    </div>
  );
}
