import axiosClient from "./axiosClient";

const analyticsApi = {
  /* --------------------------- HABIT LOGS --------------------------- */
  // Alcohol log
  addAlcoholLog: (payload) =>
    axiosClient.post("/analytics/habits/alcohol", payload),
  /*
    payload example:
    {
      amount: 2,         // number of pegs/drinks
      unit: "pegs",      // optional, "pegs" | "ml" etc.
      note?: "Weekend party",
      date?: "2025-12-09" // optional, backend defaults to now
    }
  */

  getAlcoholLogs: (params = {}) =>
    axiosClient.get("/analytics/habits/alcohol", { params }),
  /*
    params example:
    { range: "week" } or { from: "2025-12-01", to: "2025-12-31" }
  */


  // Cigarette log
  addCigaretteLog: (payload) =>
    axiosClient.post("/analytics/habits/cigarette", payload),
  /*
    payload example:
    {
      amount: 5,          // sticks
      unit: "sticks",
      note?: "Stress day",
      date?: "2025-12-09"
    }
  */

  getCigaretteLogs: (params = {}) =>
    axiosClient.get("/analytics/habits/cigarette", { params }),


  /* ---------------------- RELATIONSHIP LOGS ------------------------ */

  addRelationshipLog: (payload) =>
    axiosClient.post("/analytics/relationship", payload),
  /*
    payload example:
    {
      type: "hug" | "kiss" | "meetup",
      count: 3,
      location?: "Cafe",
      date?: "2025-12-09"
    }
  */

  getRelationshipLogs: (params = {}) =>
    axiosClient.get("/analytics/relationship", { params }),


  /* ---------------------------- STATS ------------------------------ */

  // Alcohol stats: totals + trends
  getAlcoholStats: (params = {}) =>
    axiosClient.get("/analytics/stats/alcohol", { params }),
  /*
    Suggested backend response:
    {
      totalAmount: 10,
      unit: "pegs",
      weeklyTrend: [ { label: "Week 1", amount: 3 }, ... ],
      monthlyTrend: [ ... ],
      lastEntryDate: "2025-12-08"
    }
  */

  // Cigarette stats
  getCigaretteStats: (params = {}) =>
    axiosClient.get("/analytics/stats/cigarette", { params }),
  /*
    Suggested backend response:
    {
      totalSticks: 25,
      weeklyTrend: [...],
      reductionPercent: 18
    }
  */

  // Relationship stats (hugs / kisses / meetups)
  getRelationshipStats: (params = {}) =>
    axiosClient.get("/analytics/stats/relationship", { params }),
  /*
    Suggested backend response:
    {
      totalHugs: 23,
      totalKisses: 18,
      totalMeetups: 7,
      affectionTrend: [
        { label: "Week 1", hugs: 3, kisses: 2, meetups: 1 },
        ...
      ],
      distribution: [
        { type: "Hugs", value: 23 },
        { type: "Kisses", value: 18 },
        { type: "Meetups", value: 7 }
      ]
    }
  */

  // Combined overview (for dashboard)
  getOverview: (params = {}) =>
    axiosClient.get("/analytics/overview", { params }),
  /*
    Suggested backend response:
    {
      alcohol: { totalAmount, unit, last7Days: [...] },
      cigarette: { totalSticks, last7Days: [...] },
      relationship: { totalHugs, totalKisses, totalMeetups },
    }
  */
};

export default analyticsApi;
