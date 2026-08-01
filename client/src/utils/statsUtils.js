/* ---------------------- Percentage helpers ---------------------- */
export const percentage = (value, total) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

/* ---------------------- Progress decimal (0–1) ------------------ */
export const progress = (value, total) =>
  total > 0 ? value / total : 0;

/* ---------------------- Trend comparison ------------------------ */
export const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};
// returns +%, -%, or 0

/* ---------------------- Distributions (Pie) --------------------- */
export const createDistribution = (items, key) => {
  const counts = {};
  items.forEach((i) => {
    const v = i[key];
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
};

/* ---------------------- Leaderboard ----------------------------- */
export const rankByCount = (items, key) =>
  [...items]
    .sort((a, b) => b[key] - a[key])
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

/* ---------------------- Total helper ----------------------------- */
export const total = (items, key) =>
  items.reduce((sum, item) => sum + (item[key] || 0), 0);

/* ---------------------- Average helper --------------------------- */
export const average = (items, key) => {
  if (!items.length) return 0;
  return total(items, key) / items.length;
};

/* ---------------------- Chart data helpers ----------------------- */
export const toLineChart = (records, labelKey, valueKey) =>
  records.map((r) => ({
    label: r[labelKey],
    value: r[valueKey],
  }));

export const toBarChart = (records, labelKey, valueKey) =>
  records.map((r) => ({
    label: r[labelKey],
    value: r[valueKey],
  }));

export const toPieChart = (records, labelKey, valueKey) =>
  records.map((r) => ({
    label: r[labelKey],
    value: r[valueKey],
  }));

/* ---------------------- Top N helper ----------------------------- */
export const topN = (items, N, key) =>
  [...items]
    .sort((a, b) => b[key] - a[key])
    .slice(0, N);
