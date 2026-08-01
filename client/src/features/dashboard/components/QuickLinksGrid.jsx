import React from "react";
import "./QuickLinksGrid.css";

/**
 * Example usage:
 * 
 * const links = [
 *   { id: "healing", label: "Healing Zone", description: "Mistakes, apologies & forgiveness", emoji: "💗", to: "/healing" },
 *   { id: "games", label: "Games", description: "Truth or Dare, Bingo & more", emoji: "🎮", to: "/playtime" },
 *   { id: "mood", label: "Mood", description: "Track how you both feel today", emoji: "😊", to: "/mood" },
 *   { id: "bucket", label: "Bucket List", description: "Shared dreams & goals", emoji: "🎯", to: "/bucket" },
 * ];
 * 
 * <QuickLinksGrid
 *   links={links}
 *   onNavigate={(path) => navigate(path)}
 * />
 */

export default function QuickLinksGrid({ links, onNavigate }) {
  const defaultLinks = [
    {
      id: "healing",
      label: "Healing Zone",
      description: "Mistakes, apologies & forgiveness",
      emoji: "💗",
      to: "/healing",
    },
    {
      id: "games",
      label: "Games",
      description: "Truth or Dare, Bingo & more",
      emoji: "🎮",
      to: "/playtime",
    },
    {
      id: "mood",
      label: "Mood",
      description: "Track how you both feel today",
      emoji: "😊",
      to: "/mood",
    },
    {
      id: "bucket",
      label: "Bucket List",
      description: "Shared dreams & goals",
      emoji: "🎯",
      to: "/bucket",
    },
  ];

  const items = links && links.length > 0 ? links : defaultLinks;

  const handleClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate && item.to) {
      onNavigate(item.to);
    } else if (item.to) {
      console.log("Navigate to:", item.to);
    }
  };

  return (
    <div className="qlg-card">
      <div className="qlg-header">
        <span className="qlg-badge">Quick Links</span>
        <p className="qlg-subtitle">Jump into your favorite corners of this world.</p>
      </div>

      <div className="qlg-grid">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className="qlg-tile"
            onClick={() => handleClick(item)}
          >
            <div className="qlg-icon-bubble">
              <span className="qlg-icon">{item.emoji}</span>
            </div>
            <div className="qlg-text">
              <p className="qlg-label">{item.label}</p>
              <p className="qlg-desc">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
