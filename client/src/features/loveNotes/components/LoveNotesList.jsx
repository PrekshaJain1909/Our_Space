import LoveNoteCard from "./LoveNoteCard";
import React from "react";

export default function LoveNotesList({ notes, loading }) {
  const safeNotes = Array.isArray(notes) ? notes : [];

  if (loading) return <div className="ln-card">Loading…</div>;

  if (!safeNotes.length) return <div className="ln-card ln-empty">No notes yet</div>;

  return (
    <div className="ln-list">
      {safeNotes.map((note, idx) => (
        <LoveNoteCard key={note._id ?? note.id ?? note.createdAt ?? idx} note={note} />
      ))}
    </div>
  );
}