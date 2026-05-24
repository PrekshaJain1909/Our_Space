import React from "react";

const statusDot = (s)=> s==='Good' ? '🟢' : s==='Moderate' ? '🟡' : s==='Bad' ? '🔴' : '⚪';

export default function HabitHistoryTimeline({ habit }){
  const history = (habit.history || []).slice().sort((a,b)=> (b.date||'').localeCompare(a.date||''));

  return (
    <div className="an-card" style={{marginTop:16}}>
      <div className="font-medium mb-3">History</div>
      <div>
        {history.length===0 && <div className="an-subtitle">No entries yet.</div>}
        {history.map(h=> (
          <div key={h.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:8, borderRadius:8, background:'rgba(255,255,255,0.02)', marginBottom:8}}>
            <div>
              <div style={{fontSize:14}}>{h.date}</div>
              <div className="an-subtitle">{h.note}</div>
              {h.updatedByName && (
                <div className="an-subtitle" style={{marginTop:6, fontSize:12}}>Updated by {h.updatedByName}</div>
              )}
            </div>
            <div style={{textAlign:'right'}}>
              <div>{statusDot(h.status)}</div>
              <div style={{fontSize:14}}>{h.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
