import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { registerPartnerB } from "../services/authApi";

export default function JoinPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerPartnerB({ ...form, token });
      navigate("/verify-otp");
    } catch (err) {
      alert("Join failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Join Your Partner</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Your Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />

        <button type="submit">Join</button>
      </form>
    </div>
  );
}
