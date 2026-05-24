import React from "react";

const statusEmoji = (s)=> s==='Good' ? '🟢' : s==='Moderate' ? '🟡' : s==='Bad' ? '🔴' : '';

export default function CalendarDateCell({ date, entry, onClick }){
  if(!date) return <div className="calendar-cell empty" />;
  const day = date.getDate();
  const dateStr = date.toISOString().slice(0,10);

  const status = entry && entry.status ? entry.status : null;
  const qty = entry ? entry.count : null;
  const note = entry ? entry.note : null;

  const statusClass = status==='Good' ? 'status-good' : status==='Moderate' ? 'status-moderate' : status==='Bad' ? 'status-bad' : '';

  return (
    <div onClick={(e)=>{ e && e.stopPropagation && e.stopPropagation(); onClick && onClick(); }} className={`calendar-cell ${statusClass}`} role="button" tabIndex={0}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:600}}>{day}</div>
        <div>{statusEmoji(status)}</div>
      </div>
      <div style={{marginTop:8, fontSize:13, color:'rgba(255,255,255,0.85)'}}>{qty!=null ? qty : ''}</div>
      <div style={{marginTop:6, fontSize:12, color:'rgba(255,255,255,0.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{note ? `"${note}"` : ''}</div>
    </div>
  );
}
