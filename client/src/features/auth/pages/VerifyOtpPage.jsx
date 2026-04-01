import React, { useState, useEffect, useCallback } from "react";
import { verifyOtp, resendOtp } from "../services/authApi";
import OTPInput from "../components/OTPInput";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import "./RegisterPage.css";

const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [locked, setLocked] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = location.state?.email || searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Session Expired 💌",
        text: "Please login or register again.",
        confirmButtonColor: "#ff66c4",
      }).then(() => {
        navigate(`/login${location.search || ""}`, { replace: true });
      });
    }
  }, [email, navigate, location.search]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

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

      if (res?.token) {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("token", res.token);
        window.dispatchEvent(new Event("auth-token-updated"));
      }

      if (res?.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
        window.dispatchEvent(new CustomEvent("user-data-updated"));
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
      const data = err.response?.data || {};
      const isLocked = data.locked || err.response?.status === 423;

      if (isLocked) {
        setLocked(true);
        setOtp("");

        Swal.fire({
          icon: "error",
          title: "Account Locked 🔒",
          text: "Too many failed attempts. Please request a new OTP.",
          confirmButtonColor: "#ff66c4",
          background: "#1c003a",
          color: "#fff",
        });

        return;
      }

      if (data.attemptsLeft !== undefined) {
        setAttemptsLeft(data.attemptsLeft);
      }

      Swal.fire({
        icon: "error",
        title: "Invalid OTP 💔",
        text: data.message || "Please try again.",
        confirmButtonColor: "#ff66c4",
        background: "#1c003a",
        color: "#fff",
      });
    }
  };

  const handleResend = useCallback(async () => {
    if (!email) return;

    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);

    try {
      await resendOtp(email);

      setLocked(false);
      setAttemptsLeft(null);
      setOtp("");
      setResendCooldown(RESEND_COOLDOWN);

      Swal.fire({
        icon: "success",
        title: "OTP Resent 💌",
        text: "A new OTP has been sent to your email.",
        confirmButtonColor: "#ff66c4",
        background: "#1c003a",
        color: "#fff",
        timer: 2500,
        showConfirmButton: false,
      });

    } catch (err) {
      const data = err.response?.data || {};

      if (data.waitSeconds) {
        setResendCooldown(data.waitSeconds);
      }

      Swal.fire({
        icon: "error",
        title: "Could not resend OTP",
        text: data.message || "Please try again later.",
        confirmButtonColor: "#ff66c4",
        background: "#1c003a",
        color: "#fff",
      });

    } finally {
      setResendLoading(false);
    }
  }, [email, resendCooldown, resendLoading]);

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
          <OTPInput
            length={6}
            onChange={setOtp}
            value={otp}
            disabled={locked}
          />
        </div>

        {attemptsLeft !== null && !locked && (
          <p style={{ color: "#ff5c6c", fontSize: 13, textAlign: "center", marginTop: 8 }}>
            {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before OTP is invalidated.
          </p>
        )}

        {locked && (
          <p style={{ color: "#ff5c6c", fontSize: 13, textAlign: "center", marginTop: 8 }}>
            OTP locked due to too many attempts. Request a new one below.
          </p>
        )}

        <button
          onClick={handleVerify}
          className="primary-btn"
          disabled={locked}
        >
          Verify & Continue 💖
        </button>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
            style={{
              background: "none",
              border: "none",
              color: resendCooldown > 0 ? "#888" : "#ff66c4",
              cursor: resendCooldown > 0 ? "default" : "pointer",
              fontSize: 14,
              textDecoration: resendCooldown > 0 ? "none" : "underline",
            }}
          >
            {resendLoading
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend OTP in ${resendCooldown}s`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}