import React, { useMemo, useState } from "react";

export default function SharedArchiveTab({ entries = [], onUpsert }) {
  const [query, setQuery] = useState("");
  const [filterPartner, setFilterPartner] = useState("");

  const results = useMemo(() => {
    return entries.filter((e) => {
      if (query && !(JSON.stringify(e).toLowerCase().includes(query.toLowerCase()))) return false;
      if (filterPartner) {
        const a = e.partnerAWriteup?.reflection || "";
        const b = e.partnerBWriteup?.reflection || "";
        if (filterPartner === "A" && !a) return false;
        if (filterPartner === "B" && !b) return false;
      }
      return true;
    });
  }, [entries, query, filterPartner]);

  return (
    <div className="archive space-y-4">
      <div className="flex gap-2">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search keyword or mood" className="input input-sm flex-1" />
        <select value={filterPartner} onChange={(e)=>setFilterPartner(e.target.value)} className="input input-sm">
          <option value="">All partners</option>
          <option value="A">Female</option>
          <option value="B">Male</option>
        </select>
      </div>
      <div className="grid gap-3">
        {results.map((r)=> (
          <div key={r.id} className="p-3 rounded bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.period} {r.year}</div>
                <div className="text-sm text-gray-400">{r.periodType}</div>
              </div>
              <div className="text-sm text-gray-400">{new Date(r.createdAt||Date.now()).toDateString()}</div>
            </div>
            <div className="mt-2 text-sm text-gray-200">
              <div><strong>Female:</strong> {r.partnerAWriteup?.reflection}</div>
              <div className="mt-1"><strong>Male:</strong> {r.partnerBWriteup?.reflection}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
