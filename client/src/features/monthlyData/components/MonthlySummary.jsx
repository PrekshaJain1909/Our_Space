import React from "react";

export default function MonthlySummary(){
  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-900/5 to-violet-800/5">
      <h3 className="font-semibold">Monthly Details</h3>
      <ul className="mt-2 text-sm text-gray-300 space-y-1">
        <li>Total habits tracked: <strong>—</strong></li>
        <li>Habit frequency: <strong>—</strong></li>
        <li>Consistency %: <strong>—</strong></li>
        <li>Improvement %: <strong>—</strong></li>
        <li>Strongest month streak: <strong>—</strong></li>
      </ul>
    </div>
  );
}
