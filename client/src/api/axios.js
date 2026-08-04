import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED" ? "Request timed out. Please try again." : "Something went wrong. Please try again.");
    error.userMessage = message;

    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent("app:forbidden"));
    }

    return Promise.reject(error);
  }
);

export default api;
