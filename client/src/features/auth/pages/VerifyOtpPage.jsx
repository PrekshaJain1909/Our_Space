import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import OTPInput from "../components/OTPInput";
import { verifyOtp, resendOtp } from "../services/authApi";
import { getPendingOtpEmail, clearPendingOtpContext } from "../../../utils/otpFlow";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const email = location.state?.email || getPendingOtpEmail();

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

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
    setResendLoading(true);
    try {
      await resendOtp({ email });
      success("New OTP sent! 💌 Check your email.");
    } catch (err) {
      error(err.response?.data?.message || "Failed to resend OTP");
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
            Didn't receive the code?{" "}
            <button
              type="button"
              className="auth-btn auth-btn--link"
              onClick={handleResend}
              disabled={resendLoading || loading}
            >
              {resendLoading ? "Sending..." : "Resend code"}
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}
