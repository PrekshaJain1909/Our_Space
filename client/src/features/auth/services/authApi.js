import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

// 🔐 Automatically attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ✅ Register Partner A
export const registerPartnerA = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

// ✅ Register Partner B
export const registerPartnerB = async (data) => {
  const response = await API.post("/invite/register-partnerB", data);
  return response.data;
};

// ✅ Verify OTP
export const verifyOtp = async (data) => {
  const response = await API.post("/otp/verify", data);

  // Save token automatically after verification
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};
