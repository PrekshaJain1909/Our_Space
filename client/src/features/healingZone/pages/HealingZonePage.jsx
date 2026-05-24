import React, { useState, useContext } from "react";
import "../components/HealingZone.css";

import HealingEntryForm from "../components/HealingEntryForm";
import PromiseEntryForm from "../components/PromiseEntryForm";
import PromiseList from "../components/PromiseList";
import ForgivenessForm from "../components/ForgivenessForm";
// import ForgivenessPanel from '../../../components/ForgivenessPanel';
import CoupleContext from '../../../context/CoupleContext';
import HealingEntriesTable from "../components/HealingEntriesTable";
import HealingStats from "../components/HealingStats";
import SpinWheelNeon from "../components/SpinWheelNeon";
import { useHealing } from "../context/HealingContext";
import RecentEntries from "../components/RecentEntries";
import ConfirmationModal from "../components/ConfirmationModal";

function HealingZoneInner() {
  const [activeTab, setActiveTab] = useState("entry");
  const [forgivenessList, setForgivenessList] = useState([]);
  const { couple } = useContext(CoupleContext);

  const {
    entries,
    promises,
    loading,
    addEntry,
    completeEntry,
    addPromise,
  } = useHealing();
  // include promise-specific complete function
  const { completePromise } = useHealing();

  // =========================
  // HANDLERS
  // =========================
  const handleAddEntry = addEntry;
  const handleAddPromise = addPromise;

  const handleAddForgiveness = (f) => {
    setForgivenessList((prev) => [f, ...prev]);
  };

  // =========================
  // CONFIRMATION MODAL STATE
  // =========================
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Open modal first
  const handleRequestComplete = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  // ===== Promise confirmation state & handlers =====
  const [promiseConfirmOpen, setPromiseConfirmOpen] = useState(false);
  const [promiseConfirmId, setPromiseConfirmId] = useState(null);
  const [promiseConfirmLoading, setPromiseConfirmLoading] = useState(false);

  const handleRequestCompletePromise = (id) => {
    setPromiseConfirmId(id);
    setPromiseConfirmOpen(true);
  };

  const handleConfirmCompletePromise = async () => {
    if (!promiseConfirmId) return;
    try {
      setPromiseConfirmLoading(true);
      await completePromise(promiseConfirmId);
      setPromiseConfirmOpen(false);
      setPromiseConfirmId(null);
      console.log('Promise marked as completed');
    } catch (err) {
      console.error('Promise completion failed:', err);
    } finally {
      setPromiseConfirmLoading(false);
    }
  };

  const handleCancelCompletePromise = () => {
    setPromiseConfirmOpen(false);
    setPromiseConfirmId(null);
  };

  // Confirm completion
  const handleConfirmComplete = async () => {
    if (!confirmId) return;

    try {
      setConfirmLoading(true);

      await completeEntry(confirmId);

      // Close modal
      setConfirmOpen(false);
      setConfirmId(null);

      // Optional success feedback
      console.log("Entry marked as completed");
    } catch (err) {
      console.error("Completion failed:", err);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Cancel modal
  const handleCancelComplete = () => {
    setConfirmOpen(false);
    setConfirmId(null);
  };

  // =========================
  // TABS
  // =========================
  const tabs = [
    { id: "entry", label: "Mistake & Punishment" },
    { id: "promise", label: "Promises" },
    { id: "forgive", label: "Forgiveness" },
    { id: "generator", label: "Punishment Generator" },
    { id: "list", label: "Entries List" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <>
      <div className="healing-wrapper">
        <div className="healing-overlay" />

        <div className="healing-inner">
          {/* ================= HEADER ================= */}
          <header className="healing-header">
            <p className="healing-badge">Healing Zone</p>

            <h1 className="healing-title">
              Where “sorry” gets a cute follow-up.
            </h1>

            <p className="healing-subtitle">
              Track mistakes, promises, punishments and forgiveness — so fights
              end cutely, not badly. 💗
            </p>
          </header>

          {/* ================= TABS ================= */}
          <div className="healing-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`healing-tab-btn ${
                  activeTab === tab.id
                    ? "healing-tab-btn-active"
                    : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ================= TAB CONTENT ================= */}
          <section className="healing-tab-content">

            {/* ENTRY TAB */}
            {activeTab === "entry" && (
              <div className="healing-block">
                <HealingEntryForm onAddEntry={handleAddEntry} />

                {/* RECENT ENTRIES BELOW FORM */}
                <RecentEntries
                  onRequestComplete={handleRequestComplete}
                />
              </div>
            )}

            {/* PROMISE TAB */}
            {activeTab === "promise" && (
              <div className="healing-block">
                <PromiseEntryForm onAddPromise={handleAddPromise} />

                {/* Show promises below form */}
                <PromiseList onRequestComplete={handleRequestCompletePromise} />
              </div>
            )}

            {/* FORGIVENESS TAB */}
            {activeTab === "forgive" && (
              <div className="healing-block">
                <ForgivenessForm
                  entries={entries}
                  onAddForgiveness={handleAddForgiveness}
                />

                {/* Live forgiveness panel (optimistic + real-time) */}
                
              </div>
            )}

            {/* GENERATOR TAB */}
            {activeTab === "generator" && (
              <div className="healing-block">
                <div className="hz-card">
                  <div className="hz-header">
                    <span className="hz-badge">
                      Punishment Generator
                    </span>

                    <p className="hz-subtitle">
                      Spin the wheel and let fate decide the cute
                      punishment. 🎡
                    </p>
                  </div>

                  <div className="hz-spin-wrapper">
                    <SpinWheelNeon />
                  </div>
                </div>
              </div>
            )}

            {/* ENTRIES LIST TAB */}
            {activeTab === "list" && (
              <div className="healing-block">
                {(() => {
                  // Normalize id and dedupe by id (prefer non-temp server items)
                  const list = [
                    ...entries.map((item) => ({ ...item, type: 'healing', id: item.id || item._id })),
                    ...promises.map((item) => ({ ...item, type: 'promise', id: item.id || item._id })),
                  ];

                  const byId = new Map();
                  for (const it of list) {
                    const key = it.id || `noid:${JSON.stringify(it)}`;
                    const existing = byId.get(key);
                    if (!existing) {
                      byId.set(key, it);
                    } else {
                      // prefer existing server-sourced item over temp items (ids that start with 'temp')
                      const existingIsTemp = String(existing.id).startsWith('temp');
                      const itIsTemp = String(it.id).startsWith('temp');
                      if (existingIsTemp && !itIsTemp) {
                        byId.set(key, it);
                      } else if (!existingIsTemp && itIsTemp) {
                        // keep existing
                      } else {
                        // fallback: keep newer createdAt
                        const eTime = new Date(existing.createdAt).getTime() || 0;
                        const iTime = new Date(it.createdAt).getTime() || 0;
                        if (iTime > eTime) byId.set(key, it);
                      }
                    }
                  }

                  const combinedEntries = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                  return (
                    <HealingEntriesTable
                      entries={combinedEntries}
                      onRequestComplete={(entry) => {
                        // route to the correct confirmation modal based on type
                        if (entry?.type === 'promise') {
                          handleRequestCompletePromise(entry.id);
                        } else {
                          handleRequestComplete(entry.id);
                        }
                      }}
                    />
                  );
                })()}
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === "stats" && (
              <div className="healing-block">
                <HealingStats
                  entries={entries}
                  forgivenessList={forgivenessList}
                  maleLabel="Him"
                  femaleLabel="Her"
                />
              </div>
            )}

          </section>
        </div>
      </div>

      {/* ================= CONFIRMATION MODAL ================= */}
      <ConfirmationModal
        open={confirmOpen}
        title="Confirm completion"
        message="Are you sure this punishment/task is completed? 💖"
        onConfirm={handleConfirmComplete}
        onCancel={handleCancelComplete}
        loading={confirmLoading}
      />

      {/* Promise confirmation modal (reuses same component) */}
      <ConfirmationModal
        open={promiseConfirmOpen}
        title="Confirm completion"
        message="Are you sure this promise has been fulfilled? 💖"
        onConfirm={handleConfirmCompletePromise}
        onCancel={handleCancelCompletePromise}
        loading={promiseConfirmLoading}
      />
    </>
  );
}

export default function HealingZonePage() {
  return <HealingZoneInner />;
}