import React, { useState } from "react";
import PartnerWritePanel from "./PartnerWritePanel";

export default function ReflectionCard({ entry = {}, onSave }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="p-2 bg-white/5 rounded">
        <PartnerWritePanel initial={entry} onSave={(payload)=>{ onSave && onSave(payload); setEditing(false);} } />
      </div>
    );
  }

  return (
    <div className="p-3 rounded bg-white/3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{entry.title || "Untitled"}</div>
          <div className="text-sm text-gray-400">Mood: {entry.mood || "-"}</div>
        </div>
        <div className="text-sm text-gray-300">
          <button onClick={()=>setEditing(true)} className="text-rose-400">Edit</button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-200">{entry.reflection || "No reflection yet."}</p>
      <div className="mt-2 text-xs text-gray-400">Highlights: {entry.highlights || "-"} • Lessons: {entry.lessons || "-"}</div>
    </div>
  );
}
