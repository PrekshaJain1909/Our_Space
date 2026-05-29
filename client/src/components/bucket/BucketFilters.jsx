import React from 'react';

export default function BucketFilters({ active, onChange }) {
  const pills = ['all','pending','approaching','overdue','completed'];
  return (
    <div className="bucket-filters">
      {pills.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`bucket-pill ${active === p ? 'active' : 'inactive'}`}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
}
