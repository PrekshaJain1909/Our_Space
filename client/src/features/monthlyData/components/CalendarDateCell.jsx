import React from "react";

export default function CalendarDateCell({ date, entry, onClick }){
  const dateNum = date.getDate();
  const status = entry?.status || null; // 'good'|'moderate'|'bad'
  const color = status==='good'? 'bg-green-500': status==='moderate'? 'bg-yellow-400' : status==='bad'? 'bg-red-500' : 'bg-transparent';

  return (
    <div onClick={onClick} className="h-24 p-2 rounded border border-white/5 cursor-pointer relative">
      <div className="text-xs">{dateNum}</div>
      {status && <div className={`w-3 h-3 rounded-full ${color} absolute top-2 right-2`} />}
      {entry && (
        <div className="mt-6 text-xs text-gray-300">
          <div className="font-semibold">{entry.count}</div>
          <div className="truncate">{(entry.note||"").slice(0,20)}</div>
        </div>
      )}
    </div>
  );
}
