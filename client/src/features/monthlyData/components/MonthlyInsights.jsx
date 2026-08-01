import React from "react";

export default function MonthlyInsights(){
  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-rose-700/5 to-pink-900/5">
      <h3 className="font-semibold">Monthly Insights</h3>
      <div className="mt-2 space-y-2 text-sm">
        <div className="p-2 rounded bg-white/3">Smoking reduced by 22%</div>
        <div className="p-2 rounded bg-white/3">Late replies improved this month</div>
        <div className="p-2 rounded bg-white/3">Consistency strongest in week 3</div>
      </div>
    </div>
  );
}
