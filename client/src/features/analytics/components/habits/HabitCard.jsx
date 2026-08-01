import React, { useState } from "react";
import DeleteConfirmationModal from "../../../../components/ui/DeleteConfirmationModal";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";

export default function HabitCard({ habit, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const meId = user?._id || user?.id || user?.userId || null;
  const [date, setDate] = useState("");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");

  const addEntry = () => {
    if (!date) return;
    // only owner can add entries
    const meId = user?._id || user?.id || user?.userId || null;
    // reverse accountability: owner cannot edit; only the other partner can update
    if (habit.ownerId && meId === habit.ownerId) {
      alert(`This habit is assigned to you. Only your partner can update entries.`);
      return;
    }
    // prevent future dates
    const todayStr = new Date().toISOString().slice(0, 10);
    if (date > todayStr) {
      alert('Cannot add or edit entries for future dates.');
      return;
    }
    const entry = { id: `e-${Date.now()}`, date, count, note, updatedById: meId, updatedByName: user?.name || user?.displayName || "", trackedFor: habit.ownerName || '', updatedBy: user?.name || '', timestamp: new Date().toISOString(), createdAt: new Date().toISOString() };
    const history = [entry, ...(habit.history || [])];
    onUpdate({ history });
    setDate(""); setCount(1); setNote("");
  };

  const toggleCollapse = () => onUpdate({ collapsed: !habit.collapsed });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState(null);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);

  const handleDeleteEntry = (id) => {
    const meId = user?._id || user?.id || user?.userId || null;
    if (habit.ownerId && meId === habit.ownerId) {
      alert(`This habit is assigned to you. Only your partner can update entries.`);
      return;
    }
    const history = (habit.history || []).filter(h => h.id !== id);
    onUpdate({ history });
  };

  const goDetail = () => navigate(`/monthly-data/${habit.id}`, { state: { fromAnalytics: true } });
  const lastUpdater = (habit.history && habit.history[0] && (habit.history[0].updatedByName || habit.history[0].updatedBy)) || habit.updatedByName || "";

  return (
    <div onClick={goDetail} role="button" tabIndex={0} className="an-card habit-card" style={{ cursor: 'pointer', borderRadius: 12 }}>
      <div className="an-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="font-semibold">{habit.name}</div>
          <div className="an-subtitle">{habit.category}</div>
          {/* owner name moved to right-side; left badge removed */}
          {lastUpdater && (
            <div className="an-subtitle mt-1">Updated by {lastUpdater}</div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          {habit.ownerName && (
            <div className="text-sm inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-700 dark:bg-transparent dark:text-pink-300">{habit.ownerName}</div>
          )}
          <button onClick={(e) => { e.stopPropagation(); toggleCollapse(); }} className="an-range-btn text-pink-500 hover:text-pink-600">{habit.collapsed ? 'Expand' : 'Collapse'}</button>
          <button onClick={(e) => {
            e.stopPropagation();
            // permission check: only creator can delete
            if (habit.createdBy) {
              if (!user || user.id !== habit.createdBy) {
                alert('Only the creator of this habit can delete it.');
                return;
              }
            }
            setShowDeleteModal(true);
          }} className="an-range-btn text-pink-500 hover:text-pink-600">Delete</button>
        </div>
      </div>

      {!habit.collapsed && (
        <div className="mt-3">
          {habit.ownerId && habit.ownerName && meId === habit.ownerId && (
            <div style={{ background: '#fff1f2', color: '#9f1239', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              This habit is assigned to you . Only your partner can update it for accountability.
            </div>
          )}
          {habit.ownerId && habit.ownerName && meId !== habit.ownerId && (
            <div style={{ background: '#fff7fb', color: '#9f1239', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              You can log updates for {habit.ownerName}.
            </div>
          )}
          <div className="an-form">
            <div className="an-row">
              <div className="an-field">
                <label>Date</label>
                <input onClick={(e) => e.stopPropagation()} type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!!(habit.ownerId && meId === habit.ownerId)} max={new Date().toISOString().slice(0, 10)} className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md" />
              </div>
              <div className="an-field">
                <label>Quantity</label>
                <input onClick={(e) => e.stopPropagation()} type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={!!(habit.ownerId && meId === habit.ownerId)} className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md" />
              </div>
              <div className="an-field">
                <label>Note</label>
                <input onClick={(e) => e.stopPropagation()} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" disabled={!!(habit.ownerId && meId === habit.ownerId)} className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={(e) => { e.stopPropagation(); addEntry(); }} className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-full shadow-lg shadow-pink-200/40 transition-all duration-300 px-4 py-2" disabled={!!(habit.ownerId && meId === habit.ownerId)}>Save</button>
            </div>
          </div>

          <div className="mt-4">
            <div className="font-medium text-sm mb-2">History</div>
            <div>
              {(habit.history || []).map(h => (
                <div key={h.id} className="an-row" style={{ justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 8 }}>
                  <div>
                    <div className="text-sm">{h.date} • {h.count}</div>
                    <div className="an-subtitle">{h.note}</div>
                  </div>
                  <div>
                    <button onClick={(e) => { e.stopPropagation(); setPendingDeleteEntryId(h.id); setShowDeleteEntryModal(true); }} className="an-range-btn text-pink-500 hover:text-pink-600" disabled={!!(habit.ownerId && meId === habit.ownerId)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          open={showDeleteModal}
          title={`Delete Habit?`}
          message={`This action cannot be undone.`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => { setShowDeleteModal(false); onDelete && onDelete(); }}
        />
      )}
      {showDeleteEntryModal && (
        <DeleteConfirmationModal
          open={showDeleteEntryModal}
          title={`Delete Entry?`}
          message={`This action cannot be undone.`}
          onCancel={() => { setShowDeleteEntryModal(false); setPendingDeleteEntryId(null); }}
          onConfirm={() => { setShowDeleteEntryModal(false); if (pendingDeleteEntryId) { handleDeleteEntry(pendingDeleteEntryId); setPendingDeleteEntryId(null); } }}
        />
      )}
    </div>
  );
}
