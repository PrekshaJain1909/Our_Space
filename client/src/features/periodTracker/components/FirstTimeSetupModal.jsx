import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PERIOD_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);
const CYCLE_MIN = 21;
const CYCLE_MAX = 40;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCalendarMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const matrix = Array.from({ length: firstDay }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    matrix.push(day);
  }
  return matrix;
};

export default function FirstTimeSetupModal({
  isOpen,
  onSave,
  isSaving,
  initialData,
  userGender,
}) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(
    initialData?.lastPeriodStart
      ? new Date(initialData.lastPeriodStart).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [periodLength, setPeriodLength] = useState(initialData?.periodLength || 5);
  const [cycleLength, setCycleLength] = useState(initialData?.cycleLength || 28);
  const gender = userGender || "female";

  useEffect(() => {
    if (!isOpen) return;
    const date = initialData?.lastPeriodStart
      ? new Date(initialData.lastPeriodStart)
      : new Date();

    setSelectedDate(date.toISOString().split("T")[0]);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setPeriodLength(initialData?.periodLength || 5);
    setCycleLength(initialData?.cycleLength || 28);
    setStep(1);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const selectedDateObj = new Date(selectedDate);
  const selectedDisplay = formatDate(selectedDate);
  const predictedNext = new Date(selectedDateObj);
  predictedNext.setDate(predictedNext.getDate() + cycleLength);
  const ovulationDate = new Date(predictedNext);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  const calendarDays = useMemo(
    () => getCalendarMatrix(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth]
  );

  const handlePrevMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const handleSave = () => {
    onSave({
      lastPeriodStart: selectedDate,
      cycleLength,
      periodLength,
      gender,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-theme bg-surface text-primary shadow-2xl">
        <div className="border-b border-theme bg-surface-subtle p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                Premium Onboarding
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-primary">
                Couple Period Tracker Setup
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-secondary">
                Start with your most recent period and build automatic phase predictions for your shared cycle.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                "Date",
                "Period",
                "Cycle",
                "Review",
              ].map((label, index) => (
                <div
                  key={label}
                  className={`rounded-3xl border px-4 py-3 text-center text-xs uppercase tracking-[0.35em] font-semibold transition ${
                    step === index + 1
                      ? "border-pink-500 bg-pink-500/10 text-pink-500"
                      : "border-theme bg-surface text-secondary"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                    Step 1 of 4
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-primary">Choose Last Period Started</h3>
                </div>
                <div className="rounded-3xl border border-theme bg-surface px-4 py-3 text-sm text-secondary">
                  Selected Date
                  <div className="mt-2 text-lg font-semibold text-primary">{selectedDisplay}</div>
                </div>
              </div>

              <div className="rounded-[32px] border border-theme bg-surface-subtle p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="text-lg font-semibold text-primary">
                    {calendarMonth.toLocaleString(undefined, { month: "long" })} {calendarMonth.getFullYear()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="grid h-11 w-11 place-items-center rounded-2xl border border-theme bg-surface text-secondary transition hover:border-pink-500 hover:text-pink-600"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="grid h-11 w-11 place-items-center rounded-2xl border border-theme bg-surface text-secondary transition hover:border-pink-500 hover:text-pink-600"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 pb-3 text-xs uppercase tracking-[0.2em] text-secondary">
                  {WEEKDAYS.map((label) => (
                    <div key={label} className="text-center font-semibold">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {calendarDays.map((day, idx) => {
                    const date = day
                      ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
                      : null;
                    const dateValue = date ? date.toISOString().split("T")[0] : "";
                    const isSelected = dateValue === selectedDate;
                    const isToday = dateValue === new Date().toISOString().split("T")[0];

                    return (
                      <button
                        key={`${dateValue}-${idx}`}
                        type="button"
                        onClick={() => date && setSelectedDate(dateValue)}
                        disabled={!date}
                        className={`min-h-[76px] rounded-[24px] border p-3 text-left transition duration-200 ${
                          date
                            ? isSelected
                              ? "border-pink-500 bg-gradient-to-br from-pink-500/15 to-purple-500/10 text-primary shadow-md"
                              : "border-theme bg-surface hover:border-pink-500 hover:bg-surface-subtle"
                            : "border-transparent bg-transparent"
                        } ${isToday ? "ring-2 ring-pink-500/40" : ""}`}
                      >
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>{day || ""}</span>
                          {isToday && <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] text-pink-500">Today</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                  Step 2 of 4
                </p>
                <h3 className="mt-2 text-2xl font-bold text-primary">Choose Period Length</h3>
                <p className="mt-2 text-sm text-secondary max-w-2xl">
                  Select how many days your period usually lasts. The app will set the start and end automatically.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPeriodLength(option)}
                    className={`rounded-3xl border px-4 py-5 text-lg font-semibold transition ${
                      periodLength === option
                        ? "border-pink-500 bg-pink-500/10 text-pink-500 shadow"
                        : "border-theme bg-surface text-primary hover:border-pink-500"
                    }`}
                  >
                    {option}d
                  </button>
                ))}
              </div>

              <div className="rounded-[32px] border border-theme bg-surface-subtle p-5 text-sm text-secondary">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-secondary font-semibold">
                  Live period preview
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-3xl border border-theme bg-surface p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-secondary">Period Start</div>
                    <div className="mt-2 text-lg font-semibold text-primary">{selectedDisplay}</div>
                  </div>
                  <div className="rounded-3xl border border-theme bg-surface p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-secondary">Period End</div>
                    <div className="mt-2 text-lg font-semibold text-primary">
                      {new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate() + periodLength - 1).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                  Step 3 of 4
                </p>
                <h3 className="mt-2 text-2xl font-bold text-primary">Choose Average Cycle Length</h3>
                <p className="mt-2 text-sm text-secondary max-w-2xl">
                  Use the slider to choose a typical cycle length, then preview your next prediction instantly.
                </p>
              </div>

              <div className="rounded-[32px] border border-theme bg-surface-subtle p-6">
                <div className="flex items-center justify-between gap-4 pb-4">
                  <div>
                    <p className="text-sm text-secondary">Cycle Length</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{cycleLength} Days</p>
                  </div>
                  <div className="rounded-3xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-4 py-3 text-center text-xs uppercase tracking-[0.25em] text-pink-500 font-semibold">
                    Premium progress
                  </div>
                </div>
                <input
                  type="range"
                  min={CYCLE_MIN}
                  max={CYCLE_MAX}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-theme bg-surface p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-secondary">Predicted Next Period</div>
                    <div className="mt-3 text-lg font-semibold text-primary">{formatDate(predictedNext.toISOString().split("T")[0])}</div>
                  </div>
                  <div className="rounded-3xl border border-theme bg-surface p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-secondary">Next Ovulation</div>
                    <div className="mt-3 text-lg font-semibold text-primary">{formatDate(ovulationDate.toISOString().split("T")[0])}</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">
                  Step 4 of 4
                </p>
                <h3 className="mt-2 text-2xl font-bold text-primary">Review your cycle setup</h3>
                <p className="mt-2 text-sm text-secondary max-w-2xl">
                  Confirm your shared cycle settings before saving. Everything will automatically update for both partners.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Last Period", value: selectedDisplay },
                  { label: "Cycle Length", value: `${cycleLength} Days` },
                  { label: "Period Length", value: `${periodLength} Days` },
                  { label: "Predicted Next", value: formatDate(predictedNext.toISOString().split("T")[0]) },
                  { label: "Next Ovulation", value: formatDate(ovulationDate.toISOString().split("T")[0]) },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-theme bg-surface p-5">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-secondary font-semibold">
                      {item.label}
                    </div>
                    <div className="mt-4 text-lg font-bold text-primary">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-theme bg-surface-subtle p-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="rounded-3xl border border-theme bg-surface px-5 py-3 text-sm font-semibold text-secondary transition hover:border-pink-500 hover:text-pink-600 disabled:opacity-50"
          >
            Back
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.min(4, prev + 1))}
                className="rounded-3xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-pink-600"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : (
                  <span className="inline-flex items-center gap-2"><FaCheck /> Save Settings</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
