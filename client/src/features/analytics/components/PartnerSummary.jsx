import React, { useMemo } from 'react';

function computeStats(entries){
  const days = Object.keys(entries).length;
  let good=0, total=0, streak=0;
  Object.values(entries).forEach(list=>{ list.forEach(e=>{ total++; if (e.status==='Good') good++; }); });
  const improvement = total ? Math.round((good/total)*100) : 0;
  return { totalEntries: total, goodDays: good, streak, improvement };
}

export default function PartnerSummary({ partner, entries }){
  const stats = useMemo(()=>computeStats(entries||{}), [entries]);
  return (
    <div className="mt-3 p-3 bg-white/3 rounded-lg">
      <div className="text-sm text-rose-200">Summary for {partner}</div>
      <div className="mt-2 flex space-x-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-rose-50">{stats.totalEntries}</div>
          <div className="text-xs text-rose-200/80">Total entries</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-emerald-200">{stats.goodDays}</div>
          <div className="text-xs text-rose-200/80">Good days</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-rose-50">{stats.improvement}%</div>
          <div className="text-xs text-rose-200/80">Improvement</div>
        </div>
      </div>
    </div>
  );
}
