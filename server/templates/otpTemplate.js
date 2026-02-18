exports.otpTemplate = (otp, name = "Beautiful") => {
  return {
    subject: "💖 Your OTP Code – Verify Your Account",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
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
            Verify Your Account 💌
          </h1>

          <p style="
            font-size:16px;
            color:#666;
            margin:20px 0 30px 0;
          ">
            Hi <strong>${name}</strong>, <br/>
            Use the OTP below to continue.
          </p>

          <div style="
            background:#fff5fa;
            border:2px solid #ffd6eb;
            padding:25px;
            border-radius:15px;
            margin-bottom:25px;
          ">

            <div style="
              font-size:36px;
              font-weight:bold;
              letter-spacing:8px;
              color:#ff3399;
            ">
              ${otp}
            </div>

          </div>

          <p style="
            font-size:14px;
            color:#999;
          ">
            This code will expire in <strong>5 minutes</strong>.
          </p>

          <div style="
            margin-top:30px;
            font-size:13px;
            color:#aaa;
          ">
            If you didn’t request this, you can safely ignore this email.
          </div>

          <div style="
            margin-top:30px;
            font-size:14px;
            color:#ff66b2;
            font-weight:500;
          ">
            With love 🤍 <br/>
            Your Team
          </div>

        </div>
      </div>
    `
  };
};
