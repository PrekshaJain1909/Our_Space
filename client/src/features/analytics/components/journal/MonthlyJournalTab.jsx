import React, { useState } from "react";
import PartnerWritePanel from "./PartnerWritePanel";
import ReflectionCard from "./ReflectionCard";

export default function MonthlyJournalTab({ entries = [], onUpsert }) {
  const months = groupByMonth(entries);

  return (
    <div className="monthly-tab space-y-4">
      {months.map((m) => (
        <div key={m.id} className="bg-gradient-to-r from-black/20 to-white/5 p-4 rounded-lg">
          <div className="flex items-start gap-4">
            <h3 className="text-lg font-semibold">{m.label} {m.year}</h3>
            <div className="ml-auto text-sm text-gray-400">{m.createdAt}</div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-gray-300">Female Partner</h4>
              <ReflectionCard entry={m.partnerAWriteup} onSave={(upd)=>onUpsert({...m, partnerAWriteup: upd})} />
            </div>
            <div>
              <h4 className="text-sm text-gray-300">Male Partner</h4>
              <ReflectionCard entry={m.partnerBWriteup} onSave={(upd)=>onUpsert({...m, partnerBWriteup: upd})} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByMonth(entries) {
  // filter monthly entries and return simple month list
  const monthly = entries.filter((e) => e.periodType === "monthly");
  if (monthly.length === 0) {
    const now = new Date();
    return [
      { id: `sample-${now.getMonth()}-${now.getFullYear()}`, label: now.toLocaleString("default", { month: "long" }), year: now.getFullYear(), partnerAWriteup: {}, partnerBWriteup: {}, createdAt: now.toDateString() },
    ];
  }
  return monthly.map((m)=>({
    id: m.id,
    label: m.period,
    year: m.year,
    partnerAWriteup: m.partnerAWriteup || {},
    partnerBWriteup: m.partnerBWriteup || {},
    createdAt: m.createdAt && new Date(m.createdAt).toDateString(),
  }));
}
