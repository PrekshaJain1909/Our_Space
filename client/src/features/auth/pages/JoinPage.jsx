import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./LoginPage.css";

export default function JoinPage() {
  const { inviteCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryInviteToken =
    searchParams.get("inviteToken") || searchParams.get("token") || "";
  const queryCoupleId = searchParams.get("coupleId") || "";

  // Invite tokens are generated as 64-char hex strings; anything else is treated as coupleId.
  const looksLikeInviteToken =
    typeof inviteCode === "string" && /^[a-f0-9]{64}$/i.test(inviteCode);

  const inviteToken = queryInviteToken || (looksLikeInviteToken ? inviteCode : "");
  const coupleId = queryCoupleId || (!looksLikeInviteToken ? inviteCode || "" : "");

  const authQuery = new URLSearchParams();
  if (inviteToken) authQuery.set("inviteToken", inviteToken);
  if (coupleId) authQuery.set("coupleId", coupleId);

  const authUrl = authQuery.toString() ? `/login?${authQuery.toString()}` : "/login";

  const handleJoinNow = () => navigate(authUrl);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-intro">
          <div className="intro-content">
            <h1 className="intro-title">
              You are invited to <span className="highlight">Ourspace</span>
            </h1>
            <p className="intro-description">
              Join your partner in a shared private space for memories, milestones, and moments.
            </p>
          </div>
        </div>

        <div className="login-card-wrapper">
          <div className="login-card">
            <header className="card-header">
              <h2 className="card-title">Join Now</h2>
              <p className="card-description">Continue to authentication to accept this invite.</p>
            </header>

            <button type="button" className="submit-button" onClick={handleJoinNow}>
              Join Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
