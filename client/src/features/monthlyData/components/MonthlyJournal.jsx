import React from "react";

export default function MonthlyJournal(){
  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-rose-800/5 to-pink-900/5">
      <h3 className="font-semibold mb-2">Monthly Journal</h3>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="p-3 rounded bg-white/3">
          <h4 className="text-sm font-medium">Female Partner</h4>
          <input className="input input-sm mt-2" placeholder="Monthly Title" />
          <textarea className="input input-sm mt-2" rows={4} placeholder="Reflection" />
        </div>
        <div className="p-3 rounded bg-white/3">
          <h4 className="text-sm font-medium">Male Partner</h4>
          <input className="input input-sm mt-2" placeholder="Monthly Title" />
          <textarea className="input input-sm mt-2" rows={4} placeholder="Reflection" />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button className="btn btn-primary">Save Monthly Reflections</button>
      </div>
    </div>
  );
}
