import React, { useContext } from "react";

import Card from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import Tag from "../../../components/ui/Tag.jsx";
import EmptyState from "../../../components/common/EmptyState.jsx";
import Spinner from "../../../components/ui/Spinner.jsx";
import { formatDate, daysUntil } from "../../../utils/dateUtils.js";
import CoupleContext from "../../../context/CoupleContext.jsx";

function getCountdownLabel(dateStr) {
  const diff = daysUntil(dateStr);
  if (diff === 0) return "Today 🎉";
  if (diff === 1) return "Tomorrow";
  if (diff > 1) return `In ${diff} days`;
  if (diff === -1) return "Yesterday";
  return `Passed ${Math.abs(diff)} days ago`;
}

function getTypeLabel(type) {
  const map = {
    anniversary: "Anniversary",
    birthday: "Birthday",
    custom: "Special Day",
  };
  return map[type] || "Special";
}

function getTypeVariant(type) {
  if (type === "anniversary") return "pink";
  if (type === "birthday") return "success";
  return "warning";
}

export default function SpecialDatesList({
  reminders = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}) {
  const normalized = [...reminders].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const hasData = normalized.length > 0;

  const ctx = useContext(CoupleContext) || {};
  const couple = ctx.couple || {};
  const femaleName = couple.femaleName || "Female";
  const maleName = couple.maleName || "Male";

  function replaceYouPartner(text) {
    if (!text) return text;
    return text
      .replace(/\byou\b/gi, femaleName)
      .replace(/\bpartner\b/gi, maleName);
  }

  return (
    <>
      {/* 🔹 Internal CSS */}
      <style>{`
        .special-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .special-footer-text {
          font-size: 11px;
          color: #9ca3af;
        }

        .special-loading {
          display: flex;
          justify-content: center;
          padding: 24px 0;
        }

        .special-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .special-item {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 14px;
          transition: transform 0.15s ease, background 0.2s ease;
        }

        .special-item:hover {
          background: rgba(15, 23, 42, 0.75);
          transform: translateY(-2px);
        }

        .special-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .special-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .special-title {
          font-size: 14px;
          font-weight: 600;
          color: #f8fafc;
        }

        .special-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #cbd5f5;
        }

        .special-channels {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .special-notes {
          font-size: 12px;
          color: #e5e7eb;
          line-height: 1.4;
          margin-top: 2px;
        }

        .special-actions {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        @media (max-width: 640px) {
          .special-item {
            flex-direction: column;
          }

          .special-actions {
            align-self: flex-end;
          }
        }
      `}</style>

      <Card
        title="Special Dates & Reminders"
        subtitle={replaceYouPartner(
          "Anniversaries, birthdays, and custom days you never want to forget."
        )}
        footer={
          <div className="special-footer">
            <p className="special-footer-text">
              Reminders help with countdowns, timeline highlights, and surprises.
            </p>
            {onAdd && (
              <Button size="sm" leftIcon="➕" onClick={onAdd}>
                Add special date
              </Button>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="special-loading">
            <Spinner size="lg" />
          </div>
        ) : !hasData ? (
          <EmptyState
            icon="📅"
            title="No special dates yet"
            subtitle={replaceYouPartner(
              "Add anniversaries, birthdays, or custom dates and we’ll keep count for you."
            )}
            actions={
              onAdd && (
                <Button leftIcon="➕" onClick={onAdd}>
                  Add first special date
                </Button>
              )
            }
          />
        ) : (
          <div className="special-list">
            {normalized.map((reminder) => {
              const {
                _id,
                id,
                label,
                date,
                type,
                channels = [],
                notes,
              } = reminder;

              const key = _id || id;

              return (
                <div key={key} className="special-item">
                  {/* Left */}
                  <div className="special-info">
                    <div className="special-title-row">
                      <span className="special-title">{label}</span>
                      <Tag variant={getTypeVariant(type)} icon="⭐">
                        {getTypeLabel(type)}
                      </Tag>
                    </div>

                    <div className="special-meta">
                      <span>
                        {formatDate(date, "DD MMM YYYY")} •{" "}
                        {getCountdownLabel(date)}
                      </span>

                      {channels.length > 0 && (
                        <div className="special-channels">
                          {channels.map((ch) => (
                            <Tag key={ch} variant="default" small>
                              {ch.toUpperCase()}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>

                    {notes && (
                      <p className="special-notes">{notes}</p>
                    )}
                  </div>

                  {/* Right */}
                  <div className="special-actions">
                    {onEdit && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => onEdit(reminder)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => onDelete(key)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
