import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Eye, Filter, Heart, Loader2, Search, Trash2, X } from 'lucide-react';
import CoupleContext from '../../../context/CoupleContext';
import useAuth from '../../../hooks/useAuth';
import useTheme from '../../../hooks/useTheme';
import { showSuccessToast, showThemeAlert } from '../../../utils/swalTheme';
import forgivenessApi from '../../../api/forgivenessApi';
import './HealingZone.css';

const normalizeStatus = (status) => {
  const value = String(status || '').toLowerCase();
  return value === 'forgiven' ? 'accepted' : value || 'pending';
};
const statusInfo = (status) => ({
  label: normalizeStatus(status) === 'accepted' ? 'Accepted' : normalizeStatus(status) === 'rejected' ? 'Rejected' : 'Pending Request',
  className: normalizeStatus(status),
});
const getId = (value) => value?._id || value?.id || value;
const getName = (value, fallback = 'Unknown') => value?.name || value || fallback;

export default function ForgivenessForm({ entries = [], onAddForgiveness }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { couple } = useContext(CoupleContext) || {};
  const currentUserId = user?._id || user?.id || user?.userId;
  const partnerA = couple?.partnerA;
  const partnerB = couple?.partnerB;
  const partnerAId = getId(partnerA);
  const partnerBId = getId(partnerB);
  const currentUserName = user?.name || (String(currentUserId) === String(partnerAId) ? getName(partnerA) : getName(partnerB));
  const partnerName = String(currentUserId) === String(partnerAId) ? getName(partnerB, 'Your partner') : getName(partnerA, 'Your partner');
  const themeDialog = (options) => showThemeAlert(theme, options);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadForgiveness = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await forgivenessApi.getForgiveness({ limit: 100 });
      const payload = response?.data?.data || response?.data || [];
      setRecords(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load forgiveness records', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  useEffect(() => { loadForgiveness(); }, [loadForgiveness]);

  const pendingEntries = useMemo(() => entries.filter((entry) => !['done', 'completed', 'forgiven'].includes(String(entry.status).toLowerCase())), [entries]);
  const mappedRecords = useMemo(() => records.map((record) => {
    const senderId = getId(record.forgivenBy) || record.senderId;
    const receiverId = getId(record.forgivenTo) || record.receiverId;
    const senderName = getName(record.forgivenBy, senderId && String(senderId) === String(currentUserId) ? currentUserName : partnerName);
    const receiverName = getName(record.forgivenTo, receiverId && String(receiverId) === String(currentUserId) ? currentUserName : partnerName);
    return { ...record, senderId, receiverId, senderName, receiverName, linkedEntry: record.originalEntryId || record.linkedEntryId, status: normalizeStatus(record.status) };
  }), [records, currentUserId, currentUserName, partnerName]);
  const visibleRecords = useMemo(() => mappedRecords.filter((record) => {
    const matchesSearch = [record.title, record.forgivenessMessage, record.senderName, record.receiverName].some((value) => String(value || '').toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter.startsWith('partner:')) return String(record.senderId) === filter.slice(8);
    return record.status === filter;
  }), [mappedRecords, filter, search]);
  const stats = useMemo(() => ({ total: mappedRecords.length, pending: mappedRecords.filter((record) => record.status === 'pending').length, accepted: mappedRecords.filter((record) => record.status === 'accepted').length }), [mappedRecords]);
  const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not available';
  const initials = (name) => String(name || '').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '??';
  const updateRecord = (updated) => setRecords((previous) => previous.map((record) => String(getId(record)) === String(getId(updated)) ? updated : record));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !message.trim()) return;
    setSubmitting(true);
    try {
      const payload = { forgivenessMessage: message.trim(), ...(title.trim() ? { title: title.trim() } : {}), ...(selectedEntryId ? { originalEntryId: selectedEntryId } : {}) };
      const response = await forgivenessApi.createForgiveness(payload);
      const saved = response?.data?.data || response?.data;
      if (saved) { setRecords((previous) => [saved, ...previous.filter((record) => String(getId(record)) !== String(getId(saved)))]); onAddForgiveness?.(saved); }
      setTitle(''); setMessage(''); setSelectedEntryId('');
      showSuccessToast(theme, { icon: 'success', title: 'Forgiveness request sent', text: `Waiting for ${partnerName}.`, timer: 2400, position: 'top-end' });
    } catch (error) {
      showSuccessToast(theme, {
        icon: 'error',
        title: 'Unable to send request',
        text: error?.response?.data?.message || 'Please try again.',
        timer: 2200,
        position: 'top-end'
      });
    } finally { setSubmitting(false); }
  };

  const handleAction = async (record, action) => {
    const actionMap = { accept: forgivenessApi.acceptForgiveness, reject: forgivenessApi.rejectForgiveness, delete: forgivenessApi.deleteForgiveness };
    if (action === 'delete') {
      const result = await themeDialog({ title: 'Delete forgiveness record?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', cancelButtonText: 'Cancel' });
      if (!result.isConfirmed) return;
    }
    try {
      const response = await actionMap[action](getId(record));
      if (action === 'delete') setRecords((previous) => previous.filter((item) => String(getId(item)) !== String(getId(record))));
      else { const updated = response?.data?.data || response?.data; if (updated) updateRecord(updated); }
      showSuccessToast(theme, { icon: 'success', title: action === 'accept' ? 'Forgiveness accepted' : action === 'reject' ? 'Request rejected' : 'Record deleted', timer: 2200, position: 'top-end' });
    } catch (error) {
      showSuccessToast(theme, {
        icon: 'error',
        title: 'Action failed',
        text: error?.response?.data?.message || 'Please try again.',
        timer: 2200,
        position: 'top-end'
      });
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    ...(partnerAId ? [{ value: `partner:${partnerAId}`, label: getName(partnerA) }] : []),
    ...(partnerBId ? [{ value: `partner:${partnerBId}`, label: getName(partnerB) }] : []),
    { value: 'pending', label: 'Pending' }, { value: 'accepted', label: 'Accepted' }, { value: 'rejected', label: 'Rejected' },
  ];

  return <div className="hz-forgiveness-dashboard">
    <section className="hz-forgiveness-panel hz-forgiveness-form-card"><div className="hz-forgiveness-heading"><span className="hz-badge">🤍 Forgiveness Form</span><p>Forgiveness doesn't erase memories, it strengthens love.</p></div><form className="hz-forgiveness-form" onSubmit={handleSubmit}><div className="hz-field"><label htmlFor="forgiveness-title">Title (optional)</label><input id="forgiveness-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A small title for this moment" /></div><div className="hz-field"><label htmlFor="forgiveness-message">Forgiveness Message</label><textarea id="forgiveness-message" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell your partner what is in your heart..." required /></div><div className="hz-field"><label htmlFor="forgiveness-entry">Select Mistake to Forgive</label><select id="forgiveness-entry" value={selectedEntryId} onChange={(event) => setSelectedEntryId(event.target.value)}><option value="">No specific mistake</option>{pendingEntries.map((entry) => <option key={entry.id} value={entry.id}>{entry.apologizer} → {entry.forgiver} — {String(entry.why || entry.reason || '').slice(0, 45)}</option>)}</select></div><button type="submit" className="hz-forgiveness-submit" disabled={submitting || !message.trim()}>{submitting ? <Loader2 size={18} className="hz-spin" /> : '💕 Send Forgiveness Request'}</button></form></section>
    <section className="hz-forgiveness-stats"><div className="hz-forgiveness-stat"><span>🤍 Total Forgiveness</span><strong>{stats.total}</strong></div><div className="hz-forgiveness-stat"><span>🕊 Pending Requests</span><strong>{stats.pending}</strong></div><div className="hz-forgiveness-stat"><span>💌 Accepted</span><strong>{stats.accepted}</strong></div><div className="hz-forgiveness-stat"><span>❤️ Relationship Harmony</span><strong>{stats.accepted ? 'Growing' : 'Building'}</strong></div></section>
    <section className="hz-forgiveness-panel hz-forgiveness-recent"><div className="hz-forgiveness-recent-heading"><span className="hz-badge">Recent Forgiveness</span></div><div className="hz-forgiveness-toolbar"><label className="hz-search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forgiveness messages" /></label><div className="hz-filter-group"><Filter size={16} /><select value={filter} onChange={(event) => setFilter(event.target.value)}>{filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div><div className="hz-forgiveness-list">{loading ? <div className="hz-forgiveness-empty"><Loader2 className="hz-spin" /> Loading forgiveness...</div> : visibleRecords.length === 0 ? <div className="hz-forgiveness-empty">No forgiveness messages yet.</div> : visibleRecords.map((record) => { const isExpanded = String(expandedId) === String(getId(record)); const isRecipient = String(record.receiverId) === String(currentUserId); const selectedEntry = record.linkedEntry; return <article key={getId(record)} className={`hz-forgiveness-card ${isExpanded ? 'is-expanded' : ''}`} onClick={() => setExpandedId(isExpanded ? null : getId(record))}><div className="hz-forgiveness-summary"><span className={`hz-forgiveness-status ${record.status}`}>{statusInfo(record.status).label}</span><h3>{record.title || 'I forgive you ❤️'}</h3><div className="hz-forgiveness-people"><span className="hz-forgiveness-avatar">{initials(record.senderName)}</span>{record.senderName}<span className="hz-forgiveness-arrow">→</span><span className="hz-forgiveness-avatar">{initials(record.receiverName)}</span>{record.receiverName}<ChevronDown className="hz-forgiveness-chevron" size={20} /></div></div><div className="hz-forgiveness-expand"><div className="hz-forgiveness-details"><div><b>Forgiveness Message</b><p>{record.forgivenessMessage || 'No message provided.'}</p></div><div><b>Related Mistake</b><p>{selectedEntry?.title || 'No specific mistake selected.'}</p></div><div><b>Created Date</b><p>{formatDate(record.createdAt)}</p></div><div><b>Accepted Date</b><p>{record.forgivenAt ? formatDate(record.forgivenAt) : 'Not accepted yet'}</p></div><div><b>Status</b><p>{statusInfo(record.status).label}</p></div></div><div className="hz-forgiveness-actions"><button type="button" className="hz-promise-action-btn view" onClick={(event) => { event.stopPropagation(); themeDialog({ title: record.title || 'Forgiveness', text: record.forgivenessMessage || 'No message provided.', confirmButtonText: 'Close' }); }}><Eye size={14} /> View</button>{isRecipient && record.status === 'pending' && <><button type="button" className="hz-promise-action-btn accept" onClick={(event) => { event.stopPropagation(); handleAction(record, 'accept'); }}><Check size={14} /> Accept</button><button type="button" className="hz-promise-action-btn decline" onClick={(event) => { event.stopPropagation(); handleAction(record, 'reject'); }}><X size={14} /> Reject</button></>}<button type="button" className="hz-promise-action-btn delete" onClick={(event) => { event.stopPropagation(); handleAction(record, 'delete'); }}><Trash2 size={14} /> Delete</button></div></div></article>; })}</div></section>
  </div>;
}
