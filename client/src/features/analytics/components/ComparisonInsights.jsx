import React, { useMemo } from 'react';

function countDays(entries){ return Object.keys(entries||{}).length; }

export default function ComparisonInsights({ femaleEntries, maleEntries }){
  const stats = useMemo(()=>{
    const femaleDays = countDays(femaleEntries);
    const maleDays = countDays(maleEntries);
    const sharedDays = Object.keys(femaleEntries||{}).filter(d => (maleEntries||{})[d]).length;
    return { femaleDays, maleDays, sharedDays };
  }, [femaleEntries, maleEntries]);

  return (
    <div className="p-4 bg-white/4 rounded-md">
      <div className="text-rose-200 font-semibold mb-2">Comparison Insights</div>
      <div className="flex space-x-6">
        <div>
          <div className="text-2xl text-rose-50">{stats.femaleDays}</div>
          <div className="text-sm text-rose-200/80">Female days</div>
        </div>
        <div>
          <div className="text-2xl text-rose-50">{stats.maleDays}</div>
          <div className="text-sm text-rose-200/80">Male days</div>
        </div>
        <div>
          <div className="text-2xl text-emerald-200">{stats.sharedDays}</div>
          <div className="text-sm text-rose-200/80">Shared days</div>
        </div>
      </div>
    </div>
  );
}
