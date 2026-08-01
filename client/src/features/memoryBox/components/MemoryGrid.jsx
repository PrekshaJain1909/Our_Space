import React from "react";
import { CalendarDays, Heart, MapPin, Share2, Sparkles, Trash2 } from "lucide-react";
import "../MemoryBox.css";

const moodPalette = {
  happy: { accent: "#FF4FB7", glow: "rgba(255, 79, 183, 0.24)" },
  love: { accent: "#FF5D8F", glow: "rgba(255, 93, 143, 0.24)" },
  trip: { accent: "#4FB8FF", glow: "rgba(79, 184, 255, 0.24)" },
  rain: { accent: "#6D7CFF", glow: "rgba(109, 124, 255, 0.24)" },
  date: { accent: "#FFA85C", glow: "rgba(255, 168, 92, 0.24)" },
  romantic: { accent: "#A855F7", glow: "rgba(168, 85, 247, 0.24)" },
  calm: { accent: "#8B5CF6", glow: "rgba(139, 92, 246, 0.24)" },
  emotional: { accent: "#FF5CA8", glow: "rgba(255, 92, 168, 0.24)" },
};

export default function MemoryGrid({ memories = [], onOpenMemory, onToggleFavorite, onShare, onDelete, onAddFirstMemory }) {
  if (memories.length === 0) {
    return (
      <div className="memory-glass-card memory-empty-state-card">
        <div className="memory-card-header">
          <p className="memory-section-tag">📦 Memories</p>
          <h2>What a beautiful page this will become</h2>
        </div>
        <div className="memory-empty-card">
          <div className="memory-empty-icon">📦❤️</div>
          <h3 className="memory-empty-title">No memories yet.</h3>
          <p className="memory-empty-copy">
            Every beautiful relationship starts with one unforgettable moment.
          </p>
          <button type="button" className="memory-submit-btn" onClick={onAddFirstMemory}>
            <Sparkles size={16} /> Add First Memory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-grid">
      {memories.map((memory, index) => {
        const palette = moodPalette[memory.mood] || moodPalette.romantic;
        const isFavorite = Boolean(memory.isFavorite);

        return (
          <article
            key={memory.id}
            className="memory-card"
            data-mood={memory.mood || "romantic"}
            style={{
              "--mood-accent": palette.accent,
              "--mood-glow": palette.glow,
              "--card-rotation": `${memory.rotation ?? 0}deg`,
            }}
            onClick={() => onOpenMemory && onOpenMemory(memory, index)}
          >
            <div className="memory-card-image-wrap">
              <div className="memory-card-badges">
                <span className="memory-badge-pill">{memory.mood || "memory"}</span>
              </div>
              <>
                <img
                  src={memory.imageUrl || ''}
                  alt={memory.title}
                  className="memory-card-image"
                  onError={(e) => {
                    try {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.querySelector('.memory-card-image-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    } catch (err) { /* ignore */ }
                  }}
                  style={{ display: memory.imageUrl ? 'block' : 'none' }}
                />
                <div className="memory-card-image memory-card-image-placeholder" style={{ display: memory.imageUrl ? 'none' : 'flex' }}>
                  <span>No photo yet</span>
                </div>
              </>
            </div>

            <div className="memory-card-content">
              <div className="memory-card-title-row">
                <h3 className="memory-card-title">{memory.title}</h3>
                <button
                  type="button"
                  className={`memory-heart-btn ${isFavorite ? "is-favorite" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite && onToggleFavorite(memory.id);
                  }}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    size={15}
                    className="memory-heart-icon"
                    fill={isFavorite ? "#ef4444" : "none"}
                    stroke={isFavorite ? "#ef4444" : "currentColor"}
                    strokeWidth={isFavorite ? 1.8 : 2}
                  />
                </button>
              </div>

              <div className="memory-card-meta-row">
                <div className="memory-card-meta-pill">
                  <MapPin size={13} />
                  <span>{memory.location || "A lovely place"}</span>
                </div>
                <div className="memory-card-meta-pill">
                  <CalendarDays size={13} />
                  <span>{memory.date ? new Date(memory.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Date"}</span>
                </div>
              </div>

              <div className="memory-card-actions-row">
                <button
                  type="button"
                  className={`memory-inline-action memory-heart-btn ${isFavorite ? "is-favorite" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite && onToggleFavorite(memory.id);
                  }}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    size={14}
                    className="memory-heart-icon"
                    fill={isFavorite ? "#ef4444" : "none"}
                    stroke={isFavorite ? "#ef4444" : "currentColor"}
                    strokeWidth={isFavorite ? 1.8 : 2}
                  />
                </button>
                <button
                  type="button"
                  className="memory-inline-action"
                  onClick={(event) => {
                    event.stopPropagation();
                    onShare && onShare(memory);
                  }}
                >
                  <Share2 size={14} />
                </button>
                <button
                  type="button"
                  className="memory-inline-action memory-inline-action-danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete && onDelete(memory);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
