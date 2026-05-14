const nodemailer = require("nodemailer");
const { otpTemplate } = require("../templates/otpTemplate");
const { inviteTemplate } = require("../templates/inviteTemplate");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMail = async (to, { subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
  }
  
  try {
    await transporter.sendMail({
      from: `"Ourspace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};

exports.sendOTPEmail = async (email, otp) => {
  const template = otpTemplate(otp);
  await sendMail(email, template);
};

exports.sendInviteEmail = async (email, link) => {
  const template = inviteTemplate(link);
  await sendMail(email, template);
};
