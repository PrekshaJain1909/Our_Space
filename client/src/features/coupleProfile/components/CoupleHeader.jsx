import React, { useContext } from "react";
import CoupleContext from "../../../context/CoupleContext.jsx";
import Tag from "../../../components/ui/Tag.jsx";
import Button from "../../../components/ui/Button.jsx";
import { relationshipAge, daysUntil } from "../../../utils/dateUtils.js";
import { useNavigate } from "react-router-dom";

export default function CoupleHeader({ showEdit = true, className = "" }) {
  const { couple, refreshing } = useContext(CoupleContext);
  const navigate = useNavigate();

  if (!couple) return null;

  const { coupleName, photoUrl, startDate, anniversaryDate } = couple;

  let togetherFor = null;
  if (startDate) {
    const age = relationshipAge(startDate);
    togetherFor = `${age.years}y ${age.months}m ${age.days}d`;
  }

  let anniversaryLabel = null;
  if (anniversaryDate) {
    const days = daysUntil(anniversaryDate);
    if (days === 0) anniversaryLabel = "🎉 Anniversary Today!";
    else if (days > 0) anniversaryLabel = `${days} days to anniversary`;
    else anniversaryLabel = `${Math.abs(days)} days since anniversary`;
  }

  return (
    <>
      {/* 🔹 Internal CSS */}
      <style>{`
  .couple-header {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 14px 0 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.22);
    animation: coupleFadeIn 0.5s ease;
  }

  /* Avatar */
  .couple-header-avatar {
    height: 58px;
    width: 58px;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      rgba(15, 23, 42, 0.8),
      rgba(30, 41, 59, 0.6)
    );
    border: 1px solid rgba(236, 72, 153, 0.55);
    box-shadow:
      0 0 24px rgba(236, 72, 153, 0.35),
      inset 0 0 18px rgba(236, 72, 153, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  }

  .couple-header-avatar:hover {
    transform: scale(1.05);
  }

  .couple-header-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .couple-avatar-emoji {
    font-size: 24px;
    opacity: 0.9;
  }

  /* Info */
  .couple-header-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .couple-header-name {
    font-size: 19px;
    font-weight: 600;
    color: #f8fafc;
    letter-spacing: 0.3px;
    text-shadow: 0 0 10px rgba(236, 72, 153, 0.25);
  }

  .couple-header-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  /* Animation */
  @keyframes coupleFadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>


      <div className={`couple-header ${className}`}>
        {/* Photo */}
        <div className="couple-header-avatar">
          {photoUrl ? (
            <img src={photoUrl} alt="Couple" />
          ) : (
            <span className="couple-avatar-emoji">💑</span>
          )}
        </div>

        {/* Info */}
        <div className="couple-header-info">
          <h2 className="couple-header-name">{coupleName}</h2>

          <div className="couple-header-tags">
            {togetherFor && (
              <Tag variant="pink" icon="⏳">
                {togetherFor} together
              </Tag>
            )}
            {anniversaryLabel && (
              <Tag variant="success" icon="🎉">
                {anniversaryLabel}
              </Tag>
            )}
            {!togetherFor && !anniversaryLabel && (
              <Tag variant="default" icon="✨">
                Add dates to see stats
              </Tag>
            )}
          </div>
        </div>

        {/* Edit button */}
        {showEdit && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon="⚙️"
            onClick={() => navigate("/couple/profile")}
            disabled={refreshing}
          >
            Edit
          </Button>
        )}
      </div>
    </>
  );
}
