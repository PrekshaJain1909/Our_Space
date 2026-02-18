exports.inviteTemplate = (inviteLink, name = "Beautiful") => {
  return {
    subject: "💖 You're Invited to Join Ourspace",
    text: `Join using this link: ${inviteLink}`,
    html: `
      <div style="
        margin:0;
        padding:40px 20px;
        background: linear-gradient(180deg,#ffe6f2 0%, #fff0f7 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">

        <div style="
          max-width:500px;
          margin:0 auto;
          background:#ffffff;
          padding:40px 30px;
          border-radius:20px;
          box-shadow: 0 20px 60px rgba(255, 105, 180, 0.15);
          text-align:center;
        ">

          <h1 style="
            margin:0;
            font-size:28px;
            color:#ff4da6;
          ">
            You’ve Been Invited 💌
          </h1>

          <p style="
            font-size:16px;
            color:#666;
            margin:20px 0 30px 0;
          ">
            Hi <strong>${name}</strong>, <br/>
            Your partner has invited you to join <strong>Ourspace</strong>.
          </p>

          <div style="margin:30px 0;">
            <a href="${inviteLink}" 
               style="
                 display:inline-block;
                 padding:14px 30px;
                 background:#ff4da6;
                 color:#ffffff;
                 text-decoration:none;
                 border-radius:30px;
                 font-weight:600;
                 font-size:16px;
                 box-shadow: 0 8px 20px rgba(255, 77, 166, 0.3);
               ">
               Join Now 💕
            </a>
          </div>

          <p style="
            font-size:14px;
            color:#999;
            margin-top:20px;
          ">
            This invitation link will expire in <strong>24 hours</strong>.
          </p>

          <div style="
            margin-top:30px;
            font-size:13px;
            color:#aaa;
          ">
            If you weren’t expecting this invite, you can safely ignore this email.
          </div>

          <div style="
            margin-top:30px;
            font-size:14px;
            color:#ff66b2;
            font-weight:500;
          ">
            With love 🤍 <br/>
            Team Ourspace
          </div>

        </div>
      </div>
    `
  };
};
