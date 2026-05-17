import React from "react";
import "./InvitePage.css";

export default function InvitePage() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coupleId = storedUser?.coupleId || "";
  const inviteLink = coupleId
    ? `${window.location.origin}/join?coupleId=${coupleId}`
    : `${window.location.origin}/join`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied!");
  };

  return (
    <div className="invite-page section">
      <div className="invite-card card">
      <h1 className="invite-title">💌 Invite Your Partner</h1>
      <p className="invite-subtitle">Share this link with your partner:</p>

      <div className="invite-actions">
        <div className="input-wrapper">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="input-field"
        />
        </div>
        <button onClick={copyLink} className="btn btn-primary invite-btn">
          Copy Invite Link
        </button>
      </div>
      </div>
    </div>
  );
}
