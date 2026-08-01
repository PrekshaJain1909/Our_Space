import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import useToast from "../../../hooks/useToast";
import useAuth from "../../../hooks/useAuth";
import LoveNoteForm from "../components/LoveNoteForm";
import LoveNotesList from "../components/LoveNotesList";
import LoveNotesStats from "../components/LoveNotesStats";
import "../components/LoveNotes.css";
import loveNotesApi from "../../../api/loveNotesApi";
import CoupleContext from "../../../context/CoupleContext.jsx";

const ROMANTIC_WORDS = [
  "love",
  "jaan",
  "baby",
  "soulmate",
  "forever",
  "darling",
  "sweetheart",
  "princess",
  "handsome",
  "beautiful",
];

export default function LoveNotesPage() {
  const { isAuthenticated } = useAuth();
  const { error: showError } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const ctx = useContext(CoupleContext) || {};
  const couple = ctx.couple || {};

  const femaleName = couple?.partnerA?.name || couple?.femaleName || "Female";
  const maleName = couple?.partnerB?.name || couple?.maleName || "Male";

  const femaleNameKey = femaleName.toLowerCase().trim();
  const maleNameKey = maleName.toLowerCase().trim();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loveNotesApi.getAll();
      setNotes(res.data?.data || []);
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
      const newNote = res.data?.data || res.data || {};
      setNotes((prev) => [newNote, ...prev]);
    } catch {
      showError("Failed to save note");
    }
  };

  const handleFilterChange = (event) => {
    setAuthorFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredNotes = useMemo(() => {
    const list = Array.isArray(notes) ? notes : [];

    const filtered = list.filter((note) => {
      if (authorFilter === "male") {
        return note.from?.toLowerCase?.().trim() === maleNameKey;
      }
      if (authorFilter === "female") {
        return note.from?.toLowerCase?.().trim() === femaleNameKey;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime() || 0;
      const bDate = new Date(b.createdAt).getTime() || 0;
      return sortOrder === "oldest" ? aDate - bDate : bDate - aDate;
    });
  }, [notes, authorFilter, sortOrder, femaleNameKey, maleNameKey]);

  const noteStats = useMemo(() => {
    const list = Array.isArray(notes) ? notes : [];

    const longest = list.reduce((max, note) => {
      return Math.max(max, note.content?.length || 0);
    }, 0);

    const counts = list.reduce((acc, note) => {
      const content = note.content || "";
      const normalized = content.toLowerCase();
      ROMANTIC_WORDS.forEach((word) => {
        const occurrences = (normalized.match(new RegExp(`\\b${word}\\b`, "gi")) || []).length;
        if (occurrences) {
          acc[word] = (acc[word] || 0) + occurrences;
        }
      });
      return acc;
    }, {});

    const topWords = Object.entries(counts)
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return { longest, topWords };
  }, [notes]);

  return (
    <div className="love-notes-page">
      <div className="love-notes-inner">

        <LoveNoteForm
          onAdd={handleAddNote}
          femaleName={femaleName}
          maleName={maleName}
          isAuthenticated={isAuthenticated}
          allowSelectWhenAuthenticated={true}
        />

        <div className="ln-card ln-filters-card">


          <div className="ln-filters">
            <div className="ln-filter-field">
              <label>Author</label>
              <select value={authorFilter} onChange={handleFilterChange}>
                <option value="all">All Notes</option>
                <option value="male">{maleName}</option>
                <option value="female">{femaleName}</option>
              </select>
            </div>

            <div className="ln-filter-field">
              <label>Sort</label>
              <select value={sortOrder} onChange={handleSortChange}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        <LoveNotesList
          notes={filteredNotes}
          loading={loading}
          femaleName={femaleName}
          maleName={maleName}
        />

        <LoveNotesStats
          notes={notes}
          longest={noteStats.longest}
          topWords={noteStats.topWords}
        />

      </div>
    </div>
  );
}