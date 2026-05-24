import React from "react";
import ReflectionCard from "./ReflectionCard";

export default function QuarterlyReflectionTab({ entries = [], onUpsert }) {
  const quarters = buildQuarters(entries);

  return (
    <div className="quarterly space-y-4">
      {quarters.map((q) => (
        <div key={q.id} className="p-4 rounded-lg bg-gradient-to-r from-rose-700/10 to-pink-900/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{q.label} {q.year}</h3>
            <div className="text-sm text-gray-400">{q.period}</div>
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-gray-300">Partner A Reflection</h4>
              <ReflectionCard entry={q.partnerA || {}} onSave={(upd)=>onUpsert({...q, partnerA: upd, periodType: 'quarterly'})} />
            </div>
            <div>
              <h4 className="text-sm text-gray-300">Partner B Reflection</h4>
              <ReflectionCard entry={q.partnerB || {}} onSave={(upd)=>onUpsert({...q, partnerB: upd, periodType: 'quarterly'})} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildQuarters(entries){
  // simple grouping: if no quarters, provide a placeholder
  const quarters = entries.filter(e=>e.periodType==='quarterly');
  if(quarters.length===0){
    return [{id:'q1-2026', label:'Jan – Mar', year:2026, period:'Q1', partnerA:{}, partnerB:{}}];
  }
  return quarters.map(q=>({id:q.id, label:q.period, year:q.year, period:q.period, partnerA:q.partnerAWriteup, partnerB:q.partnerBWriteup}));
}
