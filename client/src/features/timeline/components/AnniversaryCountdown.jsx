import React, { useMemo } from "react";
import "./Timeline.css";

function daysBetween(a, b) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utc2 - utc1) / msPerDay);
}

export default function AnniversaryCountdown({
  anniversaryDate,
  onChangeDate,
}) {
  const today = new Date();

  const data = useMemo(() => {
    if (!anniversaryDate) return null;

    const [y, m, d] = anniversaryDate.split("-").map(Number);
    if (!y || !m || !d) return null;

    const original = new Date(y, m - 1, d);

    // Next occurrence using current year
    let next = new Date(today.getFullYear(), m - 1, d);
    if (next < today) {
      next = new Date(today.getFullYear() + 1, m - 1, d);
    }

    const daysLeft = daysBetween(today, next);

    return {
      original,
      next,
      daysLeft,
      nextYear: next.getFullYear(),
    };
  }, [anniversaryDate, today]);

  return (
    <div className="tl-card">
      <div className="tl-header">
        <span className="tl-badge">Anniversary Countdown</span>
        <p className="tl-subtitle">
          Set your main anniversary date and watch the countdown. ⏳💍
        </p>
      </div>

      <div className="tl-field">
        <label>Anniversary date</label>
        <input
          type="date"
          value={anniversaryDate || ""}
          onChange={(e) => onChangeDate && onChangeDate(e.target.value)}
        />
      </div>

      {!anniversaryDate ? (
        <p className="tl-empty">
          Choose your anniversary date to see days left.
        </p>
      ) : !data ? (
        <p className="tl-empty">Invalid date. Please select again.</p>
      ) : (
        <div className="tl-countdown-main">
          <div className="tl-countdown-circle">
            <p className="tl-countdown-days">{data.daysLeft}</p>
            <p className="tl-countdown-label">days left</p>
          </div>

          <div className="tl-countdown-info">
            <p className="tl-countdown-line">
              Next anniversary:{" "}
              <span>
                {data.next.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
            <p className="tl-countdown-line">
              Together since:{" "}
              <span>
                {data.original.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
            <p className="tl-countdown-note">
              Plan a surprise date, gift or trip before your special day comes. 🎁
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
