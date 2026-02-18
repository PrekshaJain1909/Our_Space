import React, { useState, useEffect } from "react";
import { verifyOtp } from "../services/authApi";
import OTPInput from "../components/OTPInput";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import "./RegisterPage.css";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If already logged in → go to dashboard
    if (token) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // If no email (page refresh case)
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Session Expired 💌",
        text: "Please register again.",
        confirmButtonColor: "#ff66c4",
      }).then(() => {
        navigate("/register", { replace: true });
      });
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Oops 💌",
        text: "Please enter a 6-digit OTP",
        confirmButtonColor: "#ff66c4",
        background: "#1c003a",
        color: "#fff",
      });
      return;
    }

    try {
      const res = await verifyOtp({ email, otp });

      // Save login data
      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      if (res?.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      await Swal.fire({
        icon: "success",
        title: "Verified Successfully 💖",
        text: "Welcome to your dashboard!",
        confirmButtonColor: "#ff66c4",
        background: "#1c003a",
        color: "#fff",
      });

      navigate("/dashboard", { replace: true });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Invalid or Expired OTP 💔",
        text: err.response?.data?.message || "Please try again.",
        confirmButtonColor: "#ff66c4",
        background: "#1c003a",
        color: "#fff",
      });
    }
  };

  return (
    <div className="romantic-page">
      <div className="romantic-hero">
        <h1 className="hero-title">
          Almost there... <br />
          <span>Verify your love ✨</span>
        </h1>

        <p className="hero-subtitle">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
      </div>

      <div className="glass-card otp-card">
        <h2 className="card-title">Verify OTP</h2>

        <div className="otp-wrapper">
          <OTPInput length={6} onChange={setOtp} />
        </div>

        <button onClick={handleVerify} className="primary-btn">
          Verify & Continue 💖
        </button>
      </div>
    </div>
  );
}
