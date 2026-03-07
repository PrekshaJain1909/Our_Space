import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import useToast from "../../../hooks/useToast";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { success, error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(location.search);
  const inviteToken = params.get("inviteToken") || params.get("token") || "";
  const coupleId = params.get("coupleId") || "";

  const inviteQuery = new URLSearchParams();
  if (inviteToken) inviteQuery.set("inviteToken", inviteToken);
  if (coupleId) inviteQuery.set("coupleId", coupleId);
  const inviteQuerySuffix = inviteQuery.toString() ? `?${inviteQuery.toString()}` : "";
  const inviteRegisterQuery = new URLSearchParams(inviteQuery);
  inviteRegisterQuery.set("fromAuth", "1");
  const inviteRegisterQuerySuffix = inviteRegisterQuery.toString()
    ? `?${inviteRegisterQuery.toString()}`
    : "";
  const backTarget = inviteQuerySuffix ? `/join${inviteQuerySuffix}` : "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.coupleName.value.trim();
    const password = e.target.password.value.trim();

    if (!name || !password) {
      toastError("Please fill in all fields");
      return;
    }

    const payload = { name, password };

    if (inviteToken) payload.inviteToken = inviteToken;
    if (coupleId) payload.coupleId = coupleId;

    const res = await login(payload);
    if (res?.success) {
      success("Welcome back 💕");
      navigate("/dashboard");
    } else {
      if (res?.status === 403) {
        toastError(res?.message || "Please verify OTP before logging in.");
        return;
      }

      toastError(res?.message || "Login failed — check credentials or try again later.");
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page or show modal
    console.log("Forgot password clicked");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-intro">
          <div className="intro-content">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(backTarget)}
              aria-label="Back to dashboard"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="intro-title">
              Your <span className="highlight">shared moments</span>,
              <br />
              beautifully preserved
            </h1>
            <p className="intro-description">
              Track your journey together, celebrate milestones, and build
              memories that last a lifetime. Your love story deserves a space as
              unique as you are.
            </p>
          </div>
        </div>

        <div className="login-card-wrapper">
          <div className="login-card">
            <header className="card-header">
              <h2 className="card-title">Welcome back</h2>
              <p className="card-description">
                Sign in to continue your journey
              </p>
            </header>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="coupleName" className="form-label">
                  Couple name
                </label>
                <input
                  type="text"
                  id="coupleName"
                  name="coupleName"
                  className="form-input"
                  placeholder="Moon & Stars"
                  autoComplete="username"
                  required
                  aria-required="true"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    aria-required="true"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    disabled={loading}
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <button
                  type="button"
                  className="link-button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <footer className="card-footer">
              <p className="footer-text">
                New here?{" "}
                <button
                  type="button"
                  className="footer-link"
                  onClick={() => navigate(`/register${inviteRegisterQuerySuffix}`)}
                  disabled={loading}
                >
                  Create an account
                </button>
              </p>
            </footer>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div
        className="decorative-blur decorative-blur-1"
        aria-hidden="true"
      ></div>
      <div
        className="decorative-blur decorative-blur-2"
        aria-hidden="true"
      ></div>
    </div>
  );
}
