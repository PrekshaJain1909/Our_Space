import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";

export default function MainLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ LOAD USER FROM LOCALSTORAGE
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  /**
   * Update time every minute for dynamic greeting
   */
  const handleInvite = async () => {
  if (!user?._id) return;

  const inviteLink = `${window.location.origin}/join/${user._id}`;

  try {
    // Copy to clipboard
    await navigator.clipboard.writeText(inviteLink);

    // If device supports share API (mobile)
    if (navigator.share) {
      await navigator.share({
  title: "Join Me In Ourspace 💖",
  text: `Hi Love 💗

I don’t want just memories…
I want a space that belongs to us.

A place to write, laugh, plan, and build our future together.

Tap the link and step into our world 💞

Always yours,
${user.name} 🤍`,
  url: inviteLink,
});

    } else {
      Swal.fire({
              icon: "success",
              title: "Invite Link Copied 💌",
              text: "The invite link has been copied to your clipboard.",
              confirmButtonColor: "#ff66c4",
            });
    }
  } catch (err) {
    console.error("Invite error:", err);
    Swal.fire({
            icon: "error",
            title: "Failed to generate invite link. 💔",
            text: "Please try again.",
            confirmButtonColor: "#ff66c4",
          });
  }
};

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
   * Greeting
   */
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  /**
   * User name formatting
   */
  const getUserName = () => {
    if (!user?.name) return "Lovely Couple";
    const firstName = user.name.split(" ")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const handleBrandClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const handleBrandKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrandClick();
    }
  };

  const goToLogin = () => navigate("/login");
  const goToRegister = () => navigate("/register");

  /**
   * ✅ PROPER LOGOUT
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    closeDrawer();
    navigate("/login");
  };

  const layoutClass = [
    "layout",
    collapsed ? "sidebar-collapsed" : "sidebar-expanded",
    isDrawerOpen ? "drawer-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Debug: Log couple id if available
  if (user && user.isActive) {
    console.log('Couple ID:', user.isActive);
  }
  return (
    <div className={layoutClass}>
      {/* Desktop Sidebar */}
      <aside
        className={`sidebar-wrap ${
          collapsed ? "sidebar--collapsed" : "sidebar--expanded"
        }`}
      >
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <div
              className="brand-block"
              role="button"
              tabIndex={0}
              onClick={handleBrandClick}
              onKeyDown={handleBrandKey}
            >
              <div className="icon-tile brand-icon-tile">
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

          <div className="divider" />
        </div>

        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          user={user}
          logout={handleLogout}
        />
      </aside>

      {/* Mobile Drawer */}
      <div className={`drawer ${isDrawerOpen ? "drawer--open" : ""}`}>
        <div className="drawer-overlay" onClick={closeDrawer} />

        <aside className="drawer-panel">
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

      {/* Main Column */}
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
            >
              ☰
            </button>

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
            {!user ? (
              <div className="auth-buttons">
                <button className="auth-btn auth-btn-login" onClick={goToLogin}>
                  Login
                </button>
                <button
                  className="auth-btn auth-btn-register"
                  onClick={goToRegister}
                >
                  Register
                </button>
              </div>
            ) : user && !user.isActive ? (
              <div className="auth-buttons">
                <button
                  className="auth-btn auth-btn-register"
                  onClick={handleInvite}
                >
                  Invite Partner 💌
                </button>

                <button className="auth-btn auth-btn-login" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="auth-btn auth-btn-login" onClick={handleLogout}>
                  Logout
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
