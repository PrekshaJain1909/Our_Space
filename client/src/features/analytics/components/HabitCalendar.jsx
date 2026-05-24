import React, { useMemo, useState } from "react";
import CalendarDateCell from "./CalendarDateCell";
import DateDetailModal from "./DateDetailModal";

function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }

export default function HabitCalendar({ habit, onSave }){
  const today = new Date();
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [modal, setModal] = useState({ open:false, date:null, entry:null });

  const entries = habit.history || [];

  const monthGrid = useMemo(()=>{
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month+1, 0);
    const startDay = first.getDay();
    const totalDays = last.getDate();
    const cells = [];
    // leading blanks
    for(let i=0;i<startDay;i++) cells.push(null);
    for(let d=1; d<=totalDays; d++) cells.push(new Date(year, month, d));
    // trailing blanks to complete weeks
    while(cells.length % 7 !== 0) cells.push(null);
    return cells;
  },[cursor]);

  const findEntry = (dateStr)=> entries.find(e=>e.date===dateStr);

  const openDate = (date)=>{
    if(!date) return;
    const d = date instanceof Date ? date : new Date(date);
    const dateStr = d.toISOString().slice(0,10);
    const entry = findEntry(dateStr) || null;
    setModal({ open:true, date: d, entry });
  };

  const closeModal = ()=> setModal({ open:false, date:null, entry:null });

  const handleSave = (dateStr, updatedEntry)=>{
    const nextHistory = (entries.filter(e=>e.date!==dateStr));
    if(updatedEntry) nextHistory.unshift(updatedEntry);
    onSave(nextHistory);
    closeModal();
  };

  const prevMonth = ()=> setCursor(c=> new Date(c.getFullYear(), c.getMonth()-1, 1));
  const nextMonth = ()=> setCursor(c=> new Date(c.getFullYear(), c.getMonth()+1, 1));

  return (
    <div className="an-card" style={{marginBottom:16}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
        <button onClick={prevMonth} className="an-range-btn">◀</button>
        <div style={{fontWeight:600}}>{cursor.toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
        <button onClick={nextMonth} className="an-range-btn">▶</button>
      </div>

      <div className="calendar-weekdays" style={{marginBottom:8}}>
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div className="calendar-grid">
        {monthGrid.map((d, i)=>{
          const dateStr = d ? d.toISOString().slice(0,10) : null;
          const entry = dateStr ? findEntry(dateStr) : null;
          return (
            <CalendarDateCell key={i} date={d} entry={entry} onClick={()=>openDate(d)} />
          );
        })}
      </div>

      {modal.open && (
        <DateDetailModal
          habit={habit}
          date={modal.date}
          entry={modal.entry}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
