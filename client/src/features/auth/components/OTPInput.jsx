import React, { useRef } from "react";

export default function OTPInput({ length = 6, onChange }) {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    const otp = inputsRef.current
      .map((input) => input?.value || "")
      .join("");

    onChange(otp);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
      {[...Array(length)].map((_, index) => (
        <input
          key={index}
          maxLength={1}
          ref={(el) => (inputsRef.current[index] = el)}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          style={{
            width: "45px",
            height: "50px",
            fontSize: "20px",
            textAlign: "center",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      ))}
    </div>
  );
}
