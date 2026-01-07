
import React, { useState, useEffect, useContext, useCallback } from "react";
import useToast from "../../../hooks/useToast";
import useAuth from "../../../hooks/useAuth";
import LoveNoteForm from "../components/LoveNoteForm";
import LoveNotesList from "../components/LoveNotesList";
import LoveNotesStats from "../components/LoveNotesStats";
import "../components/LoveNotes.css";
import loveNotesApi from "../../../api/loveNotesApi";
import CoupleContext from "../../../context/CoupleContext.jsx";

export default function LoveNotesPage() {
  const { user, isAuthenticated } = useAuth();
  const { error: showError } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const ctx = useContext(CoupleContext) || {};
  const couple = ctx.couple || {};
  const femaleName = couple.femaleName || "Female";
  const maleName = couple.maleName || "Male";

  function capitalize(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function replaceYouPartner(text) {
    if (!text) return text;
    return text
      .replace(/\byou\b/gi, (m) => (m[0] === m[0].toUpperCase() ? capitalize(femaleName) : femaleName))
      .replace(/\bpartner\b/gi, (m) => (m[0] === m[0].toUpperCase() ? capitalize(maleName) : maleName));
  }

  // Fetch notes from backend
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loveNotesApi.getAll();
      setNotes(res.data || []);
    } catch (e) {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Add note to backend
  const handleAddNote = async (note) => {
    try {
      const payload = {
        from: note.from,
        to: note.to,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
      };
      const res = await loveNotesApi.create(payload);
      setNotes((prev) => [res.data, ...prev]);
    } catch (e) {
      showError("Failed to save note. Please try again.");
    }
  };

  return (
    <div className="love-notes-page">
      <div className="love-notes-inner">
        
        
        <LoveNoteForm
          onAdd={handleAddNote}
          femaleName={femaleName}
          maleName={maleName}
          replaceYouPartner={replaceYouPartner}
          isAuthenticated={isAuthenticated}
        />
        <LoveNotesList
          notes={notes}
          loading={loading}
          replaceYouPartner={replaceYouPartner}
          femaleName={femaleName}
          maleName={maleName}
          isAuthenticated={isAuthenticated}
        />
        <LoveNotesStats notes={notes} replaceYouPartner={replaceYouPartner} />
      </div>
    </div>
  );
}
