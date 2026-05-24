import React, { useMemo, useState } from "react";
import CalendarDateCell from "./CalendarDateCell";
import DateDetailModal from "./DateDetailModal";

export default function HabitCalendar({ habit, onHabitChange }){
  const [viewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const days = useMemo(()=>{
    // return 1..30/31 simple array of date objects for current month
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const total = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 0).getDate();
    const arr = [];
    for(let d=1; d<=total; d++) arr.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    return arr;
  },[viewDate]);

  const historyMap = useMemo(()=>{
    const map = {};
    (habit.history||[]).forEach(h=>{ map[h.date]=h; });
    return map;
  },[habit]);

  const handleSaveEntry = (dateStr, payload) => {
    const history = habit.history ? [...habit.history] : [];
    const idx = history.findIndex(h=>h.date===dateStr);
    if(idx>=0) history[idx] = { ...history[idx], ...payload };
    else history.unshift({ id:`e-${Date.now()}`, date: dateStr, ...payload });
    const updated = { ...habit, history };
    onHabitChange && onHabitChange(updated);
  };

  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-black/20 to-white/5">
      <div className="mb-3 font-semibold">Monthly Calendar</div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d=>{
          const ds = d.toISOString().slice(0,10);
          const entry = historyMap[ds];
          return <CalendarDateCell key={ds} date={d} entry={entry} onClick={()=>setSelectedDate({date:d, entry})} />;
        })}
      </div>

      {selectedDate && (
        <DateDetailModal date={selectedDate.date} entry={selectedDate.entry} onClose={()=>setSelectedDate(null)} onSave={handleSaveEntry} />
      )}
    </div>
  );
}
