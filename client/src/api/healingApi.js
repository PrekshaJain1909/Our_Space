import axiosClient from "./axiosClient";

const healingApi = {
  /* -------------------- MISTAKE + PUNISHMENT ENTRIES -------------------- */

  // Add new healing entry (mistake -> punishment)
  addEntry: async (payload) => {
    console.log("[healingApi] addEntry request", payload);
    try {
      const res = await axiosClient.post("/healing/entries", payload);
      console.log("[healingApi] addEntry response", res?.data);
      return res;
    } catch (err) {
      console.error("[healingApi] addEntry error", err);
      throw err;
    }
  },
  /*
    payload example:
    {
      apologizer,      // who made mistake
      forgiver,        // who got hurt
      reason,
      punishment,      // punishment text
      description?,
      date?,           // optional custom date
      completed?: false
    }
  */

  // Get all entries
  getEntries: () =>
    axiosClient.get("/healing/entries"),

  // Mark punishment complete
  completeEntry: (id) =>
    axiosClient.patch(`/healing/entries/${id}/complete`),

  // Edit an entry (title/message)
  updateEntry: (id, payload) =>
    axiosClient.put(`/healing/${id}`, payload),

  // Delete entry
  deleteEntry: (id) =>
    axiosClient.delete(`/healing/${id}`),


  /* ------------------------------ PROMISES ------------------------------ */

  // Request a new promise (partner must accept)
  requestPromise: (payload) =>
    axiosClient.post("/healing/promises/request", payload),
  /*
    payload example:
    {
      title,
      promiseText,
      description?,
      category?,
      dueDate?
    }
  */

  // Get all promises
  getPromises: () =>
    axiosClient.get("/healing/promises"),

  // Accept a promise request
  acceptPromise: (id) =>
    axiosClient.patch(`/healing/promises/${id}/accept`),

  // Decline a promise request
  declinePromise: (id) =>
    axiosClient.patch(`/healing/promises/${id}/decline`),

  // Fulfill a promise
  fulfillPromise: (id) =>
    axiosClient.patch(`/healing/promises/${id}/fulfill`),

  // Break an active promise
  breakPromise: (id) =>
    axiosClient.patch(`/healing/promises/${id}/break`),

  // Request a break request for a promise
  requestBreakPromise: (id, reason) =>
    axiosClient.patch(`/healing/promises/${id}/request-break`, { reason }),

  // Creator agrees to break request
  agreeBreakPromise: (id) =>
    axiosClient.patch(`/healing/promises/${id}/agree-break`),

  // Creator rejects break request
  disagreeBreakPromise: (id) =>
    axiosClient.patch(`/healing/promises/${id}/disagree-break`),

  // Delete a promise
  deletePromise: (id) =>
    axiosClient.delete(`/healing/promises/${id}`),


  /* --------------------------- FORGIVENESS ------------------------------ */

  // Add forgiveness form entry
  addForgiveness: (payload) =>
    axiosClient.post("/healing/forgiveness", payload),
  /* payload:
     {
       forgiver,
       forgiven,
       reason,
       note?
     }
  */

  // Get all forgiveness records
  getForgiveness: () =>
    axiosClient.get("/healing/forgiveness"),


  /* -------------------------------- STATS -------------------------------- */

  // Full stats for Healing Page
  getStats: () =>
    axiosClient.get("/healing/stats"),
  /*
    Suggested backend response:
    {
      totalEntries,
      completedPunishments,
      pendingPunishments,
      totalPromises,
      fulfilledPromises,
      forgivenessCount,
      leaderboard: {
         himMistakes,
         herMistakes,
         himForgiveness,
         herForgiveness,
      }
    }
  */
};

export default healingApi;
