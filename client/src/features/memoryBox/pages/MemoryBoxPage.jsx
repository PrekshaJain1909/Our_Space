import React, { useMemo, useState } from "react";
import "../MemoryBox.css";

import MemoryUploadForm from "../components/MemoryUploadForm";
import MemoryGrid from "../components/MemoryGrid";
import MemoryModal from "../components/MemoryModal";

export default function MemoryBoxPage() {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const handleAddMemory = (memory) => {
    setMemories((prev) => [memory, ...prev]);
  };

  const years = useMemo(() => {
    const set = new Set();
    memories.forEach((m) => {
      if (m.date) set.add(m.date.slice(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const s = search.trim().toLowerCase();
      const bySearch = s
        ? m.title.toLowerCase().includes(s) ||
          (m.description || "").toLowerCase().includes(s) ||
          (m.location || "").toLowerCase().includes(s) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(s))
        : true;

      const byMood = moodFilter === "all" ? true : m.mood === moodFilter;
      const byYear =
        yearFilter === "all" ? true : m.date?.slice(0, 4) === yearFilter;

      return bySearch && byMood && byYear;
    });
  }, [memories, search, moodFilter, yearFilter]);

  return (
    <div className="memory-wrapper">
      <div className="memory-overlay" />

      <div className="memory-inner">
        {/* Header */}
        <p className="memory-badge">MemoryBox</p>
        <header className="memory-header">
          
          <h1 className="memory-title">Your Shared Memory Box</h1>
          <p className="memory-subtitle">
            Save photos with tiny stories, moods and dates — a soft archive of your love. ✨
          </p>
        </header>

        <section className="memory-layout">
          {/* Left: upload form + filters */}
          <div className="memory-left">
            <div className="memory-block">
              <MemoryUploadForm onAddMemory={handleAddMemory} />
            </div>

            <div className="memory-block">
              <div className="mb-card">
                <div className="mb-header">
                  <span className="mb-badge">Filters</span>
                  <p className="mb-subtitle">
                    Find moments by mood, year or a word in their story.
                  </p>
                </div>

                <div className="mb-filters">
                  <div className="mb-field">
                    <label>Search</label>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Caption, place or tag…"
                    />
                  </div>

                  <div className="mb-row">
                    <div className="mb-field">
                      <label>Mood</label>
                      <select
                        value={moodFilter}
                        onChange={(e) => setMoodFilter(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="happy">Happy</option>
                        <option value="romantic">Romantic</option>
                        <option value="silly">Silly</option>
                        <option value="calm">Calm</option>
                        <option value="emotional">Emotional</option>
                      </select>
                    </div>

                    <div className="mb-field">
                      <label>Year</label>
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                      >
                        <option value="all">All</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: grid */}
          <div className="memory-right">
            <MemoryGrid
              memories={filteredMemories}
              onOpenMemory={setSelectedMemory}
            />
          </div>
        </section>

        {/* Modal */}
        {selectedMemory && (
          <MemoryModal
            memory={selectedMemory}
            onClose={() => setSelectedMemory(null)}
          />
        )}
      </div>
    </div>
  );
}
