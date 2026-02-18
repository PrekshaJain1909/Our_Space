import React, { useState } from "react";
import { registerPartnerA } from "../services/authApi";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    coupleName: "",
    name: "",
    email: "",
    password: "",
  });

  const [inviteLink, setInviteLink] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerPartnerA(form);
      setInviteLink(res.inviteLink);
      navigate("/verify-otp", { state: { email: form.email } });
      console.log(res);
      console.log("Invite Link:", res.inviteLink);
      console.log("OTP sent to:", form.email);
    } 
    catch (err) {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: err.response?.data?.message || "Something went wrong.",
            confirmButtonColor: "#ff66c4",
            background: "#1c003a",
            color: "#fff",
          });
        }

  };

  return (
    <div className="romantic-page">
      <div className="romantic-hero">
        <h1 className="hero-title">
          Start your <br />
          <span>shared love story.</span>
        </h1>

        <p className="hero-subtitle">
          A beautiful space to cherish your memories, dreams, and promises
          together
        </p>
      </div>

      <div className="glass-card">
        <h2 className="card-title">Create couple account 💖</h2>

        <p className="card-subtitle">
          We'll keep your memories and promises safe under this moon.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Couple Name *</label>
            <input
              name="coupleName"
              placeholder="Soulmates❤️ "
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Your Name *</label>
            <input
              name="name"
              placeholder="Your name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Email *</label>
            <input
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create password"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="primary-btn">
            Create Account ✨
          </button>
        </form>
      </div>
    </div>
  );
}
