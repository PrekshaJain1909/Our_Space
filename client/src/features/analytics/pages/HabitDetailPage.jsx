import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HabitCalendar from "../components/HabitCalendar";
import HabitSummary from "../components/HabitSummary";
import HabitHistoryTimeline from "../components/HabitHistoryTimeline";
import CoupleContext from "../../../context/CoupleContext";

export default function HabitDetailPage(){
  const { habitId } = useParams();
  const navigate = useNavigate();
  const [habits, setHabits] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('customHabits:v1')||'[]'); }catch(e){return []}
  });

  useEffect(()=>{
    const onStorage = ()=>{
      try{ setHabits(JSON.parse(localStorage.getItem('customHabits:v1')||'[]')); }catch(e){}
    };
    window.addEventListener('storage', onStorage);
    return ()=>window.removeEventListener('storage', onStorage);
  },[]);

  const habit = useMemo(()=> habits.find(h=>h.id===habitId), [habits, habitId]);

  const saveHabit = (updated) => {
    const next = habits.map(h=> h.id===habitId ? { ...h, ...updated } : h);
    setHabits(next);
    try{ localStorage.setItem('customHabits:v1', JSON.stringify(next)); }catch(e){}
  };

  if(!habit) return (
    <div className="p-6">
      <div className="mb-4">
        <button onClick={()=>navigate(-1)} className="text-pink-500 hover:text-pink-600 font-medium transition-colors dark:text-inherit">Back</button>
      </div>
      <div className="text-gray-400">Habit not found. Return to <span onClick={()=>navigate('/analytics')} className="underline cursor-pointer">Analytics</span>.</div>
    </div>
  );

  const { couple } = useContext(CoupleContext);

  let updaterName = "";
  if (habit.ownerName && couple) {
    const a = couple.partnerA?.name || couple.partnerA;
    const b = couple.partnerB?.name || couple.partnerB;
    if (a === habit.ownerName) updaterName = b;
    else if (b === habit.ownerName) updaterName = a;
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
        <button onClick={()=>navigate(-1)} className="text-pink-500 hover:text-pink-600 font-medium transition-colors an-range-btn">Back</button>
        <h1 style={{fontSize:20, fontWeight:700}}>{habit.name} Analytics</h1>
      </div>
      <div style={{marginBottom:20}}>
        <div className="an-subtitle">{habit.category}</div>
        {habit.ownerName && (
          <div className="mt-2">
            <div className="text-sm">Tracked for: {habit.ownerName}</div>
            <div className="text-sm">Can be updated by: {updaterName || 'Your partner'}</div>
          </div>
        )}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:20}}>
        <div>
          <HabitCalendar habit={habit} onSave={(updatedHistory)=> saveHabit({ history: updatedHistory })} />
          <HabitHistoryTimeline habit={habit} />
        </div>
        <div>
          <HabitSummary habit={habit} />
        </div>
      </div>
    </div>
  );
}
