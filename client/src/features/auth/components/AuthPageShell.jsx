import React from "react";
import "../styles/AuthPage.css";

export default function AuthPageShell({
  heroTitle,
  heroDescription,
  onBack,
  backAriaLabel = "Go back",
  children,
}) {
  const heroBlock = (
    <>
      {onBack && (
        <button
          type="button"
          className="auth-page__back"
          onClick={onBack}
          aria-label={backAriaLabel}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      )}
      <h1 className="auth-page__hero-title">{heroTitle}</h1>
      <p className="auth-page__hero-text">{heroDescription}</p>
    </>
  );

  return (
    <div className="auth-page">
      <div className="auth-page__glow auth-page__glow--a" aria-hidden="true" />
      <div className="auth-page__glow auth-page__glow--b" aria-hidden="true" />

      <div className="auth-page__layout">
        <section className="auth-page__hero auth-page__hero--mobile">{heroBlock}</section>

        <section className="auth-page__hero auth-page__hero--desktop">{heroBlock}</section>

        <div className="auth-page__panel-wrap">
          <div className="auth-page__panel">{children}</div>
        </div>
      </div>
    </div>
  );
}
