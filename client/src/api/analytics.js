import api from "./axios";

export const getDashboardStats = async () => {
  const { data } = await api.get("/analytics/dashboard");
  return data.dashboard;
};

export const getReports = async (params) => {
  const { data } = await api.get("/analytics/reports", { params });
  return data.reports;
};
