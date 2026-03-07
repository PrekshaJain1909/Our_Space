import React from "react";

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
