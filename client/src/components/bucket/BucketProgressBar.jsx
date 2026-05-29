import React from 'react';

export default function BucketProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed/total)*100);
  return (
    <div style={{margin:'12px 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <div style={{fontWeight:700,color:'#ffe8f8'}}>Bucket Progress</div>
        <div style={{color:'#ffd9ff'}}>{completed} / {total} completed</div>
      </div>

      <div style={{height:12,borderRadius:999,background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#ec4899,#a855f7)',transition:'width 600ms ease'}} />
      </div>
    </div>
  );
}
