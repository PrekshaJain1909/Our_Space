import axiosClient from "./axiosClient";

const loveNotesApi = {
  /* --------------------------- CREATE --------------------------- */

  create: (payload) =>
    axiosClient.post("/love-notes", payload),
  // payload: {
  //   title,
  //   note,
  //   tags?,                  // ["romantic", "apology", ...]
  //   date?,                  // optional custom date
  // }

  /* ---------------------------- READ ---------------------------- */

  getAll: (params = {}) =>
    axiosClient.get("/love-notes", { params }),
  // params example: { tag: "romantic" } | { sort: "latest" }

  getById: (id) =>
    axiosClient.get(`/love-notes/${id}`),

  /* --------------------------- UPDATE --------------------------- */

  update: (id, payload) =>
    axiosClient.put(`/love-notes/${id}`, payload),

  /* --------------------------- DELETE --------------------------- */

  delete: (id) =>
    axiosClient.delete(`/love-notes/${id}`),

  /* ---------------------------- SEARCH --------------------------- */

  search: (keyword) =>
    axiosClient.get(`/love-notes/search?q=${keyword}`),

  /* ----------------------------- STATS --------------------------- */

  getStats: () =>
    axiosClient.get("/love-notes/stats"),
  // expected backend response:
  // {
  //   total,
  //   longestNoteLength,
  //   romanticWordsCount,
  //   mostUsedWords: [{ word, count }],
  //   latestDate
  // }
};

export default loveNotesApi;
