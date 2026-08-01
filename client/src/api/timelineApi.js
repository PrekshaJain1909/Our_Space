import axiosClient from "./axiosClient";

const timelineApi = {
  /* --------------------------- TIMELINE EVENTS --------------------------- */

  // Add a new timeline event
  addEvent: (payload) =>
    axiosClient.post("/timeline", payload),
  /*
    payload example:
    {
      title,
      description?,
      date,             // "2025-12-09"
      type?: "memory" | "trip" | "fight" | "milestone" | "other",
      relatedIds?: {
        loveNoteId?: string,
        memoryId?: string,
        promiseId?: string
      }
    }
  */

  // Get all timeline events (optionally filtered)
  getEvents: (params = {}) =>
    axiosClient.get("/timeline", { params }),
  /*
    params example:
    { from: "2025-01-01", to: "2025-12-31" }
    { type: "milestone" }
  */

  // Get single event
  getEventById: (id) =>
    axiosClient.get(`/timeline/${id}`),

  // Update event
  updateEvent: (id, payload) =>
    axiosClient.put(`/timeline/${id}`, payload),

  // Delete event
  deleteEvent: (id) =>
    axiosClient.delete(`/timeline/${id}`),


  /* -------------------------- SPECIAL DATES / REMINDERS -------------------------- */

  // Add a special date reminder (anniversary, birthday, first meet, etc.)
  addReminder: (payload) =>
    axiosClient.post("/timeline/reminders", payload),
  /*
    payload example:
    {
      label: "Anniversary",
      date: "2025-11-12",
      channels?: ["email", "sms", "whatsapp"], // optional
      type?: "anniversary" | "birthday" | "custom",
      notes?: "Plan something cute",
    }
  */

  // Get all reminders
  getReminders: (params = {}) =>
    axiosClient.get("/timeline/reminders", { params }),
  /*
    params example:
    { upcoming: true }
  */

  // Delete a reminder
  deleteReminder: (id) =>
    axiosClient.delete(`/timeline/reminders/${id}`),

  // Optional: update reminder (e.g., channels/date)
  updateReminder: (id, payload) =>
    axiosClient.put(`/timeline/reminders/${id}`, payload),


  /* ----------------------------- TIMELINE STATS / SUMMARY ----------------------------- */

  // Stats for timeline (for fun + analytics)
  getStats: (params = {}) =>
    axiosClient.get("/timeline/stats", { params }),
  /*
    Suggested backend response:
    {
      totalEvents: 25,
      eventsByType: [
        { type: "milestone", count: 5 },
        { type: "trip", count: 7 },
        { type: "fight", count: 3 },
        { type: "memory", count: 10 },
      ],
      firstEventDate: "2023-02-14",
      latestEventDate: "2025-12-01",
      upcomingSpecialDates: [
        {
          label: "Anniversary",
          date: "2025-11-12",
          daysLeft: 15
        },
        {
          label: "Her Birthday",
          date: "2025-12-20",
          daysLeft: 53
        }
      ]
    }
  */

  // Optional: countdown for a specific special date
  getCountdown: (params = {}) =>
    axiosClient.get("/timeline/countdown", { params }),
  /*
    params example:
    { type: "anniversary" }
    or { date: "2025-11-12" }

    Suggested backend response:
    { label: "Anniversary", date: "2025-11-12", daysLeft: 15 }
  */
};

export default timelineApi;
