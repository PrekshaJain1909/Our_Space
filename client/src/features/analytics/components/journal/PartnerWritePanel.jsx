import React, { useState } from "react";

export default function PartnerWritePanel({ partnerLabel = "Partner", initial = {}, onSave }) {
  const [title, setTitle] = useState(initial.title || "");
  const [reflection, setReflection] = useState(initial.reflection || "");
  const [mood, setMood] = useState(initial.mood || "");
  const [highlights, setHighlights] = useState(initial.highlights || "");
  const [challenges, setChallenges] = useState(initial.challenges || "");
  const [lessons, setLessons] = useState(initial.lessons || "");

  const handleSave = () => {
    onSave({ title, reflection, mood, highlights, challenges, lessons });
  };

  return (
    <div className="partner-panel space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">{partnerLabel}</div>
      </div>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="input input-sm w-full" />
      <textarea value={reflection} onChange={(e)=>setReflection(e.target.value)} rows={4} placeholder="Reflection" className="input input-sm w-full" />
      <input value={mood} onChange={(e)=>setMood(e.target.value)} placeholder="Mood" className="input input-sm w-full" />
      <input value={highlights} onChange={(e)=>setHighlights(e.target.value)} placeholder="Highlights" className="input input-sm w-full" />
      <input value={challenges} onChange={(e)=>setChallenges(e.target.value)} placeholder="Challenges" className="input input-sm w-full" />
      <input value={lessons} onChange={(e)=>setLessons(e.target.value)} placeholder="Lessons" className="input input-sm w-full" />
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn btn-primary btn-sm">Save</button>
      </div>
    </div>
  );
}
