import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHealing } from '../context/HealingContext';
import CoupleContext from '../../../context/CoupleContext';
import useAuth from '../../../hooks/useAuth';
import useTheme from '../../../hooks/useTheme';
import { showThemeAlert, showSuccessToast } from '../../../utils/swalTheme';
import {
  Heart, Trash2, X, Sparkles, Clock,
  Search, Filter, Loader2, ShieldAlert,
  Check, Eye, Flag, Trophy, ChevronDown
} from 'lucide-react';
import './HealingZone.css';

const CATEGORIES = [
  { value: 'relationship', label: '❤️ Relationship' },
  { value: 'sleep', label: '🌙 Sleep' },
  { value: 'health', label: '💧 Health' },
  { value: 'study', label: '📚 Study' },
  { value: 'communication', label: '📞 Communication' },
  { value: 'food', label: '🍽 Food' },
  { value: 'habit', label: '🎯 Habit' },
  { value: 'custom', label: '✨ Custom' }
];

const CATEGORY_MAP = {
  relationship: { label: 'Relationship', emoji: '❤️' },
  sleep: { label: 'Sleep', emoji: '🌙' },
  health: { label: 'Health', emoji: '💧' },
  study: { label: 'Study', emoji: '📚' },
  communication: { label: 'Communication', emoji: '📞' },
  food: { label: 'Food', emoji: '🍽' },
  habit: { label: 'Habit', emoji: '🎯' },
  custom: { label: 'Custom', emoji: '✨' }
};

const STATUS_MAP = {
  pending: { label: 'Pending Request', className: 'pending' },
  active: { label: 'Active', className: 'active' },
  broken: { label: 'Broken', className: 'broken' },
  rejected: { label: 'Rejected', className: 'rejected' },
  break_requested: { label: 'Broken Request', className: 'break-requested' },
};

const normalizeStatus = (status) => {
  const raw = String(status || '').toLowerCase();
  if (raw === 'accepted') return 'active';
  if (raw === 'declined') return 'rejected';
  if (raw === 'break_requested' || raw === 'break-requested') return 'break_requested';
  return raw;
};

const getStatusInfo = (status) => {
  const normalized = normalizeStatus(status);
  return STATUS_MAP[normalized] || {
    label: String(status || '').replace(/_|-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    className: 'pending'
  };
};

const getCategoryDetail = (category) => CATEGORY_MAP[category] || CATEGORY_MAP.custom;

export default function PromiseSection() {
  const {
    promises, addPromise, acceptPromise, declinePromise,
    requestBreakPromise, agreeBreakPromise, disagreeBreakPromise,
    deletePromise, loading, refreshPromises
  } = useHealing();
  const { couple } = useContext(CoupleContext) || {};
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const currentUserId = user?._id || user?.id || user?.userId;
  const currentUserName = user?.name || 'You';
  const theme = useTheme();
  const themeDialog = (options) => showThemeAlert(theme, options);
  const showError = (message = 'Something went wrong.') => showSuccessToast(theme, {
    title: 'Error',
    text: message,
    icon: 'error',
    timer: 2200,
    position: 'top-end'
  });

  // Resolve partner details
  const partnerA = couple?.partnerA;
  const partnerB = couple?.partnerB;

  const partnerAId = partnerA?._id || partnerA?.id;
  const partnerBId = partnerB?._id || partnerB?.id;

  const partnerAName = partnerA?.name || 'Partner A';
  const partnerBName = partnerB?.name || 'Partner B';

  const partnerName = String(currentUserId) === String(partnerAId) ? partnerBName : partnerAName;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('relationship');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and Filter states
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedPromiseId, setExpandedPromiseId] = useState(null);

  useEffect(() => {
    if (isAuthenticated && refreshPromises) {
      refreshPromises();
    }
  }, [isAuthenticated, refreshPromises]);

  // Deduplicate and map promises
  const dedupedPromises = useMemo(() => {
    const seen = new Map();
    (promises || []).forEach((p) => {
      const pid = p.id || p._id;
      if (pid && !seen.has(String(pid))) {
        seen.set(String(pid), p);
      }
    });
    return Array.from(seen.values());
  }, [promises]);

  const visiblePromises = useMemo(() => {
    return dedupedPromises.filter((promise) => {
      const status = normalizeStatus(promise.status);
      return status !== 'completed' && status !== 'done' && status !== 'forgiven';
    });
  }, [dedupedPromises]);

  // Calculate stats
  const activeCount = useMemo(() =>
    visiblePromises.filter((p) => normalizeStatus(p.status) === 'active').length
    , [visiblePromises]);

  const pendingCount = useMemo(() =>
    visiblePromises.filter((p) => normalizeStatus(p.status) === 'pending').length
    , [visiblePromises]);

  const brokenCount = useMemo(() =>
    visiblePromises.filter((p) => normalizeStatus(p.status) === 'broken').length
    , [visiblePromises]);

  // Broken count per user
  const partnerABroken = useMemo(() =>
    visiblePromises.filter((p) => normalizeStatus(p.status) === 'broken' && String(p.createdBy) === String(partnerAId)).length
    , [visiblePromises, partnerAId]);

  const partnerBBroken = useMemo(() =>
    visiblePromises.filter((p) => normalizeStatus(p.status) === 'broken' && String(p.createdBy) === String(partnerBId)).length
    , [visiblePromises, partnerBId]);

  const activeCreatedByA = useMemo(() =>
    visiblePromises.filter((p) => normalizeStatus(p.status) === 'active' && String(p.createdBy) === String(partnerAId)).length
    , [visiblePromises, partnerAId]);

  const activeCreatedByB = useMemo(() =>
    visiblePromises.filter((p) => normalizeStatus(p.status) === 'active' && String(p.createdBy) === String(partnerBId)).length
    , [visiblePromises, partnerBId]);

  const myBrokenCount = String(currentUserId) === String(partnerAId) ? partnerABroken : partnerBBroken;

  // Trust Score (based on current user's broken commitments)
  const trustScore = Math.max(0, 100 - (myBrokenCount * 10));

  const trustLevel = useMemo(() => {
    if (trustScore >= 90) return { label: '❤️ Excellent', class: 'excellent' };
    if (trustScore >= 70) return { label: '💖 Strong', class: 'strong' };
    if (trustScore >= 50) return { label: '💛 Needs Attention', class: 'attention' };
    if (trustScore >= 30) return { label: '🧡 Critical', class: 'critical' };
    return { label: '❤️🩹 Rebuild Trust', class: 'rebuild' };
  }, [trustScore]);

  // Submit Promise Request
  const handleSubmitPromise = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!title || !title.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        dueDate: null // No due date
      };

      await addPromise(payload);

      showSuccessToast(theme, {
        icon: 'success',
        title: 'Commitment Request Sent!',
        text: 'Waiting for partner to accept.',
        timer: 2500,
        position: 'top-end'
      });

      setTitle('');
      setDescription('');
      setCategory('relationship');
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to send promise request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Respond to break request
  const handleRequestBreak = async (promise) => {
    const { value: reason } = await themeDialog({
      title: 'Request Promise Break?',
      text: 'Provide a reason why you believe this promise was broken (optional):',
      input: 'text',
      inputPlaceholder: 'e.g. You slept at 2:00 AM yesterday.',
      showCancelButton: true,
      confirmButtonText: '💔 Request Break',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (reason !== undefined) {
      try {
        await requestBreakPromise(promise.id, reason);
        showSuccessToast(theme, {
          icon: 'success',
          title: 'Break Requested',
          text: 'Break request sent to partner.',
          timer: 2500,
          position: 'top-end'
        });
      } catch {
        showError('Failed to request break.');
      }
    }
  };

  // Agree with break request
  const handleAgreeBreak = async (promise) => {
    const result = await themeDialog({
      title: 'Do you agree?',
      text: 'Do you agree that you broke this commitment? This will cost you 1 Lifeline.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✔ Yes, I Agree',
      cancelButtonText: '✖ Disagree',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        await agreeBreakPromise(promise.id);
        showSuccessToast(theme, {
          icon: 'error',
          title: 'Promise Broken 💔',
          text: 'Lifeline reduced.',
          timer: 2500,
          position: 'top-end'
        });
      } catch {
        showError('Failed to submit response.');
      }
    }
  };

  // View promise details
  const handleViewPromise = async (promise) => {
    await themeDialog({
      title: promise.title || 'Promise details',
      html: `
        <p style="color:${theme.palette.text.secondary}; font-size:15px; line-height:1.6; margin:0 0 12px;">${promise.description || 'No additional description provided.'}</p>
        <p style="color:${theme.palette.text.primary}; font-size:14px; margin:0.25rem 0;"><strong>Category:</strong> ${getCategoryDetail(promise.category).label}</p>
        <p style="color:${theme.palette.text.primary}; font-size:14px; margin:0.25rem 0;"><strong>Status:</strong> ${getStatusInfo(promise.status).label}</p>
        <p style="color:${theme.palette.text.primary}; font-size:14px; margin:0.25rem 0;"><strong>Created:</strong> ${formatDate(promise.createdAt)}</p>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Close'
    });
  };

  // Disagree with break request
  const handleDisagreeBreak = async (promise) => {
    const result = await themeDialog({
      title: 'Reject Break Request?',
      text: 'Mark this break request as rejected/disputed? Status will remain Accepted.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Reject Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'rgba(255,255,255,0.15)'
    });

    if (result.isConfirmed) {
      try {
        await disagreeBreakPromise(promise.id);
        showSuccessToast(theme, {
          icon: 'info',
          title: 'Break Request Rejected',
          text: 'Status reverted to Accepted.',
          timer: 2500,
          position: 'top-end'
        });
      } catch {
        showError('Failed to reject request.');
      }
    }
  };

  // Delete promise handler
  const handleDeletePromise = async (promise) => {
    const result = await themeDialog({
      title: 'Delete Commitment?',
      text: 'Are you sure you want to delete this promise? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        await deletePromise(promise.id);
        showSuccessToast(theme, {
          icon: 'success',
          title: 'Deleted successfully',
          timer: 2500,
          position: 'top-end'
        });
      } catch {
        showError('Failed to delete commitment.');
      }
    }
  };

  // Format date helper
  const formatDate = (val) => {
    if (!val) return '';
    try {
      return new Date(val).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return String(val);
    }
  };

  const getInitials = (name = '') => {
    return String(name)
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '??';
  };

  // Filters logic
  const filteredPromises = useMemo(() => {
    return visiblePromises.filter((p) => {
      const status = normalizeStatus(p.status);
      const searchLower = search.toLowerCase();
      const matchSearch =
        String(p.title || '').toLowerCase().includes(searchLower) ||
        String(p.description || '').toLowerCase().includes(searchLower) ||
        String(p.category || '').toLowerCase().includes(searchLower) ||
        String(p.from || '').toLowerCase().includes(searchLower) ||
        String(p.to || '').toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      if (filter === 'all') return true;
      if (filter === `partner:${partnerAId}`) return String(p.createdBy) === String(partnerAId);
      if (filter === `partner:${partnerBId}`) return String(p.createdBy) === String(partnerBId);
      if (filter === 'pending') return status === 'pending';
      if (filter === 'active') return status === 'active' || status === 'break_requested';
      if (filter === 'broken') return status === 'broken';
      if (filter === 'rejected') return status === 'rejected';
      return true;
    });
  }, [visiblePromises, search, filter, partnerAId, partnerBId]);

  const filterOptions = useMemo(() => [
    { value: 'all', label: 'All Promises' },
    ...(partnerAId ? [{ value: `partner:${partnerAId}`, label: partnerAName }] : []),
    ...(partnerBId ? [{ value: `partner:${partnerBId}`, label: partnerBName }] : []),
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Accepted' },
    { value: 'broken', label: 'Broken' },
    { value: 'rejected', label: 'Rejected' },
  ], [partnerAId, partnerAName, partnerBId, partnerBName]);

  return (
    <div className="hz-promise-dashboard-root">
      <section className="hz-promise-panel hz-promise-form-card">
        <div className="hz-promise-panel-header">

          <div>
            <span className="hz-badge">Make a Commitment</span>
          </div>
        </div>

        <form className="hz-promise-form" onSubmit={handleSubmitPromise}>
          <div className="hz-form-grid">
            <div className="hz-field">
              <label>Promise Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. I promise I'll text you every evening"
                required
              />
            </div>

            <div className="hz-field hz-field-full">
              <label>Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this commitment..."
              />
            </div>

            <div className="hz-field hz-field-full">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="hz-primary-btn hz-promise-submit-btn"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="hz-spin" />
            ) : (
              '💕 Send Promise Request'
            )}
          </button>
        </form>
      </section>

      <section className="hz-promise-panel hz-promise-champion-card">
        <div className="hz-promise-champion-body">
          {/* <div className="hz-promise-floating-hearts" aria-hidden="true">♥ ♡ ♥</div> */}
          {/* <Trophy className="hz-promise-champion-trophy" size={52} aria-hidden="true" /> */}
          <span className="hz-badge">🏆 Promise Champion</span>
          {activeCreatedByA === activeCreatedByB ? (
            <div className="hz-promise-champion-draw">
              <h2>🤝 It's a Draw</h2>
              <p>Both partners have kept the same number of promises.</p>
            </div>
          ) : (
            <div className="hz-promise-champion-winner">
              {(() => {
                const winnerName = activeCreatedByA > activeCreatedByB ? partnerAName : partnerBName;
                return (
                  <>
                    {/* <span className="hz-promise-champion-avatar">{getInitials(winnerName)}</span> */}
                    <span className="hz-champion-label">👑 {winnerName}</span>
                    <span className="hz-champion-count">{Math.max(activeCreatedByA, activeCreatedByB)} Active Promises</span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </section>

      <section className="hz-promise-stats-grid">
        <div className="hz-promise-stat-card">
          <div className="hz-promise-stat-icon">
            <Heart size={22} />
          </div>
          <span className="hz-promise-stat-name">Active Commitments</span>
          <span className="hz-promise-stat-value">{activeCount}</span>
        </div>

        <div className="hz-promise-stat-card">
          <div className="hz-promise-stat-icon" style={{ background: 'rgba(255, 230, 171, 0.18)', color: '#fbbf24' }}>
            <Clock size={22} />
          </div>
          <span className="hz-promise-stat-name">Pending Requests</span>
          <span className="hz-promise-stat-value">{pendingCount}</span>
        </div>

        <div className="hz-promise-stat-card">
          <div className="hz-promise-stat-icon" style={{ background: 'rgba(248, 113, 113, 0.18)', color: '#ef4444' }}>
            <ShieldAlert size={22} />
          </div>
          <span className="hz-promise-stat-name">Broken Promises</span>
          <span className="hz-promise-stat-value">{brokenCount}</span>
        </div>

        <div className="hz-promise-stat-card">
          <div className="hz-promise-stat-icon" style={{ background: 'rgba(209, 196, 255, 0.18)', color: '#c084fc' }}>
            <Sparkles size={22} />
          </div>
          <span className="hz-promise-stat-name">Trust Score</span>
          <span className="hz-promise-stat-value">{trustScore}%</span>
          <span className={`hz-promise-stat-note ${trustLevel.class}`}>{trustLevel.label}</span>
        </div>
      </section>

      <section className="hz-promise-panel hz-promise-recent-panel">
        <div className="hz-promise-panel-header hz-promise-recent-header">
          <div>
            <span className="hz-badge">Recent Promises</span>

          </div>
        </div>

        <div className="hz-recent-toolbar">
          <label className="hz-search-field">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search promise titles, descriptions, or partner names"
            />
          </label>

          <div className="hz-filter-group">
            <Filter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hz-promises-grid">
          {loading ? (
            <div className="hz-empty-state">
              <Loader2 size={36} className="hz-spin" style={{ color: '#ff5ecf' }} />
              <h3>Loading promises...</h3>
            </div>
          ) : filteredPromises.length === 0 ? (
            <div className="hz-empty-state">
              <div className="hz-empty-icon">💌</div>
              <h3>No promises match your search.</h3>
              <p>Try a different keyword or add a new commitment above.</p>
            </div>
          ) : filteredPromises.map((promise) => {
            const isCreator = String(promise.createdBy) === String(currentUserId);
            const isAssignedPartner = String(promise.assignedTo) === String(currentUserId);
            const status = normalizeStatus(promise.status);
            const isExpanded = String(expandedPromiseId) === String(promise.id);
            const catInfo = getCategoryDetail(promise.category);
            const creatorName = isCreator ? currentUserName : promise.from || partnerName;
            const recipientName = isCreator ? partnerName : promise.to || 'You';

            return (
              <article
                key={promise.id}
                className={`hz-promise-list-card ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedPromiseId(isExpanded ? null : promise.id)}
              >
                <div className="hz-promise-card-summary">
                  <div className="hz-promise-card-top">
                    <span className="hz-promise-category-badge">{catInfo.emoji} {catInfo.label}</span>
                    <span className={`hz-promise-status-badge ${getStatusInfo(status).className}`}>
                      {getStatusInfo(status).label}
                    </span>
                  </div>

                  <h3 className="hz-promise-card-title">{promise.title}</h3>

                  <div className="hz-promise-card-meta-row">
                    <div className="hz-promise-meta-left">
                      <div className="hz-promise-avatar-group">
                        <span className="hz-promise-user-name">{creatorName}</span>
                      </div>
                      <span className="hz-promise-arrow">→</span>
                      <div className="hz-promise-avatar-group">
                        <span className="hz-promise-user-name">{recipientName}</span>
                      </div>
                    </div>
                    <ChevronDown className="hz-promise-expand-icon" size={20} aria-hidden="true" />
                  </div>
                </div>

                <div className="hz-promise-card-expand" aria-hidden={!isExpanded}>
                  <div className="hz-promise-detail-grid">
                    <div>
                      <span className="hz-promise-detail-label">Description</span>
                      <p>{promise.description || 'No description provided.'}</p>
                    </div>
                    <div>
                      <span className="hz-promise-detail-label">Created Date</span>
                      <p>{formatDate(promise.createdAt) || 'Not available'}</p>
                    </div>
                    <div>
                      <span className="hz-promise-detail-label">Accepted Date</span>
                      <p>{promise.acceptedAt ? formatDate(promise.acceptedAt) : 'Not accepted yet'}</p>
                    </div>
                    <div>
                      <span className="hz-promise-detail-label">Status</span>
                      <p>{getStatusInfo(status).label}</p>
                    </div>
                  </div>

                  <div className="hz-promise-expanded-actions">
                    <button type="button" className="hz-promise-action-btn view" onClick={(event) => { event.stopPropagation(); handleViewPromise(promise); }}>
                      <Eye size={14} /> View
                    </button>
                    <button type="button" className="hz-promise-action-btn delete" onClick={(event) => { event.stopPropagation(); handleDeletePromise(promise); }}>
                      <Trash2 size={14} /> Delete
                    </button>

                    {status === 'pending' && isAssignedPartner && (
                      <>
                        <button type="button" className="hz-promise-action-btn accept" onClick={(event) => { event.stopPropagation(); acceptPromise(promise.id); }}>
                          <Check size={14} /> Accept
                        </button>
                        <button type="button" className="hz-promise-action-btn decline" onClick={(event) => { event.stopPropagation(); declinePromise(promise.id); }}>
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}

                    {status === 'active' && isAssignedPartner && (
                      <button type="button" className="hz-promise-action-btn break-req" onClick={(event) => { event.stopPropagation(); handleRequestBreak(promise); }}>
                        <Flag size={14} /> Mark Broken
                      </button>
                    )}

                    {status === 'break_requested' && isCreator && (
                      <>
                        <button type="button" className="hz-promise-action-btn decline" onClick={(event) => { event.stopPropagation(); handleDisagreeBreak(promise); }}>
                          <X size={14} /> Reject
                        </button>
                        <button type="button" className="hz-promise-action-btn agree" onClick={(event) => { event.stopPropagation(); handleAgreeBreak(promise); }}>
                          <Check size={14} /> Accept
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
