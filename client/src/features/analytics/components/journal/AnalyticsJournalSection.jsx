import React, { useMemo, useState } from "react";
import MonthlyJournalTab from "./MonthlyJournalTab";
import QuarterlyReflectionTab from "./QuarterlyReflectionTab";
import YearlyStoryTab from "./YearlyStoryTab";
import SharedArchiveTab from "./SharedArchiveTab";
import JournalTimeline from "./JournalTimeline";

export default function AnalyticsJournalSection({ defaultTab = "monthly" }) {
  const [tab, setTab] = useState(defaultTab);

  const [entries, setEntries] = useState(() => {
    // sample mock data — frontend-only
    return [
      {
        id: "may-2026",
        periodType: "monthly",
        period: "May",
        year: 2026,
        partnerAWriteup: { title: "May reflection", reflection: "Growing closer.", mood: "happy", highlights: "Date nights", challenges: "Busy schedules", lessons: "Listen more" },
        partnerBWriteup: { title: "May reflection", reflection: "Grateful.", mood: "content", highlights: "Trip", challenges: "Work", lessons: "Be present" },
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const stats = useMemo(() => {
    const total = entries.length;
    const months = entries.filter((e) => e.periodType === "monthly").length;
    const quarters = entries.filter((e) => e.periodType === "quarterly").length;
    const years = entries.filter((e) => e.periodType === "yearly").length;
    const streak = Math.min(months, 12);
    return { total, months, quarters, years, streak };
  }, [entries]);

  const handleUpsert = (entry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((p) => p.id === entry.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [entry, ...prev];
    });
  };

  return (
    <div className="journal-wrapper p-4">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">Relationship Journal Analytics</h2>
        <p className="text-sm text-gray-400">Track your growth, reflections, and milestones together.</p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 rounded-lg p-3 text-white">
          <div className="text-xs">Total Writings</div>
          <div className="text-xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-white">
          <div className="text-xs">Months Completed</div>
          <div className="text-xl font-bold">{stats.months}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-white">
          <div className="text-xs">Quarterly Reflections</div>
          <div className="text-xl font-bold">{stats.quarters}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-white">
          <div className="text-xs">Yearly Stories</div>
          <div className="text-xl font-bold">{stats.years}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-white">
          <div className="text-xs">Consistency Streak</div>
          <div className="text-xl font-bold">{stats.streak} mo</div>
        </div>
      </div>

      {/* Journal internal tabs */}
      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-1 rounded ${tab === "monthly" ? "bg-rose-500 text-white" : "bg-white/5 text-white"}`} onClick={() => setTab("monthly")}>Monthly</button>
        <button className={`px-3 py-1 rounded ${tab === "quarterly" ? "bg-rose-500 text-white" : "bg-white/5 text-white"}`} onClick={() => setTab("quarterly")}>Quarterly</button>
        <button className={`px-3 py-1 rounded ${tab === "yearly" ? "bg-rose-500 text-white" : "bg-white/5 text-white"}`} onClick={() => setTab("yearly")}>Yearly</button>
        <button className={`px-3 py-1 rounded ${tab === "archive" ? "bg-rose-500 text-white" : "bg-white/5 text-white"}`} onClick={() => setTab("archive")}>Shared Archive</button>
        <div className="ml-auto">
          <JournalTimeline entries={entries} onSelect={(id) => { const e = entries.find(x=>x.id===id); if (e) setTab(e.periodType); }} />
        </div>
      </div>

      <div>
        {tab === "monthly" && <MonthlyJournalTab entries={entries} onUpsert={handleUpsert} />}
        {tab === "quarterly" && <QuarterlyReflectionTab entries={entries} onUpsert={handleUpsert} />}
        {tab === "yearly" && <YearlyStoryTab entries={entries} onUpsert={handleUpsert} />}
        {tab === "archive" && <SharedArchiveTab entries={entries} onUpsert={handleUpsert} />}
      </div>
    </div>
  );
}
