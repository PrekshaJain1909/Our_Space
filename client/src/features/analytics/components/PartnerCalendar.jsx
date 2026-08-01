import React, { useMemo, useState } from 'react';
import CalendarCell from './CalendarCell';
import DailyEntryModal from './DailyEntryModal';

function startOfMonth(year, month) { return new Date(year, month, 1); }
function endOfMonth(year, month) { return new Date(year, month+1, 0); }

export default function PartnerCalendar({ partner='female', month, setMonth, entries = {}, onAddEntry }) {
  const { year, month: m } = month;
  const first = startOfMonth(year, m);
  const last = endOfMonth(year, m);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();

  const [selectedDate, setSelectedDate] = useState(null);

  const cells = useMemo(() => {
    const arr = [];
    for (let i=0;i<startWeekday;i++) arr.push(null);
    for (let d=1; d<=daysInMonth; d++) arr.push(new Date(year, m, d));
    return arr;
  }, [year, m, startWeekday, daysInMonth]);

  const prevMonth = () => {
    if (m === 0) setMonth({ year: year-1, month: 11 });
    else setMonth({ year, month: m-1 });
  };
  const nextMonth = () => {
    if (m === 11) setMonth({ year: year+1, month: 0 });
    else setMonth({ year, month: m+1 });
  };

  const handleCellClick = (date) => setSelectedDate(date);

  const partnerEntries = entries || {};

  return (
    <div className="bg-white/3 p-4 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="px-3 py-1 bg-rose-700/30 rounded">Prev</button>
        <div className="font-semibold">{first.toLocaleString(undefined,{month:'long'})} {year}</div>
        <button onClick={nextMonth} className="px-3 py-1 bg-rose-700/30 rounded">Next</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-rose-200/80 mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((dt, idx) => (
          <CalendarCell key={idx} date={dt} entries={dt ? (partnerEntries[dt.toISOString().slice(0,10)]||[]) : []} onClick={() => dt && handleCellClick(dt)} />
        ))}
      </div>

      {selectedDate && (
        <DailyEntryModal partner={partner} date={selectedDate} initialEntries={partnerEntries[selectedDate.toISOString().slice(0,10)]||[]} onClose={() => setSelectedDate(null)} onSave={(entry) => { onAddEntry(partner, selectedDate, entry); setSelectedDate(null); }} />
      )}
    </div>
  );
}
