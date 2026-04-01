import axios from "axios";

// Detect production environment and set correct API URL
const getBaseURL = () => {
  // Check if environment variable is set (Vercel dashboard config)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Auto-detect Vercel production deployment
  if (window.location.hostname === "our-space-pi.vercel.app") {
    return "https://our-love-space.onrender.com/api";
  }
  
  // Default to localhost for development
  return "http://localhost:5000/api";
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false, // allow cookies if backend uses them
  headers: {
    "Content-Type": "application/json",
  },
});

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

    // Allow auth routes without token
    const url = (config.url || "").toString();
    if (!token && (url.startsWith("/auth") || url.startsWith("auth"))) {
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


// Handle responses and errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired — optional refresh flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // call refresh-token API (if backend supports it)
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
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
        // Prevent infinite reload loop
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    // If server responds with 403, dispatch readonly event so UI can show banner
    try {
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
    } catch (e) {
      // ignore
    }

    // Other errors: keep status + payload so callers can branch on auth states.
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
