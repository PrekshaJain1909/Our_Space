import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerPartnerA, registerPartnerB, resendOtp } from "../services/authApi";
import AuthPageShell from "../components/AuthPageShell";
import AuthField from "../components/AuthField";
import PasswordField from "../components/PasswordField";
import { buildVerifyOtpPath, setPendingOtpEmail } from "../../../utils/otpFlow";

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

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

    if (isInviteFlow) {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }

    const missing = isInviteFlow
      ? !name || !email || !password
      : !coupleName || !name || !email || !password;

    if (missing) {
      Swal.fire({
        icon: "warning",
        title: "All fields required 💌",
        ...getSwalThemeOptions(),
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
        await registerPartnerA({ coupleName, name, email, password });
      }

      setPendingOtpEmail(email);
      navigate(buildVerifyOtpPath({ email, query: inviteQuerySuffix }), {
        state: { email },
      });
    } catch (err) {
      // axiosClient interceptor spreads response.data onto the error, so
      // the message lives at err.message, not err.response?.data?.message
      const errMsg = err.message || err.response?.data?.message || "Something went wrong.";
      const status = err.status || err.response?.status;

      if (status === 200) {
        setPendingOtpEmail(email);
        navigate(buildVerifyOtpPath({ email, query: inviteQuerySuffix }), {
          state: { email },
        });
      } else if (errMsg.toLowerCase().includes("already exist") || errMsg.toLowerCase().includes("user already exist")) {
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
        Swal.fire({
          icon: "error",
          title: isInviteFlow ? "Join failed" : "Registration failed",
          text: errMsg,
          ...getSwalThemeOptions(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    try {
      await resendOtp(resendEmail.trim());
      Swal.fire({
        icon: "success",
        title: "OTP sent 💌",
        text: "Check your email for the new code.",
        ...getSwalThemeOptions(),
        timer: 2500,
        showConfirmButton: false,
      });
      const email = resendEmail.trim();
      setPendingOtpEmail(email);
      navigate(buildVerifyOtpPath({ email, query: inviteQuerySuffix }), {
        state: { email },
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not resend OTP",
        text: err.response?.data?.message || "Please try again.",
        ...getSwalThemeOptions(),
      });
    } finally {
      setResendLoading(false);
    }
  };

  const heroTitle = isInviteFlow ? (
    <>
      Join your <span className="auth-page__highlight">shared space</span>
      <br />
      and start making memories
    </>
  ) : (
    <>
      Begin your <span className="auth-page__highlight">love story</span>
      <br />
      together, forever
    </>
  );

  return (
    <AuthPageShell
     
      heroTitle={heroTitle}
      heroDescription={
        isInviteFlow
          ? "Complete signup to join your partner in one shared love space."
          : "Create your private couple space for memories, milestones, and everyday moments."
      }
    >
      <header className="auth-page__panel-head">
        <h2 className="auth-page__panel-title">
          {isInviteFlow ? "Join your partner" : "Create account"}
        </h2>
        <p className="auth-page__panel-subtitle">
          {isInviteFlow
            ? "Verify your email to activate your invite"
            : "We'll send a code to confirm your email"}
        </p>
      </header>

      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        {!isInviteFlow && (
          <AuthField
            id="coupleName"
            name="coupleName"
            label="Couple name"
            placeholder="Moon & Stars"
            disabled={loading}
          />
        )}

        <AuthField
          id="name"
          name="name"
          label="Your name"
          placeholder="Your name"
          autoComplete="name"
          disabled={loading}
        />

        <AuthField
          id="email"
          name="email"
          label="Email"
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

        <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
          {loading
            ? "Submitting..."
            : isInviteFlow
              ? "Join now"
              : "Create account"}
        </button>
      </form>

      <footer className="auth-footer">
        <p className="auth-footer__text">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-btn auth-btn--link"
            onClick={() => navigate(`/login${inviteQuerySuffix}`)}
            disabled={loading}
          >
            Sign in
          </button>
        </p>

        {!showResend ? (
          <p className="auth-footer__text">
            Already registered?{" "}
            <button
              type="button"
              className="auth-btn auth-btn--link"
              onClick={() => setShowResend(true)}
              disabled={loading}
            >
              Resend OTP
            </button>
          </p>
        ) : (
          <form className="auth-resend" onSubmit={handleResendOtp}>
            <input
              type="email"
              className="auth-field__input"
              placeholder="Registered email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
              disabled={resendLoading}
            />
            <div className="auth-resend__actions">
              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Send OTP"}
              </button>
              <button
                type="button"
                className="auth-btn auth-btn--ghost"
                onClick={() => setShowResend(false)}
                disabled={resendLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </footer>
    </AuthPageShell>
  );
}
