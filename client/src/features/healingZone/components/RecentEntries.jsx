import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Heart,
  Gift,
  Notebook,
  Calendar,
  User,
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
  Clock,
  Search,
  Filter,
  Loader2,
  Edit,
} from 'lucide-react';
import './HealingZone.css';
import { useHealing } from '../context/HealingContext';
import { showSuccessToast, showThemeAlert } from '../../../utils/swalTheme';
import { useTheme } from '../../../hooks/useTheme';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'mine', label: 'Mine' },
  { value: 'partner', label: 'Partner' },
];

export default function RecentEntries({ max = 6 }) {
  const { entries = [], completeEntry, reopenEntry, editEntry, deleteEntry } = useHealing();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({ reason: '', punishment: '', description: '' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const theme = useTheme();
  const selectedStatus = selectedEntry ? getStatus(selectedEntry) : 'pending';
  const isSelectedCompleted = selectedStatus === 'completed' || selectedStatus === 'forgiven';

  useEffect(() => {
    if (!selectedEntry) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedEntry]);

  const currentUserName = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return (user?.name || user?.email || '').toLowerCase();
    } catch {
      return '';
    }
  }, []);

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = (entries || []).filter((entry) => {
      const status = getStatus(entry);
      const matchesFilter = (() => {
        switch (filter) {
          case 'pending':
            return status === 'pending';
          case 'completed':
            return status === 'completed';
          case 'active':
            return status === 'pending';
          case 'forgiven':
            return status === 'forgiven';
          case 'mine':
            return [entry.apologizer, entry.raw?.from].some((value) => String(value || '').toLowerCase().includes(currentUserName));
          case 'partner':
            return ![entry.apologizer, entry.raw?.from].some((value) => String(value || '').toLowerCase().includes(currentUserName));
          default:
            return true;
        }
      })();

      if (!matchesFilter) return false;
      if (!term) return true;

      const haystack = [entry.reason, entry.punishment, entry.description, entry.apologizer, entry.forgiver, entry.raw?.from, entry.raw?.to]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, max);
  }, [currentUserName, entries, filter, max, search]);

  function closeModal() {
    setSelectedEntry(null);
    setIsEditing(false);
    setEditDraft({ reason: '', punishment: '', description: '' });
  }

  const openModal = (entry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
    setEditDraft({
      reason: entry?.reason || entry?.why || '',
      punishment: entry?.punishment || '',
      description: entry?.description || '',
    });
  };

  const promptToast = (icon, title, text) => {
    if (icon === 'success') {
      showSuccessToast(theme, {
        icon,
        title,
        text,
      });
    } else {
      showThemeAlert(theme, {
        icon,
        title,
        text,
        showConfirmButton: true,
        showCancelButton: false,
      });
    }
  };

  const handleToggleStatus = async (entry) => {
    if (!entry?.id || busyId) return;
    setBusyId(entry.id);
    const status = getStatus(entry);
    const isCompleted = status === 'completed' || status === 'forgiven';
    try {
      const confirmResult = await showThemeAlert(theme, {
        title: isCompleted ? 'Mark as pending?' : 'Mark as completed?',
        text: isCompleted
          ? 'This punishment will be reopened and moved back to pending.'
          : 'This punishment will be marked as completed.',
        icon: 'question',
        confirmText: isCompleted ? 'Reopen' : 'Yes',
        cancelText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          if (isCompleted) {
            await reopenEntry(entry.id);
          } else {
            await completeEntry(entry.id);
          }
          return true;
        },
      });

      if (!confirmResult.isConfirmed) return;

      Swal.close();

      if (selectedEntry?.id === entry.id) {
        setSelectedEntry((prev) => prev ? {
          ...prev,
          status: isCompleted ? 'pending' : 'completed',
          doneAt: isCompleted ? null : new Date().toISOString(),
          completedAt: isCompleted ? null : new Date().toISOString(),
        } : prev);
      }
      closeModal();
      promptToast('success', isCompleted ? '↩ Reopened' : '🎉 Great Job!', isCompleted ? 'Punishment moved back to pending.' : 'Punishment marked as completed.');
    } catch (error) {
      promptToast('error', '❌ Something went wrong', 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleStartEdit = () => {
    if (!selectedEntry) return;
    setEditDraft({
      reason: selectedEntry.reason || selectedEntry.why || '',
      punishment: selectedEntry.punishment || '',
      description: selectedEntry.description || '',
    });
    setIsEditing(true);
  };

  const handleEditFieldChange = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  const hasEditChanges = () => {
    if (!selectedEntry) return false;
    return ['reason', 'punishment', 'description'].some((field) => String(editDraft[field] || '').trim() !== String(selectedEntry[field] || '').trim());
  };

  const handleCloseEdit = async () => {
    if (!isEditing) return;

    if (!hasEditChanges()) {
      setIsEditing(false);
      setEditDraft({
        reason: selectedEntry?.reason || selectedEntry?.why || '',
        punishment: selectedEntry?.punishment || '',
        description: selectedEntry?.description || '',
      });
      return;
    }

    const confirmResult = await showThemeAlert(theme, {
      title: 'Discard changes?',
      text: 'Your edits will be lost.',
      icon: 'warning',
      confirmText: 'Discard',
      cancelText: 'Keep editing',
    });

    if (!confirmResult.isConfirmed) return;

    setIsEditing(false);
    setEditDraft({
      reason: selectedEntry?.reason || selectedEntry?.why || '',
      punishment: selectedEntry?.punishment || '',
      description: selectedEntry?.description || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedEntry?.id) return;

    if (!hasEditChanges()) {
      setIsEditing(false);
      return;
    }

    const payload = {
      reason: editDraft.reason.trim(),
      punishment: editDraft.punishment.trim(),
      description: editDraft.description.trim(),
    };

    setBusyId(selectedEntry.id);
    try {
      await editEntry(selectedEntry.id, payload);
      setSelectedEntry((prev) => prev ? {
        ...prev,
        reason: payload.reason,
        why: payload.reason,
        punishment: payload.punishment,
        description: payload.description,
      } : prev);
      setIsEditing(false);
      promptToast('success', '❤️ Saved Successfully', 'Your healing entry has been updated.');
    } catch (error) {
      promptToast('error', '❌ Something went wrong', 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (entry) => {
    if (!entry?.id) return;
    let deleteSucceeded = false;

    setBusyId(entry.id);
    try {
      const confirmResult = await showThemeAlert(theme, {
        title: 'Delete this punishment?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          await deleteEntry(entry.id);
          deleteSucceeded = true;
          return true;
        },
      });

      if (!confirmResult.isConfirmed || !deleteSucceeded) return;

      Swal.close();
      closeModal();
      promptToast('success', '🗑 Entry Deleted', 'The healing entry has been removed.');
    } catch (error) {
      promptToast('error', '❌ Something went wrong', 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const renderStatusBadge = (entry) => {
    const status = getStatus(entry);
    if (status === 'completed') {
      return <span className="hz-status hz-status-completed"><CheckCircle2 size={16} /> Completed</span>;
    }
    if (status === 'forgiven') {
      return <span className="hz-status hz-status-forgiven"><Heart size={16} /> Forgiven</span>;
    }
    return <span className="hz-status hz-status-pending"><Clock size={16} /> Pending</span>;
  };

  const renderCompactStatusBadge = (entry) => {
    const status = getStatus(entry);
    if (status === 'completed' || status === 'forgiven') {
      return <span className="hz-entry-status-badge completed"><CheckCircle2 size={14} /> Completed</span>;
    }

    return <span className="hz-entry-status-badge pending"><Clock size={14} /> Pending</span>;
  };

  const selectedReason = selectedEntry?.reason || selectedEntry?.why || 'Healing Entry';
  const selectedDate = formatDateParts(selectedEntry?.createdAt);
  const selectedStatusMeta = getStatusMeta(selectedStatus);
  const reasonValue = selectedEntry?.reason || selectedEntry?.why || 'No reason provided.';
  const punishmentValue = selectedEntry?.punishment || 'No punishment assigned.';
  const descriptionValue = selectedEntry?.description?.trim() ? selectedEntry.description : 'No description added.';
  const modalRoot = typeof document !== 'undefined' ? document.body : null;

  const hasEntries = (entries || []).length > 0;

  return (
    <div className="hz-card">
      <div className="hz-header-row">
        <div className="hz-header">
          <span className="hz-badge">Recent Entries</span>
          <p className="hz-subtitle">Latest mistakes & punishments</p>
        </div>

        <div className="hz-toolbar-actions">
          <label className="hz-search-field">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reason, punishment, person"
            />
          </label>

          <div className="hz-filter-wrap">
            <button type="button" className="hz-filter-btn" onClick={() => setFilterMenuOpen((prev) => !prev)}>
              <Filter size={16} /> Filter
            </button>

            {filterMenuOpen && (
              <div className="hz-filter-menu">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`hz-filter-option ${filter === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setFilter(option.value);
                      setFilterMenuOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!hasEntries ? (
        <div className="hz-empty-state">
          <div className="hz-empty-icon"><Heart size={24} /></div>
          <h3>No Healing Entries Yet</h3>
          <p>Start by adding your first mistake or promise.</p>
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="hz-empty-state compact">
          <div className="hz-empty-icon"><Heart size={24} /></div>
          <h3>No matching entries</h3>
          <p>Try broadening your search or filter.</p>
        </div>
      ) : (
        <div className="hz-table-list">
          {visibleEntries.map((entry) => {
            const status = getStatus(entry);
            const isCompleted = status === 'completed' || status === 'forgiven';
            return (
              <motion.article
                key={entry.id}
                layout
                whileHover={{ y: -3 }}
                onClick={() => openModal(entry)}
                className={`hz-entry-row ${isCompleted ? 'completed' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openModal(entry);
                  }
                }}
              >
                <div className="hz-entry-main">
                  <p className="hz-entry-who">
                    <span className="hz-chip hz-chip-apologizer">{entry.apologizer}</span>
                    <span className="hz-entry-arrow">→</span>
                    <span className="hz-chip hz-chip-forgiver">{entry.forgiver}</span>
                  </p>
                  <p className="hz-entry-punish">Punishment: <span>{entry.punishment || 'No punishment assigned'}</span></p>
                </div>

                <div className="hz-entry-meta">
                  <div className="hz-entry-status-row">
                    <button
                      type="button"
                      className={`hz-inline-toggle ${isCompleted ? 'completed' : 'pending'}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleStatus(entry);
                      }}
                      disabled={busyId === entry.id}
                      aria-label={isCompleted ? 'Mark entry as pending' : 'Mark entry as completed'}
                    >
                      {busyId === entry.id ? <Loader2 className="hz-spin" size={16} /> : <span>{isCompleted ? '☑' : '☐'}</span>}
                    </button>
                    {renderCompactStatusBadge(entry)}
                  </div>
                  <span className="hz-entry-date">{formatDate(entry.createdAt)}</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {modalRoot && selectedEntry ? createPortal(
        <AnimatePresence>
          <>
            <motion.div
              className="hz-healing-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.aside
              className="hz-healing-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="hz-mistake-details-title"
              style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 9999 }}
              transformTemplate={(transform) => `translate(-50%, -50%) ${transform}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="hz-sparkles-container" aria-hidden="true">
                <Sparkles className="hz-sparkle s1" size={14} />
                <Sparkles className="hz-sparkle s2" size={14} />
                <Sparkles className="hz-sparkle s3" size={14} />
              </div>

              <div className="hz-header-floating-hearts" aria-hidden="true">
                <Heart className="hz-hheart hh1" size={14} />
                <Heart className="hz-hheart hh2" size={15} />
                <Heart className="hz-hheart hh3" size={14} />
              </div>

              <div className="hz-modal-header">
                <div className="hz-modal-header-left hz-modal-header-with-hearts">
                  <p className="hz-modal-eyebrow">❤️ Mistake Details</p>

                </div>
                <button type="button" className="hz-modal-close-btn" onClick={closeModal} aria-label="Close mistake details modal">
                  <X size={18} />
                </button>
              </div>

              <div className="hz-modal-grid-4">
                <motion.div className="hz-modal-card pink" whileHover={{ y: -5, scale: 1.03 }} transition={{ duration: 0.22 }}>
                  <div className="hz-modal-icon-container"><User size={22} /></div>
                  <span className="hz-modal-card-label">Assigned To</span>
                  <div className="hz-modal-card-info hz-modal-avatar-group">
                    <div className="hz-modal-avatar-text-block">
                      <p className="hz-modal-card-value">{selectedEntry.apologizer || 'Your Partner'}</p>

                    </div>
                  </div>
                </motion.div>

                <motion.div className="hz-modal-card rose" whileHover={{ y: -5, scale: 1.03 }} transition={{ duration: 0.22 }}>
                  <div className="hz-modal-icon-container"><Heart size={22} /></div>
                  <span className="hz-modal-card-label">Given By</span>
                  <div className="hz-modal-card-info hz-modal-avatar-group">
                    <div className="hz-modal-avatar-text-block">
                      <p className="hz-modal-card-value">{selectedEntry.forgiver || 'With Love'}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="hz-modal-card" whileHover={{ y: -5, scale: 1.03 }} transition={{ duration: 0.22 }}>
                  <div className="hz-modal-icon-container"><Calendar size={22} /></div>
                  <span className="hz-modal-card-label">Created Date</span>
                  <div className="hz-modal-card-info">
                    <p className="hz-modal-card-value">{selectedDate.date}</p>
                    <span className="hz-modal-card-subtitle">{selectedDate.time}</span>
                  </div>
                </motion.div>

                <motion.div className="hz-modal-card" whileHover={{ y: -5, scale: 1.03 }} transition={{ duration: 0.22 }}>
                  <div className="hz-modal-icon-container"><Clock size={22} /></div>
                  <span className="hz-modal-card-label">Status</span>
                  <div className="hz-modal-card-info">
                    <span className={`hz-modal-status-badge ${selectedStatus}`}>{selectedStatusMeta.badgeIcon} {selectedStatusMeta.label}</span>

                    <span className="hz-modal-card-subtitle">{selectedStatusMeta.subtitle}</span>
                  </div>
                </motion.div>
              </div>

              {isEditing ? (
                <div className="hz-modal-edit-card">
                  <div className="hz-modal-edit-grid">
                    <label className="hz-modal-edit-field">
                      <span>Reason</span>
                      <textarea
                        rows={3}
                        value={editDraft.reason}
                        onChange={(event) => handleEditFieldChange('reason', event.target.value)}
                        placeholder="What happened?"
                      />
                    </label>
                    <label className="hz-modal-edit-field">
                      <span>Punishment</span>
                      <input
                        type="text"
                        value={editDraft.punishment}
                        onChange={(event) => handleEditFieldChange('punishment', event.target.value)}
                        placeholder="Punishment text"
                      />
                    </label>
                    <label className="hz-modal-edit-field wide">
                      <span>Description</span>
                      <textarea
                        rows={4}
                        value={editDraft.description}
                        onChange={(event) => handleEditFieldChange('description', event.target.value)}
                        placeholder="Add a gentle explanation"
                      />
                    </label>
                  </div>

                  <div className="hz-modal-edit-actions">
                    <button type="button" className="hz-modal-btn secondary" onClick={handleCloseEdit}>
                      Discard Changes
                    </button>
                    <button type="button" className="hz-modal-btn primary" onClick={handleSaveEdit} disabled={busyId === selectedEntry.id}>
                      {busyId === selectedEntry.id ? <Loader2 className="hz-spin" size={18} /> : <Edit size={18} />}
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <motion.div className="hz-modal-detail-stack" whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.22 }}>
                    <div className="hz-modal-detail-card">
                      <span className="hz-modal-detail-label">Reason</span>
                      <p className="hz-modal-detail-value">{reasonValue}</p>
                    </div>



                    <div className="hz-modal-detail-card wide">
                      <span className="hz-modal-detail-label">Description</span>
                      <p className="hz-modal-detail-value">{descriptionValue}</p>
                    </div>
                  </motion.div>
                </>
              )}

              <div className={`hz-modal-footer-grid ${isEditing ? 'editing' : 'view'}`}>
                {isEditing ? (
                  <>
                    <motion.button
                      type="button"
                      className="hz-modal-btn secondary compact"
                      onClick={handleCloseEdit}
                      disabled={busyId === selectedEntry.id}
                      whileTap={{ scale: 0.97 }}
                    >
                      <X size={16} />
                      Discard Changes
                    </motion.button>

                    <motion.button
                      type="button"
                      className="hz-modal-btn primary compact"
                      onClick={handleSaveEdit}
                      disabled={busyId === selectedEntry.id}
                      whileTap={{ scale: 0.97 }}
                    >
                      {busyId === selectedEntry.id ? <Loader2 className="hz-spin" size={16} /> : <Edit size={16} />}
                      Save Changes
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      className="hz-modal-btn primary compact"
                      onClick={() => handleToggleStatus(selectedEntry)}
                      disabled={busyId === selectedEntry.id}
                      whileTap={{ scale: 0.97 }}
                    >
                      {busyId === selectedEntry.id ? <Loader2 className="hz-spin" size={16} /> : isSelectedCompleted ? <X size={16} /> : <CheckCircle2 size={16} />}
                      {isSelectedCompleted ? 'Mark Pending' : 'Mark Completed'}
                    </motion.button>

                    <motion.button
                      type="button"
                      className="hz-modal-btn secondary compact"
                      onClick={handleStartEdit}
                      disabled={busyId === selectedEntry.id}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Edit size={16} />
                      Edit
                    </motion.button>

                    <motion.button
                      type="button"
                      className="hz-modal-btn danger compact"
                      onClick={() => handleDelete(selectedEntry)}
                      disabled={busyId === selectedEntry.id}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </motion.button>


                  </>
                )}
              </div>
            </motion.aside>
          </>
        </AnimatePresence>,
        modalRoot,
      ) : null}
    </div>
  );
}

function getStatus(entry) {
  const raw = String(entry?.status || '').toLowerCase();
  if (raw === 'done' || raw === 'completed') return 'completed';
  if (raw === 'forgiven') return 'forgiven';
  return 'pending';
}

function getStatusMeta(status) {
  if (status === 'completed') {
    return {
      label: 'Completed',
      title: 'All done with love',
      subtitle: 'Marked as completed and ready to move on.',
      badgeIcon: '🟢',
    };
  }

  if (status === 'forgiven') {
    return {
      label: 'Forgiven',
      title: 'Wrapped in forgiveness',
      subtitle: 'The hurt has been softened with care.',
      badgeIcon: '💙',
    };
  }

  return {
    label: 'Pending',
    title: 'Waiting for completion',
    subtitle: 'Still open and awaiting a sweet resolution.',
    badgeIcon: '🟡',
  };
}

function getInitials(value) {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function formatDateParts(value) {
  if (!value) return { date: '—', time: '—', full: '—' };

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: '—', time: '—', full: '—' };

    const dateText = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);

    const timeText = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    return {
      date: dateText,
      time: timeText,
      full: `${dateText} at ${timeText}`,
    };
  } catch {
    return { date: '—', time: '—', full: '—' };
  }
}

function formatDate(value) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}