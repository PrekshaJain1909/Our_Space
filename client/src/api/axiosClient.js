import axios from "axios";

// Detect production environment and set correct API URL
const getBaseURL = () => {
  // Check if environment variable is set (Vercel dashboard config)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Use localhost only for local development
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }

  // Default production API endpoint when env var is not provided
  return "https://our-love-space.onrender.com/api";
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false, // allow cookies if backend uses them
  headers: {
    "Content-Type": "application/json",
  },
});

const isPublicRoute = (url) => {
  const path = (url || "").toString().trim();

  return (
    path.startsWith("/auth") ||
    path.startsWith("auth") ||
    path === "/otp/verify" ||
    path === "otp/verify" ||
    path === "/otp/resend" ||
    path === "otp/resend" ||
    path === "/invite/register-partnerB" ||
    path === "invite/register-partnerB"
  );
};

// Attach auth token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");

    // 🔍 DEBUG LOG (IMPORTANT)
    console.log(
      "[axiosClient] Request:",
      config.method?.toUpperCase(),
      config.url,
      "token:",
      token ? "FOUND" : "NOT FOUND"
    );

    // Allow public onboarding/auth routes without token
    const url = (config.url || "").toString();
    if (!token && isPublicRoute(url)) {
      return config;
    }

    // If token exists, attach it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // 🔍 CONFIRM HEADER ATTACHMENT
      console.log("[axiosClient] Authorization header set:", config.headers.Authorization);
      console.log(
        "[axiosClient] Attaching Authorization header:",
        config.headers.Authorization
      );
    } else {
      // Block write operations if not logged in
      const method = (config.method || "get").toLowerCase();
      if (method !== "get" && method !== "head") {
        window.dispatchEvent(
          new CustomEvent("readonly-attempt", {
            detail: {
              method: method.toUpperCase(),
              url: config.url,
            },
          })
        );

        return Promise.reject({
          message: "Read-only mode: login required",
          status: 403,
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


const clearAuthAndRedirect = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-token-updated"));
  window.dispatchEvent(new Event("user-data-updated"));
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// Handle responses and errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasSessionToken =
      !!localStorage.getItem("auth_token") || !!localStorage.getItem("token");

    // Guard: avoid retrying the refresh endpoint itself
    const isRefreshEndpoint = (originalRequest?.url || "").toString().includes(
      "/auth/refresh"
    );

    // Prevent concurrent refresh attempts
    if (typeof axiosClient.isRefreshing === "undefined") {
      axiosClient.isRefreshing = false;
    }

    // If token expired — optional refresh flow
    if (
      hasSessionToken &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // If the failed request was the refresh endpoint, stop and redirect
      if (isRefreshEndpoint) {
        clearAuthAndRedirect();
        return Promise.reject({
          message: "Refresh failed. Please log in again.",
          status: 401,
        });
      }

      // If another refresh is already in progress, do not start another
      if (axiosClient.isRefreshing) {
        clearAuthAndRedirect();
        return Promise.reject({
          message: "Session invalid. Please log in again.",
          status: 401,
        });
      }

      originalRequest._retry = true;
      axiosClient.isRefreshing = true;

      try {
        const res = await axiosClient.post("/auth/refresh");
        const newToken = res.data?.token;

        if (newToken) {
          localStorage.setItem("auth_token", newToken);
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session expired — please log in again");
        clearAuthAndRedirect();
        return Promise.reject({
          message: "Session invalid. Please log in again.",
          status: 401,
        });
      } finally {
        axiosClient.isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      clearAuthAndRedirect();
      return Promise.reject({
        message:
          error.response.data?.message ||
          "Unauthorized. Please log in again.",
        status: 401,
      });
    }

    if (error.response?.status === 403) {
      if (typeof window !== "undefined" && window?.dispatchEvent) {
        const detail = {
          status: 403,
          message: error.response?.data?.message || "Forbidden",
          url: originalRequest?.url,
          method: (originalRequest?.method || "").toUpperCase(),
        };
        window.dispatchEvent(new CustomEvent("readonly-attempt", { detail }));
      }
    }

    if (error.response) {
      return Promise.reject({
        ...error.response.data,
        status: error.response.status,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
