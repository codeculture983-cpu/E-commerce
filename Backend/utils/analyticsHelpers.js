// backend/utils/analyticsHelpers.js

export const normalizeStatus = (status = "") => {
  const s = status.toLowerCase();

  if (s.includes("pending")) return "order_placed";
  if (s.includes("pack")) return "packing";
  if (s.includes("ship")) return "shipped";
  if (s.includes("out")) return "out_for_delivery";
  if (s.includes("deliver")) return "delivered";
  if (s.includes("cancel")) return "cancelled";

  return "order_placed";
};

export const getQuery = (range) => {
  if (range === "today") {
    return "days=1";
  }
  if (range === "yesterday") {
    return "days=2";
  }
  return `days=${range}`;
};

export const calcGrowth = (current, previous) => {
  if (!previous || previous === 0) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

export const smoothForecast = (arr = []) => {
  if (!arr.length) return [];

  return arr.map((v, i, a) => {
    const prev = a[i - 1] || v;
    const next = a[i + 1] || v;
    return Math.round((v + prev + next) / 3);
  });
};