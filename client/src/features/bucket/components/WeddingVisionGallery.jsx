import React from "react";
import "./Bucket.css";

export default function WeddingVisionGallery({ items = [], onDelete }) {
  if (items.length === 0) {
    return (
      <div className="bk-card">
        <div className="bk-header">
          <span className="bk-badge">Wedding Vision Gallery</span>
          <p className="bk-subtitle">
            Start adding ideas for dresses, decor, locations and playlists. ✨
          </p>
        </div>
        <p className="bk-empty">No vision items yet. Add at least one dream to begin 🤍</p>
      </div>
    );
  }

  return (
    <div className="bk-card">
      <div className="bk-header">
        <span className="bk-badge">Wedding Vision Gallery</span>
        <p className="bk-subtitle">
          A mini mood board of everything you want your big day to feel like. 🌸
        </p>
      </div>

      <div className="bk-vision-grid">
        {items.map((item) => {
          const imageUrl = item.image || item.imageUrl;
          return (
            <article key={item._id || item.id} className="bk-vision-card">
              {imageUrl && (
                <div className="bk-vision-image-wrap">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="bk-vision-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="bk-vision-body">
                <p className={`bk-chip bk-chip-type-${item.type}`}>
                  {item.type}
                </p>
                <h3 className="bk-vision-title">{item.title}</h3>
                {item.description && (
                  <p className="bk-vision-desc">{item.description}</p>
                )}
                {item.referenceLink && (
                  <a
                    className="bk-vision-link"
                    href={item.referenceLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open reference ↗
                  </a>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="bk-vision-delete-btn"
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
