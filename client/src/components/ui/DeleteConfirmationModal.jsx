import React from "react";

export default function DeleteConfirmationModal({ open, title = 'Delete Habit?', message = 'This action cannot be undone.', onCancel, onConfirm }){
  if(!open) return null;
  return (
    <div style={{position:'fixed', inset:0, zIndex:80}} className="flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#140022] w-full max-w-md rounded-lg p-6 shadow-lg transition-all duration-200" style={{opacity:1}}>
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="text-sm mb-4 text-gray-600 dark:text-gray-300">{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full transition">Cancel</button>
          <button onClick={onConfirm} className="bg-gradient-to-r from-pink-600 to-red-500 hover:from-pink-700 hover:to-red-600 text-white rounded-full shadow-lg shadow-pink-200/40 transition-all duration-300 px-4 py-2">Delete</button>
        </div>
      </div>
    </div>
  );
}
