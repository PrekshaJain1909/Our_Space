import React, { useState, useEffect, useCallback } from "react";
import { verifyOtp, resendOtp } from "../services/authApi";
import OTPInput from "../components/OTPInput";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import {
  clearPendingOtpContext,
  getPendingOtpEmail,
  getPendingOtpUserId,
  setPendingOtpEmail,
  setPendingOtpUserId,
} from "../../../utils/otpFlow";
import "./RegisterPage.css";

const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [locked, setLocked] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const persistedEmail = getPendingOtpEmail();
  const persistedUserId = getPendingOtpUserId();
  const routeEmail = location.state?.email || searchParams.get("email") || "";
  const routeUserId = (location.state?.userId || "").toString().trim();
  const email = (emailInput || routeEmail || persistedEmail).trim();
  const userId = (routeUserId || persistedUserId).trim();

  useEffect(() => {
    if (routeEmail) {
      setPendingOtpEmail(routeEmail);
    }
  }, [routeEmail]);

  useEffect(() => {
    if (routeUserId) {
      setPendingOtpUserId(routeUserId);
    }
  }, [routeUserId]);

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailInput(value);
    if (value.trim()) {
      validateEmail(value);
    } else {
      setEmailError("");
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    // Validate email if it's required
    if (!email && !userId) {
      if (!validateEmail(emailInput)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Email",
          text: emailError || "Please enter a valid email address.",
          confirmButtonColor: "#ff66c4",
          background: "#1c003a",
          color: "#fff",
        });
        return;
      }
    }

    if (!email && !userId) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Enter your registered email to verify OTP.",
        confirmButtonColor: "#ff66c4",
      });
      return;
    }

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
      const res = await verifyOtp({
        otp,
        ...(email ? { email } : {}),
        ...(userId ? { userId } : {}),
      });

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

      clearPendingOtpContext();

      navigate("/dashboard", { replace: true });

    } catch (err) {
      const data = err?.response?.data || err || {};
      const status = err?.response?.status || err?.status;
      const isLocked = data.locked || status === 423;

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
    if (!email && !userId) return;

    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);

    try {
      await resendOtp({
        ...(email ? { email } : {}),
        ...(userId ? { userId } : {}),
      });

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
      const data = err?.response?.data || err || {};

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
  }, [email, userId, resendCooldown, resendLoading]);

  return (
    <div className="romantic-page">
      <div className="romantic-hero">
        <h1 className="hero-title">
          Almost there... <br />
          <span>Verify your love ✨</span>
        </h1>

        <p className="hero-subtitle">
          {email
            ? <>
                Enter the 6-digit code sent to <strong>{email}</strong>
              </>
            : userId
            ? "Enter the 6-digit OTP sent to your registered email"
            : "Enter your registered email and OTP to continue"}
        </p>
      </div>

      <div className="glass-card otp-card">
        <h2 className="card-title">Verify OTP</h2>

        {!email && !userId && (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email-input"
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "#fff",
              }}
            >
              Email Address <span style={{ color: "#ff66c4" }}>*</span>
            </label>
            <input
              id="email-input"
              ref={(el) => el?.focus()}
              type="email"
              value={emailInput}
              onChange={handleEmailChange}
              placeholder="Enter your registered email"
              className="form-input"
              aria-label="Email address"
              aria-required="true"
              aria-describedby={emailError ? "email-error" : undefined}
              style={{
                borderColor: emailError ? "#ff5c6c" : undefined,
                borderWidth: emailError ? "2px" : "1px",
              }}
            />
            {emailError && (
              <p
                id="email-error"
                style={{
                  color: "#ff5c6c",
                  fontSize: 12,
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {emailError}
              </p>
            )}
          </div>
        )}

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