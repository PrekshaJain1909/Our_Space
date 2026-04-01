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
  const { isAuthenticated } = useAuth();
  const { error: showError } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const ctx = useContext(CoupleContext) || {};
  const couple = ctx.couple || {};

  const femaleName = couple.femaleName || "Female";
  const maleName = couple.maleName || "Male";

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loveNotesApi.getAll();
      setNotes(res.data || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async (note) => {
    try {
      const res = await loveNotesApi.create(note);
      setNotes((prev) => [res.data, ...prev]);
    } catch {
      showError("Failed to save note");
    }
  };

  return (
    <div className="love-notes-page">
      <div className="love-notes-inner">

        <LoveNoteForm
          onAdd={handleAddNote}
          femaleName={femaleName}
          maleName={maleName}
          isAuthenticated={isAuthenticated}
        />

        <LoveNotesList
          notes={notes}
          loading={loading}
          femaleName={femaleName}
          maleName={maleName}
        />

        <LoveNotesStats notes={notes} />

      </div>
    </div>
  );
}