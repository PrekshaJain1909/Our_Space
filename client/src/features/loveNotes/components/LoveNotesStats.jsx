export default function LoveNotesStats({ notes, longest, topWords }) {
  const safeNotes = Array.isArray(notes) ? notes : [];

  const total = safeNotes.length;
  const longestNote = typeof longest === "number" ? longest : safeNotes.reduce((max, n) => Math.max(max, n.content?.length || 0), 0);
  const wordList = Array.isArray(topWords) && topWords.length ? topWords : [];

  return (
    <div className="ln-stats-grid">

      <div className="ln-stat-box">
        <div className="ln-stat-label">TOTAL NOTES</div>
        <div className="ln-stat-value">{total}</div>
        <div className="ln-stat-sub">Moments captured forever</div>
      </div>

      <div className="ln-stat-box">
        <div className="ln-stat-label">LONGEST NOTE</div>
        <div className="ln-stat-value">{longestNote}</div>
        <div className="ln-stat-sub">Characters of pure affection</div>
      </div>

      <div className="ln-stat-box">
        <div className="ln-stat-label">ROMANTIC WORDS</div>
        <div className="ln-stat-value ln-word-list">
          {wordList.length
            ? wordList.map((item) => `${item.word} ${item.count}`).join(" • ")
            : "None yet"}
        </div>
        <div className="ln-stat-sub">Top romantic terms across all notes</div>
      </div>

    </div>
  );
}