import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

/* ---------------------- Format date (UI friendly) ---------------------- */
export const formatDate = (date, format = "DD MMM YYYY") =>
  dayjs(date).format(format);

/* -------------------------- Human readable time ------------------------ */
export const timeAgo = (date) => dayjs(date).fromNow(); // "3 hours ago", "2 weeks ago"

/* -------------------------- Today / Yesterday label -------------------- */
export const dayLabel = (date) => {
  if (dayjs(date).isToday()) return "Today";
  if (dayjs(date).isYesterday()) return "Yesterday";
  return formatDate(date, "DD MMM");
};

/* -------------------------- Countdown (future date) --------------------- */
export const daysUntil = (futureDate) => {
  const today = dayjs();
  const target = dayjs(futureDate);
  return target.diff(today, "day");
};

/* -------------------------- Convert string to ISO ----------------------- */
export const toISO = (date) => dayjs(date).toISOString();

/* -------------------------- Sort array by date key ---------------------- */
export const sortByDateDesc = (items, key = "date") =>
  [...items].sort((a, b) => dayjs(b[key]).diff(dayjs(a[key])));

export const sortByDateAsc = (items, key = "date") =>
  [...items].sort((a, b) => dayjs(a[key]).diff(dayjs(b[key])));

/* -------------------------- Mood heatmap weight (1–5) ------------------- */
export const getMoodScore = (mood) => {
  const scores = {
    happy: 5,
    romantic: 4,
    neutral: 3,
    sad: 2,
    angry: 1,
  };
  return scores[mood] || 3;
};

/* -------------------------- Date Range Helpers -------------------------- */
export const startOfMonth = (date) => dayjs(date).startOf("month").format("YYYY-MM-DD");
export const endOfMonth = (date) => dayjs(date).endOf("month").format("YYYY-MM-DD");

export const startOfWeek = () => dayjs().startOf("week").format("YYYY-MM-DD");
export const endOfWeek = () => dayjs().endOf("week").format("YYYY-MM-DD");

/* -------------------------- Age of relationship ------------------------- */
export const relationshipAge = (startDate) => {
  const d = dayjs.duration(dayjs().diff(startDate));
  return {
    years: d.years(),
    months: d.months(),
    days: d.days(),
  };
};
