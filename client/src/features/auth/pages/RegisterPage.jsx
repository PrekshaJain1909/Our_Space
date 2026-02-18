import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPartnerA } from "../services/authApi";
import Swal from "sweetalert2";
import "./LoginPage.css"; // reuse same styling for consistency

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const coupleName = e.target.coupleName.value.trim();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!coupleName || !name || !email || !password) {
      Swal.fire({
        icon: "warning",
        title: "All fields required 💌",
        confirmButtonColor: "#ff66c4",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await registerPartnerA({
        coupleName,
        name,
        email,
        password,
      });

      navigate("/verify-otp", { state: { email } });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#ff66c4",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">
        {/* Mobile/Small screen intro above form */}
        <div className="mobile-intro-title">
          <h1 className="intro-title">
            Begin your <span className="highlight">love story</span>,<br />together forever
          </h1>
        </div>

        {/* LEFT INTRO SECTION (hidden on small screens) */}
        <div className="login-intro">
          <div className="intro-content">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/")}
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

            <h1 className="intro-title">
              Begin your <span className="highlight">love story</span>,<br />together forever
            </h1>

            <p className="intro-description">
              Create your private couple space. Save memories, track milestones,
              and grow your journey beautifully.
            </p>
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="login-card-wrapper">
          <div className="login-card">
            <header className="card-header">
              <h2 className="card-title">Create Account 💖</h2>
              <p className="card-description">
                Start your shared journey today
              </p>
            </header>

            <form className="login-form" onSubmit={handleSubmit} noValidate>

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

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account ✨"}
              </button>
            </form>

            <footer className="card-footer">
              <p className="footer-text">
                Already have an account?{" "}
                <button
                  type="button"
                  className="footer-link"
                  onClick={() => navigate("/login")}
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
