import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../../../components/ui/ThemeToggle";
import "../styles/AuthNavbar.css";

function navClassName({ isActive }) {
  return ["auth-nav__link", isActive ? "auth-nav__link--active" : ""]
    .filter(Boolean)
    .join(" ");
}

export default function AuthNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasInvite =
    searchParams.has("inviteToken") ||
    searchParams.has("token") ||
    searchParams.has("coupleId");

  const registerParams = new URLSearchParams(location.search);
  if (hasInvite) registerParams.set("fromAuth", "1");
  const querySuffix = location.search || "";
  const registerPath = registerParams.toString()
    ? `/register?${registerParams.toString()}`
    : "/register";

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => {
      const token =
        localStorage.getItem("auth_token") || localStorage.getItem("token");
      setIsLoggedIn(Boolean(token));
    };
    sync();
    window.addEventListener("auth-token-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-token-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [location.pathname]);

  const loginPath = `/login${querySuffix}`;
  const joinPath = `/join${querySuffix}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-token-updated"));
    navigate(`/login${querySuffix}`);
  };

  return (
    <header className="auth-nav">
      <div className="auth-nav__inner">
        <button
          type="button"
          className="auth-nav__brand"
          onClick={() => navigate(isLoggedIn ? "/dashboard" : `/login${querySuffix}`)}
          aria-label="Ourspace home"
        >
          <span className="auth-nav__logo" aria-hidden="true">
            💖
          </span>
          <span className="auth-nav__brand-text">
            <span className="auth-nav__brand-title">Together</span>
            <span className="auth-nav__brand-sub">Your Love Journey</span>
          </span>
        </button>

        <nav className="auth-nav__links" aria-label="Authentication">
          
          
        </nav>

        <div className="auth-nav__actions">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                className="auth-nav__btn auth-nav__btn--ghost"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
              <button
                type="button"
                className="auth-nav__btn auth-nav__btn--primary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="auth-nav__btn auth-nav__btn--ghost auth-nav__btn--hide-mobile"
                onClick={() => navigate("/dashboard")}
              >
                Explore
              </button>
              <button
                type="button"
                className="auth-nav__btn auth-nav__btn--ghost auth-nav__btn--hide-desktop"
                onClick={() => navigate(loginPath)}
              >
                Login
              </button>
              <button
                type="button"
                className="auth-nav__btn auth-nav__btn--primary auth-nav__btn--hide-desktop"
                onClick={() => navigate(registerPath)}
              >
                Register
              </button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
