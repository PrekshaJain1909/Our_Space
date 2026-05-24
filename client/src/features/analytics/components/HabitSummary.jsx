import React, { useMemo } from "react";

function avg(values){ if(values.length===0) return 0; return (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1); }

export default function HabitSummary({ habit }){
  const history = habit.history || [];

  const stats = useMemo(()=>{
    const totalLogs = history.length;
    const quantities = history.map(h=>Number(h.count||0));
    const averageQuantity = avg(quantities);

    // best streak (consecutive days with status Good)
    const byDate = Object.fromEntries(history.map(h=>[h.date, h]));
    const dates = history.map(h=>h.date).sort();
    let best = 0, cur = 0, last = null;
    dates.forEach(d=>{
      const e = byDate[d];
      if(e.status==='Good'){
        if(last){
          const prev = new Date(last); const now = new Date(d);
          const diff = (now - prev)/(1000*60*60*24);
          if(diff===1) cur++; else cur=1;
        } else cur=1;
        best = Math.max(best, cur);
      } else { cur=0; }
      last = d;
    });

    // improvement %: compare average first half vs second half
    const mid = Math.floor(quantities.length/2);
    const firstAvg = avg(quantities.slice(0,mid));
    const secondAvg = avg(quantities.slice(mid));
    const improvement = (firstAvg==0 ? 0 : (((secondAvg-firstAvg)/firstAvg)*100)).toFixed(0);

    return { totalLogs, averageQuantity, bestStreak: best, improvement };
  },[history]);

  return (
    <div className="an-card">
      <div className="font-medium mb-2">Monthly Summary</div>
      <div style={{marginTop:6, color:'rgba(255,255,255,0.9)'}}>
        <div><strong>Total logs:</strong> {stats.totalLogs}</div>
        <div><strong>Average quantity:</strong> {stats.averageQuantity}</div>
        <div><strong>Best streak:</strong> {stats.bestStreak}</div>
        <div><strong>Improvement %:</strong> {stats.improvement}%</div>
      </div>
      <div style={{marginTop:12}}>
        <div className="an-subtitle" style={{marginBottom:8}}>Trend</div>
        <div style={{height:80, borderRadius:10, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.6)'}}>Trend sparkline</div>
      </div>
    </div>
  );
}
