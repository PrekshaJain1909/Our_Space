import React from 'react';

function formatKey(date){ return date ? date.toISOString().slice(0,10) : null; }

export default function CalendarCell({ date, entries = [], onClick }){
  const key = formatKey(date);
  const hasMessage = entries.some(e => e.message);
  const hasReflection = entries.some(e => e.reflection);
  const status = entries.length ? entries[entries.length-1].status : null; // latest

  const statusDot = status === 'Good' ? 'bg-emerald-400' : status === 'Moderate' ? 'bg-yellow-400' : status === 'Bad' ? 'bg-rose-500' : '';

  return (
    <button onClick={onClick} className="relative p-2 h-20 bg-white/5 rounded hover:bg-white/7 focus:outline-none">
      {!date ? <div className="text-rose-400/40"> </div> : (
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between text-xs text-rose-200">
            <div className="font-medium">{date.getDate()}</div>
            <div className="flex items-center space-x-1">
              {statusDot && <span className={`w-3 h-3 rounded-full ${statusDot}`}></span>}
              {hasMessage && <span className="text-pink-400">❤</span>}
              {hasReflection && <span className="text-sky-300">📝</span>}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-rose-200/80 truncate">{entries.slice(0,2).map((e,i)=> <div key={i}>{e.habit || e.message || ''}</div>)}</div>
        </div>
      )}
    </button>
  );
}
