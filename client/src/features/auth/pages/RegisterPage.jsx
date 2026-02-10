import React, { useState } from "react";
import "./RegisterPage.css";
import useToast from "../../../hooks/useToast";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [femalePreview, setFemalePreview] = useState(null);
  const [malePreview, setMalePreview] = useState(null);
  const [formData, setFormData] = useState({
    femaleName: "",
    maleName: "",
    coupleName: "",
    password: "",
  });
  
  const { register, loading, loadUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toastError("Please upload a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastError("Image size should be less than 5MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { femaleName, maleName, coupleName, password } = formData;

    // Validation
    if (!femaleName.trim() || !maleName.trim() || !coupleName.trim() || !password.trim()) {
      toastError("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toastError("Password must be at least 6 characters long");
      return;
    }

    // Build payload compatible with the auth/register endpoint
    const payload = {
      name: coupleName.trim() || `${femaleName.trim()} & ${maleName.trim()}`,
      password: password.trim(),
      // Keep additional metadata for possible later use
      femaleName: femaleName.trim(),
      maleName: maleName.trim(),
    };

    try {
      const res = await register(payload);
      
      if (res?.success && res.data) {
        // Simulate login: save token and user, trigger auth context update
        const { token, user } = res.data;
        
        if (token && user) {
          localStorage.setItem("auth_token", token);
          
          if (typeof window !== "undefined" && window.dispatchEvent) {
            window.dispatchEvent(new Event("auth-token-updated"));
          }
          
          await loadUser();
          success("Account created! Welcome to your dashboard 💖");
          navigate("/dashboard");
        } else {
          toastError("Registration succeeded but login failed. Please try logging in.");
          navigate("/login");
        }
      } else {
        toastError(res?.message || "Registration failed — try again later.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toastError("An unexpected error occurred. Please try again.");
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
      e.preventDefault();
    }
  };

  return (
    <div className="romantic-login-wrapper">
      <div className="romantic-overlay" aria-hidden="true" />

      <div className="romantic-content stacked-register">
        {/* Hero section */}
        <header className="romantic-intro intro-centered">
          <h1 className="romantic-title">
            Start your <br />
            <span>shared love story.</span>
          </h1>
          <p className="romantic-tagline">
            A beautiful space to cherish your memories, dreams, and promises together
          </p>
        </header>

        {/* Registration form */}
        <main>
          <form
            className="romantic-card big-register-card"
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            noValidate
          >
            <h2 className="card-title">Create couple account 💖</h2>
            <p className="card-subtitle">
              We'll keep your memories and promises safe under this moon.
            </p>

            {/* Names row (responsive grid) */}
            <div className="field-row">
              <div className="field">
                <label htmlFor="femaleName">Female name *</label>
                <input
                  type="text"
                  id="femaleName"
                  name="femaleName"
                  placeholder="Her name"
                  value={formData.femaleName}
                  onChange={handleInputChange}
                  required
                  autoComplete="given-name"
                  aria-required="true"
                />
              </div>

              <div className="field">
                <label htmlFor="maleName">Male name *</label>
                <input
                  type="text"
                  id="maleName"
                  name="maleName"
                  placeholder="His name"
                  value={formData.maleName}
                  onChange={handleInputChange}
                  required
                  autoComplete="given-name"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="coupleName">Couple name *</label>
              <input
                type="text"
                id="coupleName"
                name="coupleName"
                placeholder="e.g. Moon & Stars, Soulmates..."
                value={formData.coupleName}
                onChange={handleInputChange}
                required
                autoComplete="nickname"
                aria-required="true"
              />
            </div>

            {/* Avatar upload section */}
            <div className="avatar-row">
              <div className="avatar-block">
                <div className="avatar-circle" aria-label="Female partner photo preview">
                  {femalePreview ? (
                    <img src={femalePreview} alt="Her preview" />
                  ) : (
                    <span className="avatar-emoji" role="img" aria-label="Female emoji">
                      💁‍♀️
                    </span>
                  )}
                </div>
                <p className="avatar-name-label">Her photo</p>
                <label className="avatar-upload" htmlFor="femaleAvatar">
                  {femalePreview ? "Change" : "Upload"}
                  <input
                    type="file"
                    id="femaleAvatar"
                    name="femaleAvatar"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={(e) => handleImageChange(e, setFemalePreview)}
                    aria-label="Upload female partner photo"
                  />
                </label>
              </div>

              <div className="avatar-block">
                <div className="avatar-circle" aria-label="Male partner photo preview">
                  {malePreview ? (
                    <img src={malePreview} alt="His preview" />
                  ) : (
                    <span className="avatar-emoji" role="img" aria-label="Male emoji">
                      🧑‍💼
                    </span>
                  )}
                </div>
                <p className="avatar-name-label">His photo</p>
                <label className="avatar-upload" htmlFor="maleAvatar">
                  {malePreview ? "Change" : "Upload"}
                  <input
                    type="file"
                    id="maleAvatar"
                    name="maleAvatar"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={(e) => handleImageChange(e, setMalePreview)}
                    aria-label="Upload male partner photo"
                  />
                </label>
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Choose a secure password (min. 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
                minLength={6}
                aria-required="true"
                aria-describedby="password-hint"
              />
            </div>

            <button
              className="primary-btn"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Creating your account..." : "Create Account ✨"}
            </button>

            <footer className="card-footer">
              Already have an account?{" "}
              <span
                className="link-accent"
                role="button"
                tabIndex={0}
                onClick={handleLoginClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLoginClick();
                  }
                }}
                aria-label="Navigate to login page"
              >
                Login to your world 🌙
              </span>
            </footer>
          </form>
        </main>
      </div>
    </div>
  );
}