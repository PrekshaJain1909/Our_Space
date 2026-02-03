import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css"; // adjust path if needed

export default function MainLayout() {
  const { user, logout } = useAuth() || {};

  const [collapsed, setCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);

  const handleBrandClick = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setIsDrawerOpen((v) => !v);
    } else {
      setCollapsed((c) => !c);
    }
  };

  const handleBrandKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrandClick();
    }
  };

  // keep layout state classes
  const layoutClass = [
    "layout",
    collapsed ? "sidebar-collapsed" : "sidebar-expanded",
    isDrawerOpen ? "drawer-open" : "",
  ].join(" ");

  // optional: auto-collapse for small screens on initial load/resize
  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 900) setCollapsed(true);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navigate = useNavigate();

  function goToLogin() {
    navigate('/login');
  }

  function goToRegister() {
    navigate('/register');
  }


  return (
    <div className={layoutClass}>
      

      {/* LEFT fixed sidebar */}
      <aside
        className={`sidebar-wrap ${collapsed ? "sidebar--collapsed" : "sidebar--expanded"}`}
        aria-hidden={false}
      >
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <div
              className="brand-block"
              role="button"
              tabIndex={0}
              onClick={handleBrandClick}
              onKeyDown={handleBrandKey}
              aria-pressed={collapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="icon-tile brand-icon-tile">
                <span className="tile-icon" aria-hidden>
                  💖
                </span>
              </div>

              {!collapsed && (
                <div className="item-label brand-label">
                  <div className="brand-title-small">Couple Space</div>
                  <div className="brand-sub-small">Navbar Gallery</div>
                </div>
              )}
            </div>

           
          </div>

          <div className="divider" />
        </div>

        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          user={user}
          logout={logout}
        />
      </aside>

      {/* MOBILE drawer */}
      <div className={`drawer ${isDrawerOpen ? "drawer--open" : ""}`} aria-hidden={!isDrawerOpen}>
        <div className="drawer-overlay" onClick={closeDrawer} />
        <aside className="drawer-panel" role="dialog" aria-modal="true">
          <Sidebar
            mobile
            collapsed={false}
            onToggle={closeDrawer}
            user={user}
            logout={() => {
              logout?.();
              closeDrawer();
            }}
            onLinkClick={closeDrawer}
          />
        </aside>
      </div>

      {/* RIGHT area: topbar + content — these start AFTER the sidebar (do NOT overlap it) */}
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            {/* Hamburger menu for mobile */}
            <button
              className="mobile-menu-btn"
              aria-label="Open navigation menu"
              onClick={() => setIsDrawerOpen(true)}
            >
              {/* <span className="sr-only">Open menu</span> */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="desktop-welcome desktop-welcome-center">
              <h2 className="welcome-text">
                Welcome back
                {user?.name
                  ? `, ${user.name
                      .split(" ")[0]
                      .charAt(0)
                      .toUpperCase() + user.name.split(" ")[0].slice(1)}`
                  : " Lovely Couple"} ✨
              </h2>
              <p className="welcome-sub">
                Track love notes, moods, promises and more in one cozy place.
              </p>
            </div>
          </div>
          <div className="topbar-right">
            {user ? (
              <div className="pill" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="logout-btn"
                  onClick={() => logout?.()}
                  style={{ marginLeft: 8 }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="auth-btn auth-btn-login" onClick={goToLogin}>
                  Login
                </button>
                <button className="auth-btn auth-btn-login" onClick={goToRegister}>
                  Register
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}
