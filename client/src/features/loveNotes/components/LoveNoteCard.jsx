import LoveNoteCard from "./LoveNoteCard";

export default function LoveNotesList({ notes, loading }) {

  if (loading)
    return <div className="ln-card">Loading…</div>;

  if (!notes.length)
    return <div className="ln-card ln-empty">No notes yet</div>;

  return (
    <div className="ln-list">

      {notes.map((note) => (
        <LoveNoteCard key={note._id} note={note} />
      ))}

    </div>
  );
}