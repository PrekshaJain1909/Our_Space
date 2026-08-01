import axiosClient from "./axiosClient";

export const getPeriodSettings = async () => {
  const response = await axiosClient.get("/period/settings");
  return response.data;
};

export const savePeriodSettings = async (data) => {
  const response = await axiosClient.post("/period/settings", data);
  return response.data;
};

export const getPeriodCalendar = async (year, month) => {
  const response = await axiosClient.get(`/period/calendar?year=${year}&month=${month}`);
  return response.data;
};

export const confirmTodayPeriod = async (data) => {
  const response = await axiosClient.post("/period/confirm", data);
  return response.data;
};

export const savePeriodDailyLog = async (data) => {
  const response = await axiosClient.post("/period/log", data);
  return response.data;
};

export const getPeriodSurprises = async () => {
  const response = await axiosClient.get("/period/surprises");
  return response.data;
};

export const createPeriodSurprise = async (data) => {
  const response = await axiosClient.post("/period/surprises", data);
  return response.data;
};

export const deletePeriodSurprise = async (id) => {
  const response = await axiosClient.delete(`/period/surprises/${id}`);
  return response.data;
};

export const getPeriodStats = async () => {
  const response = await axiosClient.get("/period/stats");
  return response.data;
};
