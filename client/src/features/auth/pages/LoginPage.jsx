import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import useToast from "../../../hooks/useToast";
import AuthPageShell from "../components/AuthPageShell";
import AuthField from "../components/AuthField";
import PasswordField from "../components/PasswordField";
import {
  buildVerifyOtpPath,
  setPendingOtpEmail,
  setPendingOtpUserId,
} from "../../../utils/otpFlow";

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
  const inviteRegisterSuffix = inviteRegisterQuery.toString()
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
      success(
        res.user?.partnerPending
          ? "Welcome back 💕 — waiting for your partner to verify."
          : "Welcome back 💕"
      );
      navigate("/dashboard");
      return;
    }

    const needsOtp =
      (res?.status === 403 && res?.code === "USER_UNVERIFIED") ||
      res?.redirectTo === "/verify-otp" ||
      /verify/i.test(res?.message || "");

    if (needsOtp) {
      const email = (res?.email || "").trim();
      const userId = (res?.userId || "").toString().trim();
      setPendingOtpEmail(email);
      setPendingOtpUserId(userId);
      navigate(buildVerifyOtpPath({ email, query: inviteQuerySuffix }), {
        state: {
          ...(email ? { email } : {}),
          ...(userId ? { userId } : {}),
        },
      });
      return;
    }

    toastError(res?.message || "Login failed — check your credentials and try again.");
  };

  return (
    <AuthPageShell
      
      heroTitle={
        <>
          Your <span className="auth-page__highlight">shared moments</span>
          <br />
          beautifully preserved
        </>
      }
      heroDescription="Track your journey together, celebrate milestones, and build memories that last. Your love story deserves a space as unique as you are."
    >
      <header className="auth-page__panel-head">
        <h2 className="auth-page__panel-title">Welcome back</h2>
        <p className="auth-page__panel-subtitle">Sign in to continue your journey</p>
      </header>

      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="coupleName"
          name="coupleName"
          label="Couple name"
          placeholder="Moon & Stars"
          autoComplete="username"
          disabled={loading}
        />

        <PasswordField
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={loading}
          showPassword={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
        />

        <div className="auth-options">
          <label className="auth-checkbox">
            <input type="checkbox" className="auth-checkbox__box" disabled={loading} />
            <span>Remember me</span>
          </label>
          <button type="button" className="auth-btn auth-btn--link" disabled={loading}>
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="auth-btn auth-btn--primary"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="auth-btn__spinner" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <footer className="auth-footer">
        <p className="auth-footer__text">
          New here?{" "}
          <button
            type="button"
            className="auth-btn auth-btn--link"
            onClick={() => navigate(`/register${inviteRegisterSuffix}`)}
            disabled={loading}
          >
            Create an account
          </button>
        </p>
      </footer>
    </AuthPageShell>
  );
}
