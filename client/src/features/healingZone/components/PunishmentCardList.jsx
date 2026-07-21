import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronRight, FiSearch, FiXCircle, FiEdit3, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { FaGift, FaCalendarAlt } from 'react-icons/fa';
import '../components/HealingZone.css';

const FILTERS = ['all', 'mine', 'partner', 'pending', 'completed', 'forgiven'];

function getStatusLabel(status) {
    if (status === 'completed' || status === 'done') return 'Completed';
    if (status === 'forgiven') return 'Forgiven';
    return 'Pending';
}

function getStatusClass(status) {
    if (status === 'completed' || status === 'done') return 'hz-badge-status-complete';
    if (status === 'forgiven') return 'hz-badge-status-forgiven';
    return 'hz-badge-status-pending';
}

export default function PunishmentCardList({
    entries = [],
    currentUserName = '',
    onRequestComplete = null,
    onCompleteEntry = null,
    onCompletePromise = null,
    onEditEntry = null,
    onEditPromise = null,
    onDeleteEntry = null,
    onDeletePromise = null,
    onForgiveEntry = null,
}) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPunishment, setSelectedPunishment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftDescription, setDraftDescription] = useState('');

    const currentUserDisplayName = currentUserName || 'You';

    const partnerLabel = useMemo(() => {
        const availableNames = entries
            .flatMap((entry) => [entry.apologizer, entry.forgiver, entry.from, entry.to])
            .filter(Boolean)
            .map((name) => String(name).trim())
            .filter((name) => name.toLowerCase() !== String(currentUserDisplayName).toLowerCase());

        const uniqueNames = [...new Set(availableNames)];
        return uniqueNames[0] || 'Partner';
    }, [entries, currentUserDisplayName]);

    const renderDetailCard = (icon, label, value, tone = 'default', wide = false) => (
        <div className={`hz-info-card ${tone} ${wide ? 'wide' : ''}`}>
            <div className="hz-info-icon">{icon}</div>
            <div className="hz-info-copy">
                <span className="hz-info-label">{label}</span>
                <p>{value}</p>
            </div>
        </div>
    );

    const formatDate = (val) => {
        if (!val) return '—';
        try {
            return new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return '—';
        }
    };

    const filteredEntries = useMemo(() => {
        return entries.filter((entry) => {
            const title = (entry.punishment || entry.title || '').toLowerCase();
            const matchesSearch = searchTerm ? title.includes(searchTerm.toLowerCase()) : true;

            const normalizedStatus = String(entry.status || '').toLowerCase();
            const isMine = entry.apologizer && currentUserName && String(entry.apologizer).toLowerCase() === String(currentUserName).toLowerCase();
            const isPartner = !isMine;

            let matchesFilter = true;
            if (activeFilter === 'mine') matchesFilter = isMine;
            if (activeFilter === 'partner') matchesFilter = isPartner;
            if (activeFilter === 'pending') matchesFilter = normalizedStatus !== 'completed' && normalizedStatus !== 'done' && normalizedStatus !== 'forgiven';
            if (activeFilter === 'completed') matchesFilter = normalizedStatus === 'completed' || normalizedStatus === 'done';
            if (activeFilter === 'forgiven') matchesFilter = normalizedStatus === 'forgiven';

            return matchesSearch && matchesFilter;
        });
    }, [entries, activeFilter, searchTerm, currentUserName]);

    const selectedPunishmentData = selectedPunishment
        ? filteredEntries.find((item) => String(item.id) === String(selectedPunishment.id)) || selectedPunishment
        : null;

    const openDrawer = (punishment) => {
        setSelectedPunishment(punishment);
        setIsDrawerOpen(true);
        setEditMode(false);
        setDraftTitle(punishment.reason || punishment.why || punishment.punishment || punishment.title || '');
        setDraftDescription(punishment.description || punishment.message || '');
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setEditMode(false);
        window.setTimeout(() => setSelectedPunishment(null), 220);
    };

    useEffect(() => {
        if (!isDrawerOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeDrawer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDrawerOpen]);

    const resetDraftValues = () => {
        if (!selectedPunishmentData) return;
        setDraftTitle(selectedPunishmentData.reason || selectedPunishmentData.why || selectedPunishmentData.punishment || selectedPunishmentData.title || '');
        setDraftDescription(selectedPunishmentData.description || selectedPunishmentData.message || '');
    };

    const handleSaveEdit = async () => {
        if (!selectedPunishmentData?.id) return;
        const payload = {
            reason: draftTitle.trim(),
            punishment: draftTitle.trim(),
            description: draftDescription.trim(),
        };

        try {
            if (selectedPunishmentData?.type === 'promise') {
                await onEditPromise?.(selectedPunishmentData, payload);
            } else {
                await onEditEntry?.(selectedPunishmentData, payload);
            }
            setEditMode(false);
        } catch (err) {
            console.error('Edit failed:', err);
        }
    };

    const handleCancelEdit = () => {
        resetDraftValues();
        setEditMode(false);
    };

    const handleDelete = async () => {
        if (!selectedPunishmentData?.id) return;
        try {
            if (selectedPunishmentData?.type === 'promise') {
                await onDeletePromise?.(selectedPunishmentData);
            } else {
                await onDeleteEntry?.(selectedPunishmentData);
            }
            closeDrawer();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleComplete = async () => {
        if (!selectedPunishmentData?.id) return;
        try {
            if (selectedPunishmentData?.type === 'promise') {
                await onCompletePromise?.(selectedPunishmentData);
            } else {
                await onCompleteEntry?.(selectedPunishmentData);
            }
            closeDrawer();
        } catch (err) {
            console.error('Complete failed:', err);
        }
    };

    const handleForgive = async () => {
        if (!selectedPunishmentData?.id) return;
        try {
            await onForgiveEntry?.(selectedPunishmentData);
            closeDrawer();
        } catch (err) {
            console.error('Forgive failed:', err);
        }
    };

    const getFilterLabel = (filter) => {
        if (filter === 'mine') return currentUserDisplayName;
        if (filter === 'partner') return partnerLabel;
        return filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1);
    };

    return (
        <div className="hz-card hz-card-compact">
            <div className="hz-header">
                <span className="hz-badge">Punishment Cards</span>
                <p className="hz-subtitle">A calmer, card-based way to track apologies and follow-ups.</p>
            </div>

            <div className="hz-punishment-toolbar">
                <label className="hz-search-box">
                    <FiSearch size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by punishment title"
                    />
                </label>

                <div className="hz-filter-row">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            className={`hz-filter-chip ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {getFilterLabel(filter)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="hz-card-grid">
                {filteredEntries.length === 0 ? (
                    <div className="hz-empty-card">
                        <FiRefreshCw size={18} />
                        <p>No punishments found.</p>
                    </div>
                ) : (
                    filteredEntries.map((entry) => {
                        const isCompleted = ['completed', 'done'].includes(String(entry.status || '').toLowerCase());
                        const isForgiven = String(entry.status || '').toLowerCase() === 'forgiven';
                        const isPending = !isCompleted && !isForgiven;
                        return (
                            <button
                                key={entry.id}
                                type="button"
                                className="hz-punishment-card"
                                onClick={() => openDrawer(entry)}
                            >
                                <div className="hz-card-top">
                                    <span className={`hz-pill ${getStatusClass(entry.status)}`}>
                                        {getStatusLabel(entry.status)}
                                    </span>
                                    <FiChevronRight size={18} />
                                </div>
                                <h3>{entry.punishment || entry.title || 'Untitled punishment'}</h3>
                                <div className="hz-card-meta">
                                    <span className="hz-card-label">Assigned to</span>
                                    <strong>{entry.apologizer || entry.from || 'Unknown'}</strong>
                                </div>
                                <div className="hz-card-footer">
                                    <span className={`hz-status-dot ${isPending ? 'pending' : isForgiven ? 'forgiven' : 'complete'}`} />
                                    <span>{isPending ? 'Needs care' : isForgiven ? 'Forgiven' : 'Completed'}</span>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            <div className={`hz-drawer-backdrop ${isDrawerOpen ? 'open' : ''}`} onClick={closeDrawer} />
            <div className={`hz-detail-sheet ${isDrawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                {selectedPunishmentData ? (
                    <>
                        <div className="hz-detail-header">
                            <div>
                                <p className="hz-detail-eyebrow">Punishment details</p>
                                <h3>{selectedPunishmentData.punishment || selectedPunishmentData.title || 'Untitled punishment'}</h3>
                            </div>
                            <button type="button" className="hz-icon-btn" onClick={closeDrawer}>
                                <FiXCircle size={18} />
                            </button>
                        </div>

                        {editMode ? (
                            <div className="hz-edit-form">
                                <label>
                                    Title
                                    <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
                                </label>
                                <label>
                                    Description
                                    <textarea value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} />
                                </label>
                                <div className="hz-detail-actions">
                                    <button type="button" className="hz-secondary-btn" onClick={handleCancelEdit}>Cancel</button>
                                    <button type="button" className="hz-primary-btn" onClick={handleSaveEdit}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className="hz-detail-body">
                                <div className="hz-detail-grid">
                                    {renderDetailCard('👤', 'Assigned To', selectedPunishmentData.apologizer || selectedPunishmentData.from || 'Unknown', 'pink')}
                                    {renderDetailCard('💗', 'Given By', selectedPunishmentData.forgiver || selectedPunishmentData.to || 'Unknown', 'rose')}
                                    {renderDetailCard('📅', 'Created Date', formatDate(selectedPunishmentData.createdAt), 'default')}
                                    {renderDetailCard(
                                        selectedPunishmentData.status === 'completed' || selectedPunishmentData.status === 'done' ? '🟢' : selectedPunishmentData.status === 'forgiven' ? '🟣' : '🟡',
                                        'Status',
                                        getStatusLabel(selectedPunishmentData.status),
                                        selectedPunishmentData.status === 'completed' || selectedPunishmentData.status === 'done' ? 'status-completed' : selectedPunishmentData.status === 'forgiven' ? 'status-forgiven' : 'status-pending'
                                    )}

                                    {renderDetailCard(<FaGift />, 'Punishment', selectedPunishmentData.punishment || selectedPunishmentData.title || 'No punishment assigned yet.', 'accent', true)}
                                    {renderDetailCard(<FaCalendarAlt />, 'Description', selectedPunishmentData.description || selectedPunishmentData.message || selectedPunishmentData.why || 'No additional context.', 'default', true)}
                                </div>

                                <div className="hz-detail-actions">
                                    <button type="button" className="hz-primary-btn" onClick={handleComplete}>Mark Completed</button>
                                    <button type="button" className="hz-secondary-btn" onClick={handleForgive}>Forgive</button>
                                    <button type="button" className="hz-secondary-btn" onClick={() => setEditMode(true)}><FiEdit3 size={14} /> Edit</button>
                                    <button type="button" className="hz-danger-btn" onClick={handleDelete}><FiTrash2 size={14} /> Delete</button>
                                    <button type="button" className="hz-secondary-btn" onClick={closeDrawer}>Close</button>
                                </div>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}
