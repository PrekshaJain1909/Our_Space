import React from "react";
import ReflectionCard from "./ReflectionCard";

export default function YearlyStoryTab({ entries = [], onUpsert }) {
  const years = buildYears(entries);

  return (
    <div className="yearly space-y-4">
      {years.map((y) => (
        <div key={y.id} className="p-4 rounded-lg bg-gradient-to-r from-violet-800/10 to-indigo-900/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{y.label} Relationship Journey</h3>
            <div className="text-sm text-gray-400">{y.year}</div>
          </div>
          <div className="mt-3">
            <ReflectionCard entry={y.summary || {}} onSave={(upd)=>onUpsert({...y, summary: upd, periodType: 'yearly'})} />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildYears(entries){
  const years = entries.filter(e=>e.periodType==='yearly');
  if(years.length===0){
    return [{id:'y-2026', label:'2026', year:2026, summary:{}}];
  }
  return years.map(y=>({id:y.id, label:y.period || y.year, year:y.year, summary:y.summary || {}}));
}
