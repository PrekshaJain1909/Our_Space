import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AuthField from "../components/AuthField";
import PasswordField from "../components/PasswordField";
import useToast from "../../../hooks/useToast";
import { registerPartnerB } from "../services/authApi";
import { setPendingOtpEmail, buildVerifyOtpPath } from "../../../utils/otpFlow";

function getSwalThemeOptions() {
  const styles = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.classList.contains("dark");
  return {
    confirmButtonColor: styles.getPropertyValue("--accent-primary").trim() || "#ff5da2",
    background: isDark
      ? styles.getPropertyValue("--dark-surface").trim() || "#1c0050"
      : "#ffffff",
    color: isDark
      ? styles.getPropertyValue("--dark-text-primary").trim() || "#ffeefc"
      : styles.getPropertyValue("--light-text-primary").trim() || "#2a1a3a",
  };
}

export default function JoinPage() {
  const { inviteCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { error } = useToast();

  const params = new URLSearchParams(location.search);
  const coupleId = params.get("coupleId");
  const token = params.get("inviteToken") || params.get("token") || inviteCode;

  const inviteQuery = new URLSearchParams();
  if (token) inviteQuery.set("inviteToken", token);
  if (coupleId) inviteQuery.set("coupleId", coupleId);
  const inviteQuerySuffix = inviteQuery.toString() ? `?${inviteQuery.toString()}` : "";

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!name || !email || !password) {
      error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await registerPartnerB({
        name,
        email,
        password,
        token: token || undefined,
        coupleId: coupleId || undefined,
      });

      setPendingOtpEmail(email);
      navigate(buildVerifyOtpPath({ email }), { state: { email } });
    } catch (err) {
      // axiosClient interceptor spreads response.data onto the error, so
      // the message lives at err.message, not err.response?.data?.message
      const errMsg = err.message || err.response?.data?.message || "Join failed. Please try again.";
      if (errMsg.toLowerCase().includes("already exist") || errMsg.toLowerCase().includes("user already exist")) {
        Swal.fire({
          icon: "warning",
          title: "User already exists",
          text: "An account with this email is already registered. Please sign in instead.",
          confirmButtonText: "Go to Login",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          ...getSwalThemeOptions(),
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/login${inviteQuerySuffix}`);
          }
        });
      } else {
        error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        padding: "2rem 1rem",
        background: "var(--bg-primary)"
      }}
      className="auth-page"
    >
      <div
        className="auth-page__panel"
        style={{
          maxWidth: "450px",
          width: "100%",
          margin: "0 auto",
          boxShadow: "0 12px 40px rgba(255, 93, 162, 0.15)",
          border: "1px solid rgba(255, 93, 162, 0.2)",
          borderRadius: "24px",
          padding: "3rem 2.5rem",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <header className="auth-page__panel-head" style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h2 className="auth-page__panel-title" style={{ fontSize: "1.75rem", fontWeight: "800" }}>Join a Space</h2>
          <p className="auth-page__panel-subtitle" style={{ fontSize: "1rem", color: "var(--auth-text-muted)" }}>
            Create your account to continue
          </p>
        </header>

        <form className="auth-page__form" onSubmit={handleJoin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AuthField
            id="name"
            name="name"
            label="Full Name"
            placeholder="Your name"
            autoComplete="name"
            disabled={loading}
          />

          <AuthField
            id="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />

          <PasswordField
            id="password"
            label="Password"
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={loading}
            showPassword={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />

          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={loading}
            style={{ marginTop: '0.75rem', padding: '1rem', fontSize: '1.1rem' }}
          >
            {loading ? (
              <>
                <span className="auth-btn__spinner" aria-hidden="true" />
                Joining...
              </>
            ) : (
              "Join Now"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
