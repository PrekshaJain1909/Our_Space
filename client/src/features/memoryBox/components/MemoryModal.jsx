import React from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Heart, MapPin, PencilLine, Share2, Sparkles, Trash2 } from "lucide-react";
import "../MemoryBox.css";

export default function MemoryModal({ memory, onClose, onToggleFavorite, onShare, onEdit, onDelete, onPrevious, onNext, hasPrevious, hasNext }) {
  if (!memory) return null;

  const isFavorite = Boolean(memory.isFavorite);

  return (
    <div className="memory-modal-backdrop" onClick={onClose}>
      <div className="memory-modal" onClick={(event) => event.stopPropagation()}>
        <div className="memory-modal-topbar">
          <button type="button" className="memory-album-action-btn memory-album-back-btn memory-modal-back-btn" onClick={onClose}>
            <ArrowLeft size={16} /> Back to Album
          </button>
        </div>

        <div className="memory-modal-content" key={memory.id}>
          <div className="memory-modal-image-section">
            {memory.imageUrl ? (
              <div className="memory-modal-image-panel">
                <img src={memory.imageUrl} alt={memory.title} className="memory-modal-image" />
              </div>
            ) : (
              <div className="memory-modal-placeholder">
                <span>No image uploaded</span>
              </div>
            )}
          </div>

          <div className="memory-modal-toolbar">
            <button type="button" className="memory-action-btn" onClick={(event) => {
              event.stopPropagation();
              onPrevious && onPrevious();
            }} disabled={!hasPrevious}>
              <ArrowLeft size={16} />
            </button>
            <button type="button" className="memory-action-btn" onClick={(event) => {
              event.stopPropagation();
              onNext && onNext();
            }} disabled={!hasNext}>
              <ArrowRight size={16} />
            </button>
            <button type="button" className={`memory-heart-btn ${isFavorite ? "is-favorite" : ""}`} onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite && onToggleFavorite(memory.id);
            }} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <Heart
                size={16}
                className="memory-heart-icon"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isFavorite ? 2 : 2}
              />
            </button>
            <button type="button" className="memory-action-btn" onClick={(event) => {
              event.stopPropagation();
              onShare && onShare(memory);
            }}>
              <Share2 size={16} />
            </button>
            <button type="button" className="memory-action-btn" onClick={(event) => {
              event.stopPropagation();
              onEdit && onEdit(memory);
            }}>
              <PencilLine size={16} />
            </button>
            <button type="button" className="memory-action-btn" onClick={(event) => {
              event.stopPropagation();
              onDelete && onDelete(memory);
            }}>
              <Trash2 size={16} />
            </button>
          </div>

          <div className="memory-modal-info">
            <div className="memory-card-badges memory-modal-badges">
              <span className="memory-badge-pill">{memory.mood || "memory"}</span>
              {memory.location ? <span className="memory-badge-pill"><MapPin size={12} /> {memory.location}</span> : null}
            </div>
            <h2 className="memory-modal-title">{memory.title}</h2>
            <p className="memory-modal-meta">
              {memory.date ? (
                <span>
                  <CalendarDays size={13} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                  {new Date(memory.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              ) : null}
              <span>· Created by {memory.createdBy || "You"}</span>
            </p>

            <div className="memory-modal-tags-row">
              {memory.tags?.map((tag) => (
                <span key={tag} className="memory-modal-chip">#{tag}</span>
              ))}
            </div>

            {memory.description ? (
              <>
                <p className="memory-modal-section-label">Story</p>
                <p className="memory-modal-desc">{memory.description}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
