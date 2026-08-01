import React from "react";

export default function JournalTimeline({ entries = [], onSelect }) {
  // simple inline timeline visualization
  return (
    <div className="journal-timeline text-sm text-gray-300">
      <div className="flex items-center gap-2">
        <div className="text-xs">Timeline:</div>
        {entries.slice(0,5).map((e)=> (
          <button key={e.id} onClick={()=>onSelect && onSelect(e.id)} className="px-2 py-1 rounded bg-white/5">{e.period || e.label || e.year}</button>
        ))}
      </div>
    </div>
  );
}
