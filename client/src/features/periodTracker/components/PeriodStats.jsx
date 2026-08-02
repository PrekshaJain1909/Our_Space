import React from "react";
import { FaChartLine, FaCalendarCheck, FaClock, FaCalendarDay } from "react-icons/fa";

export default function PeriodStats({ stats }) {
  if (!stats) return null;

  const statItems = [
    {
      title: "Current Cycle Day",
      value: `Day ${stats.currentCycleDay || 1}`,
      desc: "Days since last period start",
      icon: FaCalendarDay,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/30",
    },
    {
      title: "Avg Cycle Length",
      value: `${stats.avgCycleLength || 28} Days`,
      desc: "Standard range 21–35 days",
      icon: FaClock,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    },
    {
      title: "Avg Period Length",
      value: `${stats.avgPeriodLength || 5} Days`,
      desc: "Rest & hydration phase",
      icon: FaCalendarCheck,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      title: "Prediction Accuracy",
      value: `${stats.predictionAccuracy ?? 100}%`,
      desc: "How closely confirmed dates match predictions",
      icon: FaChartLine,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "Regularity",
      value: `${stats.regularity ?? 100}%`,
      desc: "Consistency across your recorded cycles",
      icon: FaCalendarCheck,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    },
    {
      title: "Average Delay",
      value: `${stats.averageDelay ?? 0} days`,
      desc: "Average difference from predicted starts",
      icon: FaClock,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-theme pb-4">
        <div>
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <FaChartLine className="text-pink-500" /> Cycle Statistics & Insights
          </h3>
          <p className="text-xs text-secondary">
            Analysis based on confirmed periods and recent cycle trends.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className={`bg-surface border ${item.color} rounded-2xl p-5 shadow-sm space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {item.title}
                </span>
                <div className={`p-2.5 rounded-xl text-base ${item.color}`}>
                  <IconComp />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-primary">{item.value}</div>
                <div className="text-xs text-secondary mt-1">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
