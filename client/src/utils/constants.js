/* ----------------------------- App Info ----------------------------- */
export const APP_NAME = "Couple Space";
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  THEME: "couple_theme",
  PUNISHMENTS: "punishments_neon_v1", // for spin wheel
};

/* ----------------------------- Mood Types ----------------------------- */
export const MOODS = [
  { key: "happy", label: "Happy", emoji: "😊" },
  { key: "romantic", label: "Romantic", emoji: "💗" },
  { key: "neutral", label: "Neutral", emoji: "😐" },
  { key: "sad", label: "Sad", emoji: "😢" },
  { key: "angry", label: "Angry", emoji: "😡" },
];

/* ----------------------------- Upset POV ----------------------------- */
export const POV = {
  MALE: "male",
  FEMALE: "female",
};

/* ----------------------------- Relationship Actions ----------------------------- */
export const RELATIONSHIP_ACTIONS = [
  { key: "hug", label: "Hug 🤗" },
  { key: "kiss", label: "Kiss 💋" },
  { key: "meetup", label: "Meetup 👫" },
];

/* ----------------------------- Timeline Event Types ----------------------------- */
export const TIMELINE_EVENT_TYPES = [
  "memory",
  "trip",
  "fight",
  "milestone",
  "celebration",
  "other",
];

/* ----------------------------- Reminder Channels ----------------------------- */
export const REMINDER_CHANNELS = ["email", "sms", "whatsapp"];

/* ----------------------------- Wedding Vision Types ----------------------------- */
export const VISION_TYPES = [
  "dress",
  "decor",
  "location",
  "menu",
  "playlist",
  "theme",
  "other",
];

/* ----------------------------- Games Levels ----------------------------- */
export const TRUTH_OR_DARE_LEVELS = [
  "romantic",
  "funny",
  "emotional",
  "spicy",
];

/* ----------------------------- Pagination Defaults ----------------------------- */
export const PAGE_SIZE = 12;

/* ----------------------------- UI Animation Durations ----------------------------- */
export const ANIM = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};
