import React, { useRef } from "react";

export default function OTPInput({ length = 6, onChange, disabled }) {
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    
    if (pastedData) {
      let currentOtp = "";
      for (let i = 0; i < length; i++) {
        if (i < pastedData.length) {
          inputsRef.current[i].value = pastedData[i];
          currentOtp += pastedData[i];
        } else {
          inputsRef.current[i].value = "";
        }
      }
      
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex].focus();
      
      onChange(currentOtp);
    }
  };

  return (
    <>
      <style>
        {`
          .otp-input-box {
            width: 3.25rem;
            height: 3.75rem;
            font-size: 1.75rem;
            font-weight: 700;
            text-align: center;
            border-radius: 12px;
            border: 2px solid rgba(255, 93, 162, 0.2);
            background: rgba(255, 93, 162, 0.03);
            color: var(--accent-primary, #ff5da2);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            box-shadow: 0 4px 10px rgba(255, 93, 162, 0.03);
            flex-shrink: 0;
            padding: 0;
            margin: 0;
            font-family: inherit;
          }
          .otp-input-box:focus {
            border-color: var(--accent-primary, #ff5da2);
            background: rgba(255, 93, 162, 0.08);
            box-shadow: 0 0 0 4px rgba(255, 93, 162, 0.15), 0 6px 16px rgba(255, 93, 162, 0.1);
            transform: translateY(-2px);
          }
          .otp-input-box:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: rgba(0, 0, 0, 0.05);
            border-color: rgba(0, 0, 0, 0.1);
            transform: none;
            box-shadow: none;
          }
          
          /* Dark mode support if html has .dark */
          .dark .otp-input-box {
            border-color: rgba(255, 93, 162, 0.3);
            background: rgba(12, 0, 32, 0.85);
            color: #ffeefc;
          }
          .dark .otp-input-box:focus {
            border-color: #ff5da2;
            background: rgba(255, 93, 162, 0.15);
            box-shadow: 0 0 0 4px rgba(255, 93, 162, 0.2), 0 6px 16px rgba(255, 93, 162, 0.2);
          }
        `}
      </style>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", width: "100%", padding: "10px 0" }}>
        {[...Array(length)].map((_, index) => (
          <input
            key={index}
            maxLength={1}
            ref={(el) => (inputsRef.current[index] = el)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled}
            className="otp-input-box"
          />
        ))}
      </div>
    </>
  );
}
