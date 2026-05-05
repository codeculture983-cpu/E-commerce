import dayjs from "dayjs";

// ✅ build query (today / yesterday / days)
export const getQuery = (range) => {
  if (range === "today") {
    return `start=${dayjs().startOf("day").toISOString()}&end=${dayjs()
      .endOf("day")
      .toISOString()}`;
  }

  if (range === "yesterday") {
    return `start=${dayjs()
      .subtract(1, "day")
      .startOf("day")
      .toISOString()}&end=${dayjs()
      .subtract(1, "day")
      .endOf("day")
      .toISOString()}`;
  }

  return `days=${range}`;
};

// ✅ growth %
export const calcGrowth = (current, previous) => {
  if (!previous) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

// ✅ smooth forecast (remove spikes)
export const smoothForecast = (arr) => {
  return arr.map((v, i) => {
    const prev = arr[i - 1] ?? v;
    return Math.round((v + prev) / 2);
  });
};