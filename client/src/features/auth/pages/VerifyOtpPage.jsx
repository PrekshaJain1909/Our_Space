import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import OTPInput from "../components/OTPInput";
import { verifyOtp, resendOtp } from "../services/authApi";
import { getPendingOtpEmail, clearPendingOtpContext, getPendingOtpSentAt } from "../../../utils/otpFlow";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = location.state?.email || getPendingOtpEmail();

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  // Countdown for OTP expiry (service uses 5 minutes)
  useEffect(() => {
    const sentAt = getPendingOtpSentAt();
    if (!sentAt) return setSecondsLeft(null);

    const EXPIRY_SEC = 5 * 60;
    const update = () => {
      const elapsed = Math.floor((Date.now() - sentAt) / 1000);
      const left = EXPIRY_SEC - elapsed;
      setSecondsLeft(left > 0 ? left : 0);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Resend cooldown tick
  useEffect(() => {
    if (!resendCooldown) return;
    const id = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp: otp.trim() });

      // Store both token keys + user so AuthContext hydrates immediately
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("auth_token", res.token);
      }
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      // Notify AuthContext to sync state from localStorage
      window.dispatchEvent(new Event("auth-token-updated"));

      success("Email verified successfully! 💕");
      clearPendingOtpContext();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const errMsg = err.message || err.response?.data?.message || "Invalid or expired OTP";
      error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Only allow resend when OTP expired or cooldown expired
    if (secondsLeft > 0) {
      error(`OTP not expired. Please wait ${secondsLeft} second${secondsLeft !== 1 ? "s" : ""}`);
      return;
    }

    setResendLoading(true);
    try {
      const res = await resendOtp({ email });
      success("New OTP sent! 💌 Check your email.");
      // start client-side cooldown (matches server RESEND_COOLDOWN_SEC, default 60)
      setResendCooldown(60);
      // reset sentAt for countdown
      try { sessionStorage.setItem('pending_otp_sent_at', String(Date.now())); } catch (e) {}
      setSecondsLeft(5 * 60);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP";
      error(msg);
      // if server tells us to wait, use waitSeconds
      const wait = err.response?.data?.waitSeconds;
      if (wait) setResendCooldown(wait);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        width: "100%",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="auth-page__panel"
        style={{
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
          boxShadow: "0 12px 40px rgba(255, 93, 162, 0.15)",
          border: "1px solid rgba(255, 93, 162, 0.2)",
          borderRadius: "24px",
          padding: "2.5rem 2rem",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <header className="auth-page__panel-head">
          <h2 className="auth-page__panel-title">Verify Email</h2>
          <p className="auth-page__panel-subtitle">
            Code sent to <strong style={{ color: "var(--accent-primary)" }}>{email}</strong>
          </p>
        </header>

        <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="auth-field__label" htmlFor="otp">Verification Code</label>
            <OTPInput length={6} onChange={(val) => setOtp(val)} disabled={loading} />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={loading || !otp.trim()}
          >
            {loading ? (
              <>
                <span className="auth-btn__spinner" aria-hidden="true" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </form>

        <footer className="auth-footer">
          <p className="auth-footer__text">
            {secondsLeft > 0 ? (
              <>
                Code expires in <strong style={{ color: 'var(--accent-primary)' }}> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</strong>
              </>
            ) : (
              "Code expired"
            )}
          </p>
          <p className="auth-footer__text" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="auth-btn auth-btn--link"
              onClick={handleResend}
              disabled={resendLoading || loading || (secondsLeft > 0) || (resendCooldown > 0)}
            >
              {resendLoading ? "Sending..." : resendCooldown > 0 ? `Wait ${resendCooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              className="auth-btn auth-btn--ghost"
              onClick={() => {
                // allow quick logout/cleanup from verify page
                localStorage.removeItem('auth_token');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                clearPendingOtpContext();
                window.dispatchEvent(new Event('auth-token-updated'));
                navigate('/login', { replace: true });
              }}
              style={{ marginLeft: '1rem' }}
            >
              Logout
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}
