import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import HabitCalendar from "../components/HabitCalendar";
import HabitSummary from "../components/HabitSummary";
import HabitHistoryTimeline from "../components/HabitHistoryTimeline";

function loadHabitById(id){
  try{
    const raw = localStorage.getItem("customHabits:v1");
    const arr = raw ? JSON.parse(raw) : [];
    return arr.find(h=>h.id===id);
  }catch(e){return null}
}

export default function HabitDetailPage(){
  const { habitId } = useParams();
  const [habit, setHabit] = useState(null);

  useEffect(()=>{
    const h = loadHabitById(habitId);
    setHabit(h || null);
  },[habitId]);

  if(!habit) return (
    <div className="analytics-wrapper"><div className="analytics-inner p-4">Habit not found.</div></div>
  );

  return (
    <div className="analytics-wrapper">
      <div className="analytics-overlay" />
      <div className="analytics-inner p-4">
        <header className="analytics-header mb-4">
          <p className="analytics-badge">{habit.name} Analytics</p>
          <h1 className="analytics-title">{habit.name}</h1>
          <p className="analytics-subtitle">Habit summary, monthly statistics and calendar tracking.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <HabitCalendar habit={habit} onHabitChange={(h)=>{ setHabit(h); /* persist back to storage */ try{ const raw = localStorage.getItem('customHabits:v1'); const arr = raw?JSON.parse(raw):[]; const updated = arr.map(x=>x.id===h.id?h:x); localStorage.setItem('customHabits:v1', JSON.stringify(updated)); }catch(e){} }} />
            <HabitHistoryTimeline habit={habit} />
          </div>
          <div className="space-y-4">
            <HabitSummary habit={habit} />
          </div>
        </div>
      </div>
    </div>
  );
}
