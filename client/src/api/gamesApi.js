import axiosClient from "./axiosClient";

const gamesApi = {
  /* ---------------------------- TRUTH OR DARE ---------------------------- */

  // Get random truth or dare cards
  getTruthOrDare: (params = {}) =>
    axiosClient.get("/games/truth-or-dare", { params }),
  /*
    params examples:
    { type: "truth" } or { type: "dare" }
    { level: "romantic" | "funny" | "spicy" }
  */

  // Add custom truth/dare prompts
  addTruthOrDare: (payload) =>
    axiosClient.post("/games/truth-or-dare", payload),
  /*
    payload example:
    { type: "truth", text: "What do you love most about me?", level: "romantic" }
  */


  /* ------------------------------- LOVE BINGO ------------------------------- */

  // Get generated bingo board (10–25 items)
  getBingoBoard: () =>
    axiosClient.get("/games/bingo"),

  // Save completed bingo result/progress
  saveBingoProgress: (payload) =>
    axiosClient.post("/games/bingo/progress", payload),
  /*
    payload example:
    {
      completedItems: ["Cuddle", "Movie Night", "Kiss"],
      score: 7,
      date: "2025-12-09"
    }
  */

  // Get bingo history
  getBingoHistory: () =>
    axiosClient.get("/games/bingo/history"),


  /* --------------------------------- DICE GAME -------------------------------- */

  // Generate random dice outcome for love tasks
  rollDice: () =>
    axiosClient.get("/games/dice"),

  // Save dice result
  saveDiceResult: (payload) =>
    axiosClient.post("/games/dice", payload),
  /*
    payload example:
    {
      numberRolled: 4,
      task: "4 hugs",
      date: "2025-12-09"
    }
  */

  // Get dice history
  getDiceHistory: () =>
    axiosClient.get("/games/dice/history"),


  /* ------------------------------- SPIN CHALLENGES ------------------------------- */

  // Get list of challenges for spin wheel
  getSpinChallenges: () =>
    axiosClient.get("/games/spin"),

  // Save or update challenge list (custom)
  saveSpinChallenges: (payload) =>
    axiosClient.post("/games/spin", payload),
  /*
    payload example:
    {
      challenges: ["Kiss", "Hug", "Pick any movie", "Back massage"]
    }
  */


  /* -------------------------------- GAME STATS -------------------------------- */

  getStats: () =>
    axiosClient.get("/games/stats"),
  /*
    Suggested backend response:
    {
      totalTruthOrDarePlayed: 22,
      mostChosenLevel: "romantic",
      totalBingoCompleted: 3,
      diceTasksCompleted: 17,
      spinChallengesCompleted: 9,
    }
  */
};

export default gamesApi;
