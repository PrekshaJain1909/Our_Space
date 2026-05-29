import React from 'react';

export default function BucketTaskCard({ item, onRestore, onOpenConfirm, onOpenDetail, onDelete, showDelete }) {
  const daysLeft = item.targetDate ? Math.ceil((new Date(item.targetDate) - new Date())/(1000*60*60*24)) : null;
  let label = '';
  if (item.isCompleted) label = 'Completed';
  else if (daysLeft === 0) label = 'Today';
  else if (daysLeft === 1) label = 'Tomorrow';
  else if (daysLeft > 1) label = `Due in ${daysLeft}d`;
  else if (daysLeft < 0) label = 'Overdue';

  const id = item._id || item.id;

    return (
      <div onClick={() => onOpenDetail && onOpenDetail(item)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'rgba(255,255,255,0.02)',borderRadius:12,marginBottom:10,cursor:'pointer'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <input type="checkbox" checked={!!item.isCompleted} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); onOpenConfirm(item); }} />
          <div>
            <div style={{fontWeight:700,color:'#fff'}}>{item.title}</div>
            <div style={{fontSize:12,color:'#ffd9ff'}}>{item.category}</div>
          </div>
        </div>

        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,color:'#ffd9ff'}}>{item.targetDate ? new Date(item.targetDate).toLocaleDateString() : 'No date'}</div>
          <div style={{fontSize:12,color:'#cbd5f5'}}>{label}</div>
          <div style={{marginTop:8}}>
            {!item.isCompleted && showDelete && (
              <button onClick={(e)=>{ e.stopPropagation(); onDelete && onDelete(item); }} style={{background:'transparent',border:'none',color:'#ff6b81'}}>Delete</button>
            )}
          </div>
        </div>
      </div>
    );
}
