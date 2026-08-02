import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaRegSmile } from "react-icons/fa";
import { toLocalDate, toLocalDateString } from "../utils/dateUtils";

const DEFAULT_PHASES = [
  {
    key: "period",
    emoji: "🩸",
    name: "Period Days",
    desc: "Rest and hydration",
    color: "#FCA5A5",
    enabled: true,
    order: 0,
    isCustom: false,
    offsetStart: 0,
    offsetEnd: null,
  },
  {
    key: "takeCare",
    emoji: "☁️",
    name: "Take Care Days",
    desc: "Period may be approaching; cravings or bloating possible",
    color: "#FDBA74",
    enabled: true,
    order: 1,
    isCustom: false,
    offsetStart: -1,
    offsetEnd: -1,
  },
  {
    key: "freshStart",
    emoji: "✨",
    name: "Fresh Start",
    desc: "Recovery and renewed energy",
    color: "#86EFAC",
    enabled: true,
    order: 2,
    isCustom: false,
    offsetStart: 1,
    offsetEnd: 4,
  },
  {
    key: "bestDays",
    emoji: "🌟",
    name: "Best Days",
    desc: "Energetic and confident",
    color: "#FDE047",
    enabled: true,
    order: 3,
    isCustom: false,
    offsetStart: 8,
    offsetEnd: 14,
  },
  {
    key: "calmDays",
    emoji: "🌿",
    name: "Calm Days",
    desc: "Balanced phase",
    color: "#A7F3D0",
    enabled: true,
    order: 4,
    isCustom: false,
    offsetStart: 15,
    offsetEnd: 22,
  },
];

const normalizeDate = (dateInput) => toLocalDate(dateInput);

const addDays = (dateInput, days) => {
  const date = normalizeDate(dateInput);
  if (!date) return null;
  date.setDate(date.getDate() + Number(days));
  return date;
};

const getPredictedStartDate = (lastPeriodStart, cycleLength = 28) => {
  if (!lastPeriodStart) return null;
  return addDays(lastPeriodStart, Math.max(0, Number(cycleLength)));
};

const getRangeFromOffset = (offset, cycleLength, periodLength = 5) => {
  if (!Number.isFinite(offset)) return null;
  if (offset >= 0) {
    return Number(periodLength) + Number(offset);
  }
  return cycleLength + offset + 1;
};

const clampPhaseBounds = (startDay, endDay, cycleLength) => {
  const normalizedStart = Math.max(1, Math.min(startDay, cycleLength));
  const normalizedEnd = Math.max(1, Math.min(endDay, cycleLength));
  return [Math.min(normalizedStart, normalizedEnd), Math.max(normalizedStart, normalizedEnd)];
};

function buildPhaseSchedule(phases = [], cycleLength = 28, periodLength = 5) {
  const sorted = [...phases]
    .filter((phase) => phase.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const schedule = [];
  const effectivePeriodLength = Math.min(Math.max(Number(periodLength) || 1, 1), Number(cycleLength) || 28);

  const periodPhase = sorted.find((phase) => phase.key === "period");
  if (periodPhase) {
    schedule.push({
      ...periodPhase,
      startDay: 1,
      endDay: Math.min(effectivePeriodLength, cycleLength),
    });
  }

  sorted
    .filter((phase) => phase.key !== "period")
    .forEach((phase) => {
      const startDay = getRangeFromOffset(phase.offsetStart ?? 0, cycleLength, effectivePeriodLength);
      const endDay = getRangeFromOffset(
        Number.isFinite(phase.offsetEnd) ? phase.offsetEnd : phase.offsetStart,
        cycleLength,
        effectivePeriodLength
      );
      if (startDay === null || endDay === null) return;
      const [normalizedStart, normalizedEnd] = clampPhaseBounds(startDay, endDay, cycleLength);
      if (normalizedStart > normalizedEnd) return;
      schedule.push({
        ...phase,
        startDay: normalizedStart,
        endDay: normalizedEnd,
      });
    });

  return schedule;
}

// Helper to calculate lighter background color based on hex or rgb strings
const hexToRgba = (color, alpha) => {
  if (!color) return `rgba(200, 200, 200, ${alpha})`;

  const trimmed = color.trim();
  if (trimmed.startsWith("rgb")) {
    const nums = trimmed
      .replace(/rgba?\(|\)|\s/g, "")
      .split(",")
      .map((value) => Number(value));
    const [r, g, b] = nums;
    return `rgba(${r || 200}, ${g || 200}, ${b || 200}, ${alpha})`;
  }

  const cleanHex = trimmed.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16) || 200;
    const g = parseInt(cleanHex.slice(2, 4), 16) || 200;
    const b = parseInt(cleanHex.slice(4, 6), 16) || 200;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return `rgba(200, 200, 200, ${alpha})`;
};

export default function PeriodCalendarView({
  settings,
  baseStartDate,
  logs = [],
  surprises = [],
  onOpenPhaseStudio,
  onSelectDate,
  selectedDate,
  currentYear,
  currentMonth,
  onChangeMonthYear,
}) {
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'year'

  const cycleLength = Number(settings?.cycleLength) || 28;
  const startRef = baseStartDate ? normalizeDate(baseStartDate) : normalizeDate(new Date());
  const predictedNextStart = getPredictedStartDate(startRef, cycleLength);
  const today = normalizeDate(new Date());

  const dayPhases = buildPhaseSchedule(
    (settings?.phases?.length > 0 ? settings.phases : DEFAULT_PHASES).map((phase, index) => ({
      ...phase,
      order: phase.order ?? index,
      enabled: phase.enabled !== false,
      emoji: phase.emoji || "✨",
      color: phase.color || "#D1D5DB",
      offsetStart:
        phase.offsetStart !== undefined && !Number.isNaN(Number(phase.offsetStart))
          ? Number(phase.offsetStart)
          : 0,
      offsetEnd:
        phase.offsetEnd !== undefined && !Number.isNaN(Number(phase.offsetEnd))
          ? Number(phase.offsetEnd)
          : phase.offsetStart !== undefined && !Number.isNaN(Number(phase.offsetStart))
          ? Number(phase.offsetStart)
          : 0,
    })),
    cycleLength,
    Number(settings?.periodLength) || 5
  );

  const activePhases = dayPhases.filter((phase) => phase.enabled);
  const pendingPeriodExtension = predictedNextStart && today >= predictedNextStart;

  // Helper to determine phase of any specific Date
  const getPhaseForDate = (date) => {
    const d = normalizeDate(date);
    if (!d) {
      return {
        key: "unknown",
        dayInCycle: 0,
        name: "No phase",
        desc: "Invalid date",
        color: "#D1D5DB",
      };
    }

    const diffDays = Math.floor((d.getTime() - startRef.getTime()) / (1000 * 60 * 60 * 24));
    let cyclePos = diffDays % cycleLength;
    if (cyclePos < 0) cyclePos += cycleLength;
    const dayInCycle = cyclePos + 1;

    if (pendingPeriodExtension && d >= predictedNextStart && d <= today) {
      const periodPhase = activePhases.find((phase) => phase.key === "period");
      return {
        phaseKey: "period",
        dayInCycle,
        name: periodPhase?.name || "Period Days",
        desc: periodPhase?.desc || "Rest and hydration",
        color: periodPhase?.color || "#FCA5A5",
        emoji: periodPhase?.emoji || "🩸",
        isCustom: periodPhase?.isCustom,
        startDay: 1,
        endDay: Math.min(Number(settings?.periodLength) || 5, cycleLength),
      };
    }

    const matchedPhase = activePhases.find((p) => dayInCycle >= p.startDay && dayInCycle <= p.endDay);

    if (matchedPhase) {
      return { dayInCycle, ...matchedPhase };
    }

    return {
      key: "unknown",
      dayInCycle,
      name: "Unassigned Days",
      desc: "No phase configured",
      color: "#D1D5DB",
      emoji: "✨",
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary font-semibold">
            Phase Studio
          </p>
          <p className="text-sm text-primary">Your active phase legend</p>
        </div>
        <button
          onClick={onOpenPhaseStudio}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-theme bg-surface-subtle text-xs font-semibold text-secondary hover:border-pink-500 hover:text-pink-600 transition-all"
        >
          ⚙ Manage Phases
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {activePhases.map((config) => (
          <div
            key={config.key}
            style={{ 
              backgroundColor: hexToRgba(config.color, 0.15),
              borderColor: hexToRgba(config.color, 0.5) 
            }}
            className="p-2.5 rounded-xl border flex flex-col justify-between text-xs space-y-1"
          >
            <div className="font-bold flex items-center gap-2">
              <span>{config.emoji}</span>
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
              const isToday = toLocalDateString(new Date()) === dateStr;
              const isSelected = selectedDate === dateStr;

              const dayLog = logs.find((l) => l.date === dateStr);
 
              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr, phase)}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${hexToRgba(phase.color, 0.2)}, ${hexToRgba(phase.color, 0.07)})`
                      : hexToRgba(phase.color, 0.12),
                    borderColor: hexToRgba(phase.color, 0.45),
                  }}
                  className={`h-24 rounded-[28px] border p-3 flex flex-col justify-between text-left transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg relative ${isToday ? "ring-2 ring-pink-500 font-bold" : ""}`}
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
 
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px]">{phase.emoji}</span>
                      <span className="text-[9px] opacity-75 truncate">{phase.name}</span>
                    </div>
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


