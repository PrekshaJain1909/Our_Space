import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";

/**
 * MainLayout Component
 * 
 * Provides the main application layout with:
 * - Fixed left sidebar with collapsible functionality
 * - Sticky topbar with branding and user controls
 * - Mobile drawer navigation
 * - Main content area with Outlet for nested routes
 */
export default function MainLayout() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();

  // State management
  const [collapsed, setCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  /**
   * Update time every minute for dynamic greeting
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /**
   * Auto-collapse sidebar on small screens
   */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 900) {
        setCollapsed(true);
      }
    }
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Prevent body scroll when drawer is open
   */
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  /**
   * Get time-based greeting
   */
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  /**
   * Get formatted user name
   */
  const getUserName = () => {
    if (!user?.name) return "Lovely Couple";
    const firstName = user.name.split(" ")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  /**
   * Close drawer
   */
  const closeDrawer = () => setIsDrawerOpen(false);

  /**
   * Handle brand click - toggles sidebar or drawer based on screen size
   */
  const handleBrandClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  /**
   * Handle keyboard interaction for brand
   */
  const handleBrandKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrandClick();
    }
  };

  /**
   * Navigation handlers
   */
  const goToLogin = () => navigate("/login");
  const goToRegister = () => navigate("/register");

  /**
   * Handle logout with drawer close
   */
  const handleLogout = () => {
    logout?.();
    closeDrawer();
  };

  // Layout class names
  const layoutClass = [
    "layout",
    collapsed ? "sidebar-collapsed" : "sidebar-expanded",
    isDrawerOpen ? "drawer-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layoutClass}>
      {/* Desktop Sidebar */}
      <aside
        className={`sidebar-wrap ${collapsed ? "sidebar--collapsed" : "sidebar--expanded"}`}
        aria-label="Main navigation sidebar"
        aria-hidden={false}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <div
              className="brand-block"
              role="button"
              tabIndex={0}
              onClick={handleBrandClick}
              onKeyDown={handleBrandKey}
              aria-pressed={collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="icon-tile brand-icon-tile" aria-hidden="true">
                <span className="tile-icon">💖</span>
              </div>

              {!collapsed && (
                <div className="brand-label">
                  <div className="brand-title-small">Together</div>
                  <div className="brand-sub-small">Your Love Journey</div>
                </div>
              )}
            </div>
          </div>

          <div className="divider" aria-hidden="true" />
        </div>

        {/* Sidebar Navigation */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          user={user}
          logout={logout}
        />
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`drawer ${isDrawerOpen ? "drawer--open" : ""}`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className="drawer-overlay"
          onClick={closeDrawer}
          aria-label="Close navigation menu"
        />
        <aside
          className="drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Mobile Drawer Header */}
          <div className="sidebar-header">
            <div className="sidebar-header-row">
              <div className="brand-block">
                <div className="icon-tile brand-icon-tile" aria-hidden="true">
                  <span className="tile-icon">💖</span>
                </div>
                <div className="brand-label">
                  <div className="brand-title-small">Together</div>
                  <div className="brand-sub-small">Your Love Journey</div>
                </div>
              </div>

              <button
                className="drawer-close-btn"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                title="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="divider" aria-hidden="true" />
          </div>

          {/* Mobile Drawer Navigation */}
          <Sidebar
            mobile
            collapsed={false}
            onToggle={closeDrawer}
            user={user}
            logout={handleLogout}
            onLinkClick={closeDrawer}
          />
        </aside>
      </div>

      {/* Main Content Column */}
      <div className="main-column">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
              onClick={() => setIsDrawerOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Welcome Message */}
            <div className="desktop-welcome desktop-welcome-center">
              <h2 className="welcome-text">
                {getGreeting()}, {getUserName()}! ✨
              </h2>
              <p className="welcome-sub">
                Track love notes, moods, promises and more in one cozy place.
              </p>
            </div>
          </div>

          <div className="topbar-right">
            {user ? (
              <div className="pill">
                <div className="user-info">
                  <span className="user-avatar" aria-hidden="true">
                    {user.name?.[0]?.toUpperCase() || "💑"}
                  </span>
                  <span className="user-name-pill">{getUserName()}</span>
                </div>
                <button
                  className="logout-btn"
                  onClick={logout}
                  aria-label="Logout from account"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="auth-btn auth-btn-login"
                  onClick={goToLogin}
                  aria-label="Go to login page"
                >
                  Login
                </button>
                <button
                  className="auth-btn auth-btn-register"
                  onClick={goToRegister}
                  aria-label="Go to registration page"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="content" role="main">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}