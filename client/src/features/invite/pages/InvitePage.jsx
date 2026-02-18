import React from "react";

export default function InvitePage() {
  const inviteLink = `${window.location.origin}/register?ref=YOUR_USER_ID`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>💌 Invite Your Partner</h1>
      <p>Share this link with your partner:</p>

      <div style={{ marginTop: "15px" }}>
        <input
          type="text"
          value={inviteLink}
          readOnly
          style={{ width: "100%", padding: "8px" }}
        />
        <button onClick={copyLink} style={{ marginTop: "10px" }}>
          Copy Invite Link
        </button>
      </div>
    </div>
  );
}
