import React, { useState, useContext, useEffect } from "react";
import CoupleContext from '../../../../context/CoupleContext';
import useAuth from '../../../../hooks/useAuth';

export default function HabitCreator({ onCreate }) {
  const { couple } = useContext(CoupleContext);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [ownerId, setOwnerId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const list = [];
    if (couple) {
      if (couple.partnerA) list.push({ id: couple.partnerA._id || couple.partnerA, name: couple.partnerA.name || couple.partnerA });
      if (couple.partnerB) list.push({ id: couple.partnerB._id || couple.partnerB, name: couple.partnerB.name || couple.partnerB });
    }
    setPartners(list);
    const meId = user?._id || user?.userId || user?.id || null;
    if (meId) setOwnerId(meId);
    const me = list.find(p => p.id === meId);
    if (me) setOwnerName(me.name);
  }, [couple, user]);

  const handleAdd = () => {
    if (!name.trim() || !ownerId) return;
    const owner = partners.find(p => p.id === ownerId);
    const ownerN = owner ? owner.name : ownerName;
    onCreate({ name: name.trim(), category, ownerId, ownerName: ownerN });
    setName("");
    setCategory("general");
  };

  return (
    <div className="an-card">
      <h3 className="an-header">Add Custom Habit</h3>
      <div className="an-form">
        <div className="an-row">
          <div className="an-field">
            <label>Habit Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Habit Name (e.g. Smoking)" className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md" />
          </div>
          <div className="an-field">
            <label>Track Habit For</label>
            <select required value={ownerId} onChange={(e)=>{setOwnerId(e.target.value); const p = partners.find(x=>x.id===e.target.value); if(p) setOwnerName(p.name);}} className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md">
              <option value="">-- select --</option>
              {partners.map(p=> (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="an-row">
          <div className="an-field">
            <label>Category</label>
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md">
              <option value="general">General</option>
              <option value="health">Health</option>
              <option value="communication">Communication</option>
              <option value="mental">Mental</option>
            </select>
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-full shadow-lg shadow-pink-200/40 transition-all duration-300 px-4 py-2"
          >
            Add Habit
          </button>
        </div>
      </div>
    </div>
  );
}
