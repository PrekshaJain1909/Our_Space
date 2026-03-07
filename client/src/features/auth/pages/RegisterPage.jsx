import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { registerPartnerA, registerPartnerB } from "../services/authApi";
import Swal from "sweetalert2";
import "./LoginPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(location.search);
  const inviteToken = params.get("inviteToken") || params.get("token") || "";
  const coupleId = params.get("coupleId") || "";
  const fromAuth = params.get("fromAuth") === "1";
  const isInviteFlow = Boolean(inviteToken || coupleId);

  const inviteQuery = new URLSearchParams();
  if (inviteToken) inviteQuery.set("inviteToken", inviteToken);
  if (coupleId) inviteQuery.set("coupleId", coupleId);
  const inviteQuerySuffix = inviteQuery.toString() ? `?${inviteQuery.toString()}` : "";

  useEffect(() => {
    if (isInviteFlow && !fromAuth) {
      navigate(`/join${inviteQuerySuffix}`, { replace: true });
    }
  }, [fromAuth, isInviteFlow, inviteQuerySuffix, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const coupleName = e.target.coupleName?.value?.trim() || "";
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    // Clear any existing tokens to prevent OTP bypass
    if (isInviteFlow) {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }

    const missingRequired = isInviteFlow
      ? !name || !email || !password
      : !coupleName || !name || !email || !password;

    if (missingRequired) {
      Swal.fire({
        icon: "warning",
        title: "All fields required 💌",
        confirmButtonColor: "#ff66c4",
      });
      return;
    }

    try {
      setLoading(true);

      if (isInviteFlow) {
        await registerPartnerB({
          name,
          email,
          password,
          token: inviteToken || undefined,
          coupleId: coupleId || undefined,
        });
      } else {
        await registerPartnerA({
          coupleName,
          name,
          email,
          password,
        });
      }

      navigate(`/verify-otp${inviteQuerySuffix}`, { state: { email } });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isInviteFlow ? "Join Failed" : "Registration Failed",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#ff66c4",
      });
    } finally {
      setLoading(false);
    }
  };

  const heroTitle = isInviteFlow ? (
    <>
      Join your <span className="highlight">shared space</span>,
      <br />
      start making memories
    </>
  ) : (
    <>
      Begin your <span className="highlight">love story</span>,
      <br />
      together forever
    </>
  );

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="mobile-intro-title">
          <h1 className="intro-title">{heroTitle}</h1>
        </div>

        <div className="login-intro">
          <div className="intro-content">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(`/login${inviteQuerySuffix}`)}
              aria-label="Go back"
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

            <h1 className="intro-title">{heroTitle}</h1>

            <p className="intro-description">
              {isInviteFlow
                ? "Complete signup to join your partner in one shared love space."
                : "Create your private couple space. Save memories, track milestones, and grow your journey beautifully."}
            </p>
          </div>
        </div>

        <div className="login-card-wrapper">
          <div className="login-card">
            <header className="card-header">
              <h2 className="card-title">
                {isInviteFlow ? "Join Your Partner 💖" : "Create Account 💖"}
              </h2>
              <p className="card-description">
                {isInviteFlow
                  ? "Continue to verify and activate your invite"
                  : "Start your shared journey today"}
              </p>
            </header>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {!isInviteFlow && (
                <div className="form-group">
                  <label className="form-label">Couple Name</label>
                  <input
                    type="text"
                    name="coupleName"
                    className="form-input"
                    placeholder="Moon & Stars"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Your name"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="Create a password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Submitting..." : isInviteFlow ? "Join Now ✨" : "Create Account ✨"}
              </button>
            </form>

            <footer className="card-footer">
              <p className="footer-text">
                Already have an account?{" "}
                <button
                  type="button"
                  className="footer-link"
                  onClick={() => navigate(`/login${inviteQuerySuffix}`)}
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            </footer>
          </div>
        </div>
      </div>

      <div className="decorative-blur decorative-blur-1"></div>
      <div className="decorative-blur decorative-blur-2"></div>
    </div>
  );
}
