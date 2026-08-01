import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaRegSmile } from "react-icons/fa";

const DEFAULT_PHASES = [
  { key: "period", name: "Period Days", desc: "Rest and hydration", color: "#FCA5A5", startDay: 1, endDay: 5 },
  { key: "freshStart", name: "Fresh Start", desc: "Recovery and renewed energy", color: "#86EFAC", startDay: 6, endDay: 10 },
  { key: "bestDays", name: "Best Days", desc: "Energetic and confident", color: "#FDE047", startDay: 11, endDay: 16 },
  { key: "calmDays", name: "Calm Days", desc: "Balanced phase", color: "#A7F3D0", startDay: 17, endDay: 23 },
  { key: "takeCare", name: "Take Care Days", desc: "Period may be approaching; cravings or bloating possible", color: "#FDBA74", startDay: 24, endDay: 28 },
];

// Helper to calculate lighter background color based on hex
const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(200, 200, 200, ${alpha})`;
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.slice(0, 2), 16) || 200;
  const g = parseInt(cleanHex.slice(2, 4), 16) || 200;
  const b = parseInt(cleanHex.slice(4, 6), 16) || 200;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function PeriodCalendarView({
  settings,
  baseStartDate,
  logs = [],
  surprises = [],
  onSelectDate,
  currentYear,
  currentMonth,
  onChangeMonthYear,
}) {
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'year'

  const cycleLength = settings?.cycleLength || 28;
  const startRef = baseStartDate ? new Date(baseStartDate) : new Date();
  const phases = settings?.phases?.length > 0 ? settings.phases : DEFAULT_PHASES;

  // Helper to determine phase of any specific Date
  const getPhaseForDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const s = new Date(startRef);
    s.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((d.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    
    // Normalize cycle position
    let cyclePos = diffDays % cycleLength;
    if (cyclePos < 0) cyclePos += cycleLength;
    const dayInCycle = cyclePos + 1;

    const matchedPhase = phases.find(p => dayInCycle >= p.startDay && dayInCycle <= p.endDay);

    if (matchedPhase) {
      return { dayInCycle, ...matchedPhase };
    }

    return { 
      key: "unknown", 
      dayInCycle, 
      name: "Unassigned Days", 
      desc: "No phase configured", 
      color: "#D1D5DB" 
    };
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onChangeMonthYear(currentYear - 1, 12);
    } else {
      onChangeMonthYear(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onChangeMonthYear(currentYear + 1, 1);
    } else {
      onChangeMonthYear(currentYear, currentMonth + 1);
    }
  };

  // Month grid calculations
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="space-y-6">
      {/* View Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-theme">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-theme hover:bg-surface-subtle text-secondary hover:text-primary transition-all"
          >
            <FaChevronLeft />
          </button>

          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <FaCalendarAlt className="text-pink-500" />
            {monthName} {currentYear}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-theme hover:bg-surface-subtle text-secondary hover:text-primary transition-all"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* View mode toggle button */}
        <div className="flex bg-surface-subtle border border-theme rounded-xl p-1 text-xs">
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === "month"
                ? "bg-pink-500 text-white shadow"
                : "text-secondary hover:text-primary"
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setViewMode("year")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === "year"
                ? "bg-pink-500 text-white shadow"
                : "text-secondary hover:text-primary"
            }`}
          >
            Year Summary
          </button>
        </div>
      </div>

      {/* Phase Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {phases.map((config) => (
          <div
            key={config.key}
            style={{ 
              backgroundColor: hexToRgba(config.color, 0.15),
              borderColor: hexToRgba(config.color, 0.5) 
            }}
            className="p-2.5 rounded-xl border flex flex-col justify-between text-xs space-y-1"
          >
            <div className="font-bold flex items-center justify-between">
              <span style={{ color: config.color, filter: "brightness(0.7)" }}>{config.name}</span>
            </div>
            <p className="text-[10px] opacity-80 leading-tight text-secondary">{config.desc}</p>
          </div>
        ))}
      </div>

      {/* Month View Grid */}
      {viewMode === "month" ? (
        <div className="bg-surface border border-theme rounded-2xl p-4 shadow-sm space-y-3">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-secondary pb-2 border-b border-theme">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 rounded-xl bg-surface-subtle/30" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
                dayNum
              ).padStart(2, "0")}`;
              const dateObj = new Date(currentYear, currentMonth - 1, dayNum);

              const phase = getPhaseForDate(dateObj);
              const isToday =
                new Date().toISOString().split("T")[0] === dateStr;

              const dayLog = logs.find((l) => l.date === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr, phase)}
                  style={{
                    backgroundColor: hexToRgba(phase.color, 0.15),
                    borderColor: hexToRgba(phase.color, 0.4)
                  }}
                  className={`h-20 rounded-xl border p-2 flex flex-col justify-between text-left transition-all hover:scale-[1.02] hover:shadow-md relative ${isToday ? "ring-2 ring-pink-500 font-bold" : ""}`}
                >
                  <div className="flex justify-between items-center text-xs font-bold" style={{ color: phase.color, filter: "brightness(0.7)" }}>
                    <span>{dayNum}</span>
                    {isToday && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500 text-white font-semibold">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Indicators for log/moods */}
                  <div className="space-y-0.5 text-[10px]" style={{ color: phase.color, filter: "brightness(0.7)" }}>
                    {dayLog && (dayLog.moods?.length > 0 || dayLog.symptoms?.length > 0) && (
                      <div className="truncate font-semibold flex items-center gap-1">
                        <FaRegSmile className="text-pink-500" />
                        <span>{dayLog.moods[0] || dayLog.symptoms[0]}</span>
                      </div>
                    )}

                    <div className="text-[9px] opacity-75 truncate">{phase.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Year View Summary */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, mIdx) => {
            const mNum = mIdx + 1;
            const mName = new Date(currentYear, mIdx, 1).toLocaleString("default", {
              month: "short",
            });
            const daysInM = new Date(currentYear, mNum, 0).getDate();

            return (
              <div
                key={mNum}
                onClick={() => {
                  onChangeMonthYear(currentYear, mNum);
                  setViewMode("month");
                }}
                className="bg-surface border border-theme hover:border-pink-500/50 rounded-xl p-3 cursor-pointer transition-all hover:shadow-md space-y-2"
              >
                <h4 className="font-bold text-sm text-primary flex items-center justify-between">
                  <span>{mName}</span>
                  <span className="text-xs text-secondary font-normal">Click to view</span>
                </h4>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: daysInM }).map((_, dIdx) => {
                    const dObj = new Date(currentYear, mIdx, dIdx + 1);
                    const p = getPhaseForDate(dObj);
                    return (
                      <div
                        key={dIdx}
                        style={{
                          backgroundColor: hexToRgba(p.color, 0.2),
                          borderColor: hexToRgba(p.color, 0.6)
                        }}
                        className="h-2.5 rounded-sm border"
                        title={`${dObj.toLocaleDateString()}: ${p.name}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


