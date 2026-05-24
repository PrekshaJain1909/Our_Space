import React, { useState } from "react";

export default function MonthlyCalendar(){
  const [viewDate, setViewDate] = useState(new Date());

  const prevMonth = () => setViewDate(d=> new Date(d.getFullYear(), d.getMonth()-1, 1));
  const nextMonth = () => setViewDate(d=> new Date(d.getFullYear(), d.getMonth()+1, 1));

  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-black/20 to-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{viewDate.toLocaleString('default',{month:'long', year:'numeric'})}</div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="btn btn-sm">Prev</button>
          <button onClick={nextMonth} className="btn btn-sm">Next</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({length:42}).map((_,i)=> (
          <div key={i} className="h-20 p-1 rounded bg-white/3">{/* date cell clickable */}</div>
        ))}
      </div>
    </div>
  );
}
