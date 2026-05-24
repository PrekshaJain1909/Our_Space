import React, { useMemo, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import DeleteConfirmationModal from "../../../components/ui/DeleteConfirmationModal";

function isNotFuture(date){
  const d = new Date(date);
  const today = new Date();
  // strip time portion
  const toStr = (x)=> x.toISOString().slice(0,10);
  return toStr(d) <= toStr(today);
}

export default function DateDetailModal({ habit, date, entry, onClose, onSave }){
  const { user } = useAuth();
  const meId = user?._id || user?.id || user?.userId || null;
  const dateStr = date instanceof Date ? date.toISOString().slice(0,10) : new Date(date).toISOString().slice(0,10);
  const editable = isNotFuture(dateStr) && (!habit.ownerId || meId !== habit.ownerId);
  const isFuture = !isNotFuture(dateStr);

  const [count, setCount] = useState(entry ? entry.count : 0);
  const [status, setStatus] = useState(entry ? entry.status || '' : '');
  const [note, setNote] = useState(entry ? entry.note || '' : '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const timestamp = entry ? (entry.createdAt || entry.id?.split('-')[1] || '') : '';

  const handleSave = ()=>{
    if(!editable) return;
    const newEntry = {
      id: entry ? entry.id : `e-${Date.now()}`,
      date: dateStr,
      count: Number(count),
      status: status,
      note: note,
      trackedFor: habit.ownerName || '',
      updatedBy: user?.name || user?.displayName || "",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedById: meId,
      updatedByName: user?.name || user?.displayName || "",
    };
    onSave(dateStr, newEntry);
  };

  const handleDelete = ()=>{
    if(!editable) return;
    onSave(dateStr, null);
  };

  return (
    <div style={{position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.5)'}} onClick={onClose}></div>
      <div className="an-card" style={{zIndex:60, width:'100%', maxWidth:520}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
          <div className="font-medium">{habit.name} — {dateStr}</div>
          <div className="an-subtitle">{editable ? 'Editable' : 'Locked'}</div>
        </div>

        <div>
          {habit.ownerId && habit.ownerName && meId === habit.ownerId && (
            <div style={{background:'#fff1f2', color:'#9f1239', padding:12, borderRadius:8, marginBottom:12}}>
              This habit is assigned to you. Only your partner can update it for accountability.
            </div>
          )}
          {habit.ownerId && habit.ownerName && meId !== habit.ownerId && (
            <div style={{background:'#fff7fb', color:'#9f1239', padding:12, borderRadius:8, marginBottom:12}}>
              You can log updates for {habit.ownerName}.
            </div>
          )}
          <div className="an-field">
            <label>Quantity</label>
            <input
              onClick={(e)=>e.stopPropagation()}
              value={count}
              onChange={(e)=>setCount(e.target.value)}
              type="number"
              disabled={!editable}
              className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md"
            />
          </div>

          <div className="an-field">
            <label>Status</label>
            <select
              onClick={(e)=>e.stopPropagation()}
              value={status}
              onChange={(e)=>setStatus(e.target.value)}
              disabled={!editable}
              className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md"
            >
              <option value="">-- select --</option>
              <option value="Good">Good</option>
              <option value="Moderate">Moderate</option>
              <option value="Bad">Bad</option>
            </select>
          </div>

          <div className="an-field">
            <label>Additional message</label>
            <textarea
              onClick={(e)=>e.stopPropagation()}
              value={note}
              onChange={(e)=>setNote(e.target.value)}
              disabled={!editable}
              className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md"
            />
          </div>

          <div className="an-subtitle">Timestamp: {entry && entry.createdAt ? entry.createdAt : '—'}</div>
          {isFuture && <div className="an-subtitle" style={{marginTop:10}}>Entries for future dates cannot be edited.</div>}
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
          {editable && <button onClick={()=>setShowDeleteConfirm(true)} className="an-range-btn text-pink-500 hover:text-pink-600">Delete</button>}
          <button onClick={onClose} className="an-range-btn text-pink-500 hover:text-pink-600">Close</button>
          {editable && (
            <button onClick={handleSave} className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-full shadow-lg shadow-pink-200/40 transition-all duration-300 px-4 py-2">
              Save
            </button>
          )}
        </div>
        {showDeleteConfirm && (
          <DeleteConfirmationModal
            open={showDeleteConfirm}
            title={`Delete Entry?`}
            message={`This action cannot be undone.`}
            onCancel={()=>setShowDeleteConfirm(false)}
            onConfirm={()=>{ setShowDeleteConfirm(false); handleDelete(); }}
          />
        )}
      </div>
    </div>
  );
}
