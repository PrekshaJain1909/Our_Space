import React, { useState } from 'react';

export default function DailyEntryModal({ partner='female', date, initialEntries = [], onClose, onSave }){
  const [habit, setHabit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('Good');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [reflection, setReflection] = useState('');

  const save = () => {
    const entry = { partnerId: partner, date: date.toISOString().slice(0,10), habit, quantity, status, message, note, reflection, timestamp: new Date().toISOString() };
    onSave && onSave(entry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-lg p-6 ring-1 ring-rose-700/40">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">{partner === 'female' ? 'Female' : 'Male'} — {date.toDateString()}</h4>
          <button onClick={onClose} className="text-rose-300">Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-rose-200">Habit</label>
            <input value={habit} onChange={e=>setHabit(e.target.value)} className="w-full p-2 rounded bg-white/5 text-white" />
          </div>
          <div>
            <label className="text-sm text-rose-200">Quantity</label>
            <input value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full p-2 rounded bg-white/5 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-rose-200">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full p-2 rounded bg-white/5 text-white">
              <option>Good</option>
              <option>Moderate</option>
              <option>Bad</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-rose-200">Message</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full p-2 rounded bg-white/5 text-white" rows={3} />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-rose-200">Observation / Note</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full p-2 rounded bg-white/5 text-white" rows={2} />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-rose-200">Reflection</label>
            <textarea value={reflection} onChange={e=>setReflection(e.target.value)} className="w-full p-2 rounded bg-white/5 text-white" rows={2} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end space-x-2">
          <button onClick={save} className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-full shadow-lg shadow-pink-200/40 transition-all duration-300 px-4 py-2">Save</button>
        </div>
      </div>
    </div>
  );
}
