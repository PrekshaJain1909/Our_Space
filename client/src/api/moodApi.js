import axiosClient from "./axiosClient";

const moodApi = {
  /* ----------------------------- MOOD LOGS ----------------------------- */

  // Add today's mood (or custom date)
  addMood: (payload) =>
    axiosClient.post("/mood", payload),
  /*
    payload example:
    {
      mood: "happy" | "sad" | "angry" | "neutral" | "romantic" | ...
      note?: "Short description"
      emoji?: "😊"
      date?: "2025-12-09"   // optional, otherwise backend uses today
    }
  */

  // Get mood logs (calendar or list)
  getMoods: (params = {}) =>
    axiosClient.get("/mood", { params }),
  /*
    params example:
    { month: "2025-12" } or { from: "2025-01-01", to: "2025-01-31" }
  */

  // Get single mood record
  getMoodById: (id) =>
    axiosClient.get(`/mood/${id}`),

  // Update a mood record
  updateMood: (id, payload) =>
    axiosClient.put(`/mood/${id}`, payload),

  // Delete mood record
  deleteMood: (id) =>
    axiosClient.delete(`/mood/${id}`),


  /* -------------------- “WHY AM I UPSET?” LOGS (MALE/FEMALE POV) -------------------- */

  // Add upset reason
  addUpset: (payload) =>
    axiosClient.post("/mood/upset", payload),
  /*
    payload example:
    {
      pov: "male" | "female",
      reason,
      note?,          // personal thoughts
      date?: "2025-12-09"
    }
  */

  // Get upset logs
  getUpset: (params = {}) =>
    axiosClient.get("/mood/upset", { params }),

  // Delete upset log
  deleteUpset: (id) =>
    axiosClient.delete(`/mood/upset/${id}`),


  /* ----------------------------- MOOD ANALYTICS ----------------------------- */

  getMoodStats: (params = {}) =>
    axiosClient.get("/mood/stats", { params }),
  /*
    Suggested backend response:
    {
      totalLogs: 45,
      moodFrequency: [
        { mood: "happy", count: 20 },
        { mood: "sad", count: 8 },
        { mood: "angry", count: 5 },
        ...
      ],
      recentTrend: [
        { label: "Mon", score: 4 },
        { label: "Tue", score: 3 },
        ...
      ],
      calendarHeatmap: [
        { date: "2025-12-01", score: 5 },
        ...
      ],
      mostCommonUpsetReasonsMale: [
        { reason, count },
      ],
      mostCommonUpsetReasonsFemale: [
        { reason, count },
      ]
    }
  */
};

export default moodApi;
