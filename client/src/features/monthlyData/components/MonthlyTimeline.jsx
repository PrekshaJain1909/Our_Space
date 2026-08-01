import React from "react";

export default function MonthlyTimeline(){
  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-black/20 to-white/5">
      <h3 className="font-semibold mb-2">Monthly Timeline</h3>
      <div className="space-y-2 text-sm text-gray-300">
        <div className="p-2 bg-white/3 rounded">2026-05-12 • Smoking • 2 cigarettes</div>
        <div className="p-2 bg-white/3 rounded">2026-05-10 • Late reply • 1 instance</div>
      </div>
    </div>
  );
}
