import axiosClient from "./axiosClient";

// All auth-related API calls
const authApi = {
  // Register new couple user
  register: (payload) =>
    axiosClient.post("/auth/register", payload),
  // payload example:
  // { name, email, password, confirmPassword, coupleCode? }

  // Login existing user
  login: (payload) =>
    axiosClient.post("/auth/login", payload),
  // payload example:
  // { email, password }

  // Get current logged-in user profile
  getMe: () => axiosClient.get("/auth/me"),

  // Logout user (server-side cleanup if implemented)
  logout: () => axiosClient.post("/auth/logout"),

  // Optional: refresh token manually (if you want to trigger it yourself)
  refreshToken: () => axiosClient.post("/auth/refresh"),

  // Optional: forgot/reset password flows if your backend supports them
  forgotPassword: (payload) =>
    axiosClient.post("/auth/forgot-password", payload),
  // { email }

  resetPassword: (token, payload) =>
    axiosClient.post(`/auth/reset-password/${token}`, payload),
  // { password, confirmPassword }
};

export default authApi;
