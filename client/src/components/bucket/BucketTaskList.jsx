import React from 'react';
import BucketTaskCard from './BucketTaskCard';

export default function BucketTaskList({ tasks, onDelete, onRestore, onOpenConfirm, onOpenDetail, activeFilter, showCompletedSection = false }) {
  // When parent passes filtered tasks, we still need to handle empty states differently
  if (!tasks || tasks.length === 0) {
    if (activeFilter === 'completed') return <div style={{padding:18,color:'#ffd9ff'}}>No memories completed yet 💞</div>;
    return <div style={{padding:18,color:'#ffd9ff'}}>No adventures planned yet ✈️</div>;
  }

  const pending = tasks.filter(t => !t.isCompleted);
  const completed = tasks.filter(t => t.isCompleted);

  return (
    <div>
      <div style={{marginTop:12}}>
        {pending.map(t => (
          <BucketTaskCard key={t._id} item={t} onRestore={(it)=>onRestore(it)} onOpenConfirm={(it)=>onOpenConfirm(it)} onOpenDetail={(it)=>onOpenDetail && onOpenDetail(it)} onDelete={(it)=>onDelete && onDelete(it)} showDelete={true} />
        ))}
      </div>

      {showCompletedSection && (
        <>
          <h3 style={{marginTop:20,color:'#ffe8f8'}}>Completed Memories ✨</h3>
          <div>
            {completed.length === 0 ? <div style={{padding:8,color:'#ffd9ff'}}>No memories completed yet 💞</div> : completed.map(t => (
              <div key={t._id} style={{padding:10,background:'rgba(255,255,255,0.02)',borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div>
                  <div style={{fontWeight:700}}>{t.title}</div>
                  <div style={{fontSize:12,color:'#cbd5f5'}}>{t.completedAt ? new Date(t.completedAt).toLocaleDateString() : ''}</div>
                </div>
                <div>
                  <button onClick={() => onRestore(t)} style={{background:'transparent',border:'none',color:'#bde5ff'}}>Restore</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
