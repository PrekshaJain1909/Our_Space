import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaHandsHelping, FaRegHeart, FaDice, FaListUl, FaChartBar } from "react-icons/fa";
import "../components/HealingZone.css";

import HealingEntryForm from "../components/HealingEntryForm";
import PromiseSection from "../components/PromiseSection";
import ForgivenessForm from "../components/ForgivenessForm";
import HealingEntriesTable from "../components/HealingEntriesTable";
import HealingStats from "../components/HealingStats";
import SpinWheelNeon from "../components/SpinWheelNeon";
import { useHealing } from "../context/HealingContext";
import RecentEntries from "../components/RecentEntries";
import ConfirmationModal from "../components/ConfirmationModal";

function HealingZoneInner() {
  const [activeSection, setActiveSection] = useState(null);
  const [forgivenessList, setForgivenessList] = useState([]);

  const {
    entries,
    promises,
    addEntry,
    completeEntry,
    editEntry,
    deleteEntry,
    forgiveEntry,
    addPromise,
    completePromise,
    editPromise,
    deletePromise,
  } = useHealing();

  // =========================
  // HANDLERS
  // =========================
  const handleAddEntry = addEntry;
  const handleAddPromise = addPromise;

  const handleAddForgiveness = (f) => {
    setForgivenessList((prev) => [f, ...prev]);
  };

  const handleForgiveEntry = async (entry) => {
    if (!entry?.id) return;
    try {
      await forgiveEntry(entry.id, `Forgiven from the punishment card.`);
    } catch (err) {
      console.error('Forgiveness failed:', err);
    }
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
  // SECTIONS
  // =========================
  const sections = [
    { id: "entry", label: "Mistakes", subtitle: "Log disagreements", icon: <FaHeart /> },
    { id: "promise", label: "Promises", subtitle: "Keep your promises", icon: <FaHandsHelping /> },
    { id: "forgive", label: "Forgiveness", subtitle: "Celebrate forgiveness", icon: <FaRegHeart /> },
    { id: "generator", label: "Punishment Generator", subtitle: "Generate cute punishments", icon: <FaDice /> },
    { id: "list", label: "Entries", subtitle: "View healing history", icon: <FaListUl /> },
    { id: "stats", label: "Statistics", subtitle: "Relationship insights", icon: <FaChartBar /> },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "entry":
        return (
          <div className="healing-block">
            <HealingEntryForm onAddEntry={handleAddEntry} />
            <RecentEntries onRequestComplete={handleRequestComplete} />
          </div>
        );
      case "promise":
        return (
          <div className="healing-block">
            <PromiseSection />
          </div>
        );
      case "forgive":
        return (
          <div className="healing-block">
            <ForgivenessForm entries={entries} onAddForgiveness={handleAddForgiveness} />
          </div>
        );
      case "generator":
        return (
          <div className="healing-block">
            <div className="hz-card">
              <div className="hz-header">
                <span className="hz-badge">Punishment Generator</span>
                <p className="hz-subtitle">Spin the wheel and let fate decide the cute punishment. 🎡</p>
              </div>
              <div className="hz-spin-wrapper">
                <SpinWheelNeon />
              </div>
            </div>
          </div>
        );
      case "list":
        return (
          <div className="healing-block">
            {(() => {
              const list = [
                ...entries.map((item) => ({ ...item, type: "healing", id: item.id || item._id })),
                ...promises.map((item) => ({ ...item, type: "promise", id: item.id || item._id })),
              ];

              const byId = new Map();
              for (const it of list) {
                const key = it.id || `noid:${JSON.stringify(it)}`;
                const existing = byId.get(key);
                if (!existing) {
                  byId.set(key, it);
                } else {
                  const existingIsTemp = String(existing.id).startsWith("temp");
                  const itIsTemp = String(it.id).startsWith("temp");
                  if (existingIsTemp && !itIsTemp) {
                    byId.set(key, it);
                  } else if (!existingIsTemp && itIsTemp) {
                    // keep existing
                  } else {
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
                    if (entry?.type === "promise") {
                      handleRequestCompletePromise(entry.id);
                    } else {
                      handleRequestComplete(entry.id);
                    }
                  }}
                  onCompleteEntry={(entry) => completeEntry(entry.id)}
                  onCompletePromise={(entry) => completePromise(entry.id)}
                  onEditEntry={(entry, payload) => editEntry(entry.id, payload)}
                  onEditPromise={(entry, payload) => editPromise(entry.id, payload)}
                  onDeleteEntry={(entry) => deleteEntry(entry.id)}
                  onDeletePromise={(entry) => deletePromise(entry.id)}
                  onForgiveEntry={handleForgiveEntry}
                />
              );
            })()}
          </div>
        );
      case "stats":
        return (
          <div className="healing-block">
            <HealingStats entries={entries} forgivenessList={forgivenessList} maleLabel="Him" femaleLabel="Her" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="healing-wrapper">
        <div className="healing-overlay" />

        <div className="healing-inner">
          <motion.div
            className="healing-experience-shell"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {activeSection === null ? (
                <motion.div
                  key="landing"
                  className="healing-landing-shell"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28 }}
                >
                  <header className="healing-hero-card">
                    <div className="healing-hero-glow" />
                    <p className="healing-badge">❤️‍🩹 Healing Zone</p>

                    <h1 className="healing-title">
                      A safe place where every misunderstanding becomes an opportunity to grow together.
                    </h1>

                    <p className="healing-subtitle">
                      Track mistakes, promises, punishments, forgiveness, and healing progress.
                    </p>
                  </header>

                  <div className="healing-nav-grid">
                    {sections.map((section) => (
                      <motion.button
                        key={section.id}
                        type="button"
                        className="healing-nav-card"
                        onClick={() => setActiveSection(section.id)}
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="healing-nav-content">
                          <span className="healing-nav-icon">{section.icon}</span>
                          <span className="healing-nav-copy">
                            <span className="healing-nav-title">{section.label}</span>
                            <span className="healing-nav-subtitle">{section.subtitle}</span>
                          </span>
                        </span>
                        <span className="healing-nav-arrow" aria-hidden="true">→</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeSection}
                  className="healing-module-shell"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28 }}
                >
                  <motion.button
                    type="button"
                    className="healing-back-btn"
                    onClick={() => setActiveSection(null)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.26 }}
                  >
                    ← Back to Healing Zone
                  </motion.button>

                  <div className="healing-module-content">
                    {renderActiveSection()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <ConfirmationModal
        open={confirmOpen}
        title="Confirm completion"
        message="Are you sure this punishment/task is completed? 💖"
        onConfirm={handleConfirmComplete}
        onCancel={handleCancelComplete}
        loading={confirmLoading}
      />

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