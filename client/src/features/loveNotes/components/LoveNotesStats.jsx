export default function LoveNotesStats({ notes }) {

  const total = notes.length;

  const longest =
    notes.reduce(
      (max, n) => Math.max(max, n.content?.length || 0),
      0
    ) || 0;

  return (
    <div className="ln-stats-grid">

      <div className="ln-stat-box">
        <div className="ln-stat-label">TOTAL NOTES</div>
        <div className="ln-stat-value">{total}</div>
        <div className="ln-stat-sub">Moments captured forever</div>
      </div>

      <div className="ln-stat-box">
        <div className="ln-stat-label">LONGEST NOTE</div>
        <div className="ln-stat-value">{longest}</div>
        <div className="ln-stat-sub">Characters of pure affection</div>
      </div>

      <div className="ln-stat-box">
        <div className="ln-stat-label">ROMANTIC WORDS</div>
        <div className="ln-stat-value">Love • Jaan • Soulmate</div>
      </div>

    </div>
  );
}