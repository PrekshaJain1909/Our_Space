import React from "react";

export default function LoveNoteCard({ note }) {
  const id = note?._id || note?.id || note?.createdAt || Math.random().toString(36).slice(2);
  const title = note?.title || note?.name || "Untitled";
  const content = note?.content || note?.message || "";
  const from = note?.from || "";
  const to = note?.to || "";
  const createdAt = note?.createdAt ? new Date(note.createdAt) : null;

  return (
    <div className="ln-note-card" data-id={id}>
      <div className="ln-note-top">
        <div className="ln-note-left">
          <div className="ln-note-title">{title}</div>
          <div className="ln-note-meta">
            <span className="ln-note-to">{from} → {to}</span>
          </div>
        </div>
        <div className="ln-note-right">
          <div className="ln-note-date">{createdAt ? createdAt.toLocaleDateString() : ""}</div>
        </div>
      </div>
      <div className="ln-note-content">{content}</div>
    </div>
  );
}