import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AuthField from "../components/AuthField";
import PasswordField from "../components/PasswordField";
import useToast from "../../../hooks/useToast";
import { registerPartnerB } from "../services/authApi";
import { setPendingOtpEmail, buildVerifyOtpPath } from "../../../utils/otpFlow";

export default function JoinPage() {
  const { inviteCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { error } = useToast();

  const params = new URLSearchParams(location.search);
  const coupleId = params.get("coupleId");
  const token = params.get("inviteToken") || params.get("token") || inviteCode;

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
      error(err.response?.data?.message || "Join failed. Please try again.");
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
        background: "var(--light-bg-primary)"
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
