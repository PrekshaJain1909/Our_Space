import React from "react";
import Card from "../../../components/ui/Card.jsx";
import Tag from "../../../components/ui/Tag.jsx";

export default function CouplePhotoCard({
  photoUrl,
  coupleName,
  caption,
  height = "240px",
  glow = true,
  className = "",
}) {
  return (
    <>
      {/* 🔹 Internal CSS */}
      <style>{`
        .couple-photo-card {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
        }

        .couple-photo {
          position: relative;
          width: 100%;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .couple-photo-glow {
          box-shadow: 0 0 45px rgba(236, 72, 153, 0.4);
        }

        .couple-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .couple-photo-emoji {
          font-size: 48px;
          opacity: 0.6;
        }

        .couple-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.65),
            rgba(0, 0, 0, 0.25),
            transparent
          );
        }

        .couple-photo-text {
          position: absolute;
          bottom: 12px;
          left: 16px;
          right: 16px;
          color: #ffffff;
          z-index: 2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
        }

        .couple-photo-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }

        .couple-photo-caption {
          font-size: 11px;
        }
      `}</style>

      <Card className={`couple-photo-card ${className}`}>
        {/* Photo */}
        <div
          className={`couple-photo ${glow ? "couple-photo-glow" : ""}`}
          style={{ height }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Couple" />
          ) : (
            <span className="couple-photo-emoji">💑</span>
          )}

          {/* Gradient overlay */}
          <div className="couple-photo-overlay" />
        </div>

        {/* Text Overlay */}
        <div className="couple-photo-text">
          {coupleName && (
            <h3 className="couple-photo-name">{coupleName}</h3>
          )}

          {caption && (
            <Tag variant="glass" className="couple-photo-caption">
              {caption}
            </Tag>
          )}
        </div>
      </Card>
    </>
  );
}
