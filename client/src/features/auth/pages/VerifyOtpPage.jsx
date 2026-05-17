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

function getSwalThemeOptions() {
  const styles = getComputedStyle(document.documentElement);
  return {
    confirmButtonColor: styles.getPropertyValue("--accent-primary").trim() || "#ff66c4",
    background: styles.getPropertyValue("--surface").trim() || "#1c003a",
    color: styles.getPropertyValue("--text-primary").trim() || "#fff",
  };
}

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
          ...getSwalThemeOptions(),
        });
        return;
      }
    }

    if (!email && !userId) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Enter your registered email to verify OTP.",
        ...getSwalThemeOptions(),
      });
      return;
    }

    if (otp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Oops 💌",
        text: "Please enter a 6-digit OTP",
        ...getSwalThemeOptions(),
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
        ...getSwalThemeOptions(),
      });

      clearPendingOtpContext();

      navigate("/dashboard", { replace: true });

    } catch (err) {
      const data = err?.response?.data || err || {};
      const status = err?.response?.status || err?.status;
      const isLocked = data.locked || status === 423;

      if (status === 403 && /read-only mode|login required/i.test(data.message || "")) {
        Swal.fire({
          icon: "error",
          title: "Session required",
          text: "Please log in again and request a fresh OTP.",
          ...getSwalThemeOptions(),
        });
        return;
      }

      if (isLocked) {
        setLocked(true);
        setOtp("");

        Swal.fire({
          icon: "error",
          title: "Account Locked 🔒",
          text: "Too many failed attempts. Please request a new OTP.",
          ...getSwalThemeOptions(),
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
        ...getSwalThemeOptions(),
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
        ...getSwalThemeOptions(),
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
        ...getSwalThemeOptions(),
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
          <div className="verify-email-block">
            <label
              htmlFor="email-input"
              className="verify-email-label"
            >
              Email Address <span className="verify-required">*</span>
            </label>
            <input
              id="email-input"
              ref={(el) => el?.focus()}
              type="email"
              value={emailInput}
              onChange={handleEmailChange}
              placeholder="Enter your registered email"
              className={["form-input", emailError ? "form-input-error" : ""].join(" ")}
              aria-label="Email address"
              aria-required="true"
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && (
              <p id="email-error" className="verify-error-text">
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
          <p className="verify-warning-text">
            {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before OTP is invalidated.
          </p>
        )}

        {locked && (
          <p className="verify-warning-text">
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

        <div className="verify-resend-wrap">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
            className={[
              "verify-resend-btn",
              resendCooldown > 0 ? "verify-resend-btn-disabled" : "",
            ].join(" ")}
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