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

// ✅ Login (by couple name + either partner's password)
export const login = async (data) => {
  const response = await API.post("/auth/login", data);
  return response;
};

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

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

// ✅ Resend OTP (called from verify page)
export const resendOtp = async (email) => {
  const response = await API.post("/otp/resend", { email });
  return response.data;
};

export const getCoupleStatus = async (coupleId) => {
  const response = await API.get(`/invite/couple-status/${coupleId}`);
  return response.data;
};

export default {
  login,
  registerPartnerA,
  registerPartnerB,
  verifyOtp,
  resendOtp,
  getCoupleStatus,
};
