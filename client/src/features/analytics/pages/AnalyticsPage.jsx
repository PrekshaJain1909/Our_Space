import React, { useMemo, useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import "../components/Analytics.css";
import HabitCreator from "../components/habits/HabitCreator";
import HabitCard from "../components/habits/HabitCard";

export default function AnalyticsPage() {
  const [habits, setHabits] = useState(() => {
    try {
      const raw = localStorage.getItem("customHabits:v1");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const { user } = useAuth();
  const [filter, setFilter] = useState("");
  const filteredHabits = useMemo(()=>{
    const q = (filter||"").trim().toLowerCase();
    return q ? habits.filter(h => (h.name||"").toLowerCase().includes(q)) : habits;
  }, [habits, filter]);
  const [showFilter, setShowFilter] = useState(false);

  const handleAddHabit = (habit) => {
    setHabits((prev) => [{
      id: `h-${Date.now()}`,
      name: habit.name,
      category: habit.category,
      ownerId: habit.ownerId || (user?._id || user?.id || null),
      ownerName: habit.ownerName || (user?.name || user?.displayName || ""),
      history: [],
      collapsed: false,
      createdBy: user?.id || null,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  // persist habits to localStorage so detail page can read them
  useEffect(()=>{
    try{ localStorage.setItem("customHabits:v1", JSON.stringify(habits)); }catch(e){}
  },[habits]);

  const handleUpdateHabit = (id, update) => {
    setHabits((prev) => prev.map(h => h.id===id ? { ...h, ...update } : h));
  };

  const handleDeleteHabit = (id) => {
    setHabits((prev) => prev.filter(h => h.id !== id));
  };

  return (
    <div className="analytics-wrapper">
      <div className="analytics-overlay" />

      <div className="analytics-inner">
        <p className="analytics-badge">Analytics</p> <br />
        <header className="analytics-header floating-note">
          
          <h1 className="analytics-title">Habits</h1>
          <p className="analytics-subtitle">Create custom habits and track entries dynamically.</p>
        </header>

        <div>
          <div style={{display:'flex', gap:12, marginBottom:12, alignItems:'center'}}>
            <button className={`an-range-btn ${!showFilter? 'an-range-btn-active': ''}`} onClick={()=>setShowFilter(false)}>Habits</button>
            <button className={`an-range-btn ${showFilter? 'an-range-btn-active': ''}`} onClick={()=>setShowFilter(true)}>Filter</button>
          </div>

          {showFilter && (
            <div className="analytics-block">
              <div className="an-card">
                <h3 className="an-header">Filter Habits</h3>
                <div className="an-form">
                  <div className="an-field">
                    <label>Filter by name (case-insensitive)</label>
                    <input
                      value={filter}
                      onChange={(e)=>setFilter(e.target.value)}
                      placeholder="Type to filter..."
                      className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md"
                    />
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
                    <div className="an-subtitle">Matches: {filteredHabits.length}</div>
                    <button onClick={()=>setFilter('')} className="an-range-btn text-pink-500 hover:text-pink-600">Clear</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="analytics-block">
            <HabitCreator onCreate={handleAddHabit} />
          </div>

          <div className="analytics-block mt-4 space-y-3">
            {filteredHabits.map((h) => (
              <div key={h.id} style={{marginBottom:12}}>
                <HabitCard habit={h} onUpdate={(u)=>handleUpdateHabit(h.id,u)} onDelete={() => handleDeleteHabit(h.id)} />
              </div>
            ))}
            {filteredHabits.length===0 && <div className="text-gray-400">No custom habits found — try a different filter.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
