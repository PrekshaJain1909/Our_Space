import React from 'react';
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

export default function TogetherCounter({ startDate }) {
    if (!startDate) return null;
    const start = new Date(startDate);
    const now = new Date();
    const years = differenceInYears(now, start);
    const months = differenceInMonths(now, start) - years * 12;
    const days = differenceInDays(now, start) - years * 365 - months * 30;

    return (
        <div className="card together-counter">
            <div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Together For</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                    <div className="counter-number">{years}y</div>
                    <div className="counter-number">{months}m</div>
                    <div className="counter-number">{days}d</div>
                </div>
            </div>
            <div>
                <div style={{ width: 48, height: 48, borderRadius: 999, overflow: 'hidden' }}>
                    <img src="/assets/couple-sample.jpg" alt="couple" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
        </div>
    );
}
