import React from 'react';

export default function BucketConfirmModal({ open, title, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)'}} onClick={onCancel} />
      <div style={{position:'relative',background:'#fff',color:'#1f2937',borderRadius:14,padding:20,maxWidth:420,width:'90%',boxShadow:'0 20px 60px rgba(168,85,247,0.18)'}}>
        <h3 style={{margin:0}}>Complete this memory together? ✨</h3>
        <p style={{color:'#6b7280'}}>{title}</p>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
          <button onClick={onCancel} style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(0,0,0,0.08)',background:'transparent'}}>Cancel</button>
          <button onClick={onConfirm} style={{padding:'8px 12px',borderRadius:8,background:'linear-gradient(90deg,#ec4899,#a855f7)',color:'#fff',border:'none'}}>Yes, Complete 💖</button>
        </div>
      </div>
    </div>
  );
}
