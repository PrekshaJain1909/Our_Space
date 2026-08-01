import React, { useState } from 'react';
import PartnerCalendar from './PartnerCalendar';
import PartnerSummary from './PartnerSummary';
import ComparisonInsights from './ComparisonInsights';

export default function DualCalendarAnalytics() {
  const today = new Date();
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });

  // state shape: { partnerId, date, message, note, habit, quantity, status, reflection, timestamp }
  const [femaleEntries, setFemaleEntries] = useState({}); // key: 'YYYY-MM-DD' -> [entries]
  const [maleEntries, setMaleEntries] = useState({});

  const handleAddEntry = (partner, date, entry) => {
    const key = date.toISOString().slice(0,10);
    const setter = partner === 'female' ? setFemaleEntries : setMaleEntries;
    setter(prev => ({ ...prev, [key]: [ ...(prev[key]||[]), entry ] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-rose-100">Female Partner Calendar</h3>
        </div>
        <PartnerCalendar partner="female" month={month} setMonth={setMonth} entries={femaleEntries} onAddEntry={handleAddEntry} />
        <PartnerSummary partner="female" entries={femaleEntries} />
      </div>

      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-emerald-100">Male Partner Calendar</h3>
        </div>
        <PartnerCalendar partner="male" month={month} setMonth={setMonth} entries={maleEntries} onAddEntry={handleAddEntry} />
        <PartnerSummary partner="male" entries={maleEntries} />
      </div>

      <div className="col-span-1 lg:col-span-2 mt-4">
        <ComparisonInsights femaleEntries={femaleEntries} maleEntries={maleEntries} />
      </div>
    </div>
  );
}
