import React from "react";
import MonthlyCalendar from "../components/MonthlyCalendar";
import MonthlyJournal from "../components/MonthlyJournal";
import MonthlySummary from "../components/MonthlySummary";
import MonthlyTimeline from "../components/MonthlyTimeline";
import MonthlyInsights from "../components/MonthlyInsights";

export default function MonthlyDataPage(){
  return (
    <div className="analytics-wrapper">
      <div className="analytics-overlay" />
      <div className="analytics-inner p-4">
        <header className="analytics-header mb-4">
          <p className="analytics-badge">Monthly Data</p>
          <h1 className="analytics-title">Monthly Overview</h1>
          <p className="analytics-subtitle">Calendar, journals and detailed monthly insights.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <MonthlyCalendar />
            <MonthlyTimeline />
          </div>

          <div className="space-y-4">
            <MonthlyJournal />
            <MonthlySummary />
            <MonthlyInsights />
          </div>
        </div>
      </div>
    </div>
  );
}
