import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHeart,
  FaBoxOpen,
  FaClock,
  FaListAlt,
  FaGamepad,
  FaChartBar,
  FaRegBookmark,
  FaHeartbeat,
  FaSmile,
  FaSignOutAlt
} from "react-icons/fa";
import "../../layouts/MainLayout.css";

/**
 * Navigation items configuration
 */
const navigationItems = [
  { to: "/dashboard", label: "Dashboard", Icon: FaHeart, ariaLabel: "Go to Dashboard" },
  { to: "/love-notes", label: "Love Notes", Icon: FaRegBookmark, ariaLabel: "View Love Notes" },
  { to: "/healing-zone", label: "Healing Zone", Icon: FaHeartbeat, ariaLabel: "Access Healing Zone" },
  { to: "/analytics", label: "Analytics", Icon: FaChartBar, ariaLabel: "View Analytics" },
  { to: "/playtime", label: "Playtime", Icon: FaGamepad, ariaLabel: "Go to Playtime" },
  { to: "/bucket", label: "Bucket & Wedding", Icon: FaListAlt, ariaLabel: "View Bucket List and Wedding Plans" },
  { to: "/timeline", label: "Timeline", Icon: FaClock, ariaLabel: "View Timeline" },
  { to: "/memory-box", label: "Memory Box", Icon: FaBoxOpen, ariaLabel: "Open Memory Box" },
  { to: "/mood", label: "Mood & Upset", Icon: FaSmile, ariaLabel: "Track Mood and Feelings" },
];

/**
 * Sidebar Component
 */
export default function Sidebar({ 
  collapsed = false, 
  onToggle, 
  onLinkClick, 
  user, 
  logout, 
  mobile = false 
}) {
  
  /**
   * Get initials from user name for avatar
   */
  const getUserInitials = () => {
    if (!user?.name) return "💑";
    
    const names = user.name.trim().split(" ");
    if (names.length === 1) {
      return names[0][0].toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  /**
   * Handle link click
   */
  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  /**
   * Handle logout with confirmation
   */
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout?.();
    }
  };

  return (
    <div 
      className={`sidebar-component ${collapsed ? "collapsed" : "expanded"}`}
      role="complementary"
      aria-label="Main navigation sidebar"
    >
      {/* Navigation */}
      <nav className="nav" aria-label="Primary navigation">
        {navigationItems.map(({ to, label, Icon, ariaLabel }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleLinkClick}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            aria-label={ariaLabel}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            <div className="icon-tile" aria-hidden="true">
              <Icon className="tile-icon" />
            </div>
            {(!collapsed || mobile) && (
              <span className="item-label">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer - show when user is logged in */}
      {user && (
        <footer className="sidebar-footer">
          {/* Expanded state */}
          {(!collapsed || mobile) && (
            <>
              <div 
                className="avatar" 
                aria-label={`User avatar for ${user?.name || "couple"}`}
                title={user?.name || "Couple account"}
              >
                {getUserInitials()}
              </div>

              <div className="user-section">
                <div className="user-name" title={user?.name}>
                  {user?.name || "Love Account"}
                </div>
                {user?.email && (
                  <div className="user-email" title={user.email}>
                    {user.email}
                  </div>
                )}
              </div>

              <button
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Logout from account"
                title="Logout"
              >
                <FaSignOutAlt aria-hidden="true" />
              </button>
            </>
          )}

          {/* Collapsed state - icon only logout button */}
          {collapsed && !mobile && (
            <button
              className="logout-btn logout-btn--icon-only"
              onClick={handleLogout}
              aria-label="Logout from account"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          )}
        </footer>
      )}
    </div>
  );
}