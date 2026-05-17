import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

export default function JoinPage() {
  const { inviteCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryInviteToken =
    searchParams.get("inviteToken") || searchParams.get("token") || "";
  const queryCoupleId = searchParams.get("coupleId") || "";

  const looksLikeInviteToken =
    typeof inviteCode === "string" && /^[a-f0-9]{64}$/i.test(inviteCode);

  const inviteToken = queryInviteToken || (looksLikeInviteToken ? inviteCode : "");
  const coupleId = queryCoupleId || (!looksLikeInviteToken ? inviteCode || "" : "");

  const authQuery = new URLSearchParams();
  if (inviteToken) authQuery.set("inviteToken", inviteToken);
  if (coupleId) authQuery.set("coupleId", coupleId);

  const loginUrl = authQuery.toString() ? `/login?${authQuery.toString()}` : "/login";
  const registerQuery = new URLSearchParams(authQuery);
  registerQuery.set("fromAuth", "1");
  const registerUrl = registerQuery.toString()
    ? `/register?${registerQuery.toString()}`
    : "/register";

  return (
    <AuthPageShell
      heroTitle={
        <>
          You&apos;re invited to <span className="auth-page__highlight">Ourspace</span>
        </>
      }
      heroDescription="Join your partner in a private space for memories, milestones, and everyday love."
    >
      <header className="auth-page__panel-head">
        <h2 className="auth-page__panel-title">Accept invite</h2>
        <p className="auth-page__panel-subtitle">
          Sign in or create an account to join your partner&apos;s space.
        </p>
      </header>

      <div className="auth-page__form">
        <button
          type="button"
          className="auth-btn auth-btn--primary"
          onClick={() => navigate(loginUrl)}
        >
          Sign in
        </button>
        <button
          type="button"
          className="auth-btn auth-btn--ghost"
          onClick={() => navigate(registerUrl)}
        >
          Create account
        </button>
      </div>
    </AuthPageShell>
  );
}
