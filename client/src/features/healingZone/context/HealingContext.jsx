import React, { createContext, useContext, useState, useEffect } from 'react';
import healingApi from '../../../api/healingApi';
import useToast from '../../../hooks/useToast';
import { connectSocket, joinRoom, leaveRoom, onEvent } from '../../../lib/socket';
import CoupleContext from '../../../context/CoupleContext';

const HealingContext = createContext(null);

export function useHealing() {
    return useContext(HealingContext);
}

function mapEntry(entry) {
    return {
        id: entry?._id || entry?.id,
        apologizer: entry?.from || entry?.apologizer || 'Unknown',
        forgiver: entry?.to || entry?.forgiver || 'Unknown',
        reason: entry?.reason || entry?.why || entry?.message || '',
        why: entry?.reason || entry?.why || entry?.message || '',
        punishment: entry?.punishment || entry?.title || '',
        description: entry?.description || entry?.message || '',
        status: (entry?.status === 'completed' || entry?.status === 'done') ? 'completed' : (entry?.status === 'forgiven' ? 'forgiven' : 'pending'),
        createdAt: entry?.createdAt || new Date().toISOString(),
        doneAt: (entry?.metadata && entry.metadata.completedAt) || entry?.completedAt || null,
        completedAt: (entry?.metadata && entry.metadata.completedAt) || entry?.completedAt || null,
        raw: entry,
    };
}

export function HealingProvider({ children }) {
    const [entries, setEntries] = useState([]);
    const [promises, setPromises] = useState([]);
    const [loading, setLoading] = useState(true);
    const { error: showError } = useToast();
    const { couple } = React.useContext(CoupleContext);

    const dedupeById = (arr) => {
        const seen = new Map();
        (arr || []).forEach((item) => {
            const key = String(item?.id || item?._id || JSON.stringify(item));
            if (!seen.has(key)) seen.set(key, item);
        });
        return Array.from(seen.values());
    };

    const refreshStats = async () => {
        try {
            await healingApi.getStats();
        } catch (err) {
            console.warn('Failed to refresh healing stats:', err?.message);
        }
    };

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setLoading(true);
            try {
                const [entriesRes, promisesRes] = await Promise.all([
                    healingApi.getEntries(),
                    healingApi.getPromises(),
                ]);

                const entriesPayload = entriesRes.data?.data || entriesRes.data || [];
                const promisesPayload = promisesRes.data?.data || promisesRes.data || [];

                if (!mounted) return;

                const mappedEntries = dedupeById(entriesPayload)
                    .filter((entry) => String(entry?.type || '').toLowerCase() !== 'promise')
                    .map(mapEntry);

                const mappedPromises = dedupeById(promisesPayload)
                    .map((entry) => ({
                        id: entry?._id || entry?.id,
                        apologizer: entry?.from || entry?.apologizer || 'Unknown',
                        forgiver: entry?.to || entry?.forgiver || 'Unknown',
                        reason: entry?.reason || entry?.why || entry?.message || '',
                        why: entry?.reason || entry?.why || entry?.message || '',
                        punishment: entry?.punishment || entry?.title || '',
                        description: entry?.description || entry?.message || '',
                        status: (entry?.status === 'completed' || entry?.status === 'done') ? 'completed' : 'pending',
                        createdAt: entry?.createdAt || new Date().toISOString(),
                        doneAt: (entry?.metadata && entry.metadata.completedAt) || entry?.completedAt || null,
                        completedAt: (entry?.metadata && entry.metadata.completedAt) || entry?.completedAt || null,
                        raw: entry,
                    }));

                setEntries(mappedEntries);
                setPromises(mappedPromises);
            } catch (err) {
                console.error('Failed to load healing data (provider):', err);
                setEntries([]);
                setPromises([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!couple || !couple._id) return undefined;

        try {
            connectSocket();
            joinRoom(couple._id);

            const offCreated = onEvent('healing:created', (payload) => {
                const mapped = mapEntry(payload);
                if (String(payload?.type || '').toLowerCase() === 'promise') {
                    setPromises((prev) => [mapped, ...prev.filter((item) => String(item.id) !== String(mapped.id))]);
                } else {
                    setEntries((prev) => [mapped, ...prev.filter((item) => String(item.id) !== String(mapped.id))]);
                }
            });

            const offUpdated = onEvent('healing:updated', (payload) => {
                const mapped = mapEntry(payload);
                if (String(payload?.type || '').toLowerCase() === 'promise') {
                    setPromises((prev) => prev.map((item) => (String(item.id) === String(mapped.id) ? mapped : item)));
                } else {
                    setEntries((prev) => prev.map((item) => (String(item.id) === String(mapped.id) ? mapped : item)));
                }
            });

            const offDeleted = onEvent('healing:deleted', (payload) => {
                const { id } = payload || {};
                if (!id) return;
                setEntries((prev) => prev.filter((item) => String(item.id) !== String(id)));
                setPromises((prev) => prev.filter((item) => String(item.id) !== String(id)));
            });

            return () => {
                offCreated();
                offUpdated();
                offDeleted();
                leaveRoom(couple._id);
            };
        } catch (err) {
            console.warn('Socket init failed (provider):', err && err.message);
            return undefined;
        }
    }, [couple && couple._id]);

    const addEntry = async (entry) => {
        const tempId = `temp:${Date.now()}`;
        const tempEntry = {
            id: tempId,
            apologizer: entry.apologizerName || entry.apologizer || '',
            forgiver: entry.forgiverName || entry.forgiver || '',
            reason: entry.reason || entry.why || entry.message || '',
            why: entry.reason || entry.why || entry.message || '',
            punishment: entry.punishment || entry.title || '',
            description: entry.description || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            doneAt: null,
            completedAt: null,
        };

        setEntries((prev) => [tempEntry, ...prev.filter((item) => String(item.id) !== String(tempId))]);

        try {
            const res = await healingApi.addEntry(entry);
            const payload = res.data?.data || res.data || null;
            if (payload) {
                const newEntry = mapEntry(payload);
                setEntries((prev) => {
                    const merged = [newEntry, ...prev.filter((item) => String(item.id) !== String(tempId))];
                    const seen = new Map();
                    merged.forEach((item) => {
                        const key = String(item.id || JSON.stringify(item));
                        if (!seen.has(key)) seen.set(key, item);
                    });
                    return Array.from(seen.values());
                });
            }
            return payload;
        } catch (err) {
            console.error('[HealingContext] addEntry failed', err);
            setEntries((prev) => prev.filter((item) => String(item.id) !== String(tempId)));
            try { showError && showError(err?.response?.data?.message || 'Failed to save entry. Please login and try again.'); } catch (e) { }
            throw err;
        }
    };

    const completeEntry = async (id) => {
        const previous = entries.find((entry) => String(entry.id) === String(id));
        if (previous) {
            setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? {
                ...entry,
                status: 'completed',
                doneAt: entry.doneAt || new Date().toISOString(),
                completedAt: entry.completedAt || new Date().toISOString(),
            } : entry)));
        }

        try {
            const res = await healingApi.updateEntry(id, { status: 'completed' });
            const payload = res.data?.data || res.data || null;
            if (payload) {
                const updated = mapEntry(payload);
                setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? updated : entry)));
            }
            refreshStats();
            return payload || true;
        } catch (err) {
            console.error('Failed to complete entry (provider):', err);
            if (previous) {
                setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? previous : entry)));
            }
            throw err;
        }
    };

    const reopenEntry = async (id) => {
        const previous = entries.find((entry) => String(entry.id) === String(id));
        if (previous) {
            setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? {
                ...entry,
                status: 'pending',
                doneAt: null,
                completedAt: null,
            } : entry)));
        }

        try {
            const res = await healingApi.updateEntry(id, { status: 'pending' });
            const payload = res.data?.data || res.data || null;
            if (payload) {
                const updated = mapEntry(payload);
                setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? updated : entry)));
            }
            refreshStats();
            return payload || true;
        } catch (err) {
            console.error('Failed to reopen entry (provider):', err);
            if (previous) {
                setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? previous : entry)));
            }
            throw err;
        }
    };

    const editEntry = async (id, payload) => {
        const previous = entries.find((entry) => String(entry.id) === String(id));
        if (previous) {
            setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? {
                ...entry,
                reason: payload.reason || payload.why || entry.reason || entry.why,
                why: payload.reason || payload.why || entry.reason || entry.why,
                punishment: payload.punishment || entry.punishment,
                description: payload.description || entry.description,
            } : entry)));
        }

        try {
            const res = await healingApi.updateEntry(id, payload);
            const updatedPayload = res.data?.data || res.data || null;
            if (updatedPayload) {
                const updated = mapEntry(updatedPayload);
                setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? updated : entry)));
            }
            return updatedPayload;
        } catch (err) {
            console.error('Failed to update entry (provider):', err);
            if (previous) {
                setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? previous : entry)));
            }
            throw err;
        }
    };

    const deleteEntry = async (id) => {
        const previous = entries.find((entry) => String(entry.id) === String(id));
        setEntries((prev) => prev.filter((entry) => String(entry.id) !== String(id)));

        try {
            await healingApi.deleteEntry(id);
            return true;
        } catch (err) {
            console.error('Failed to delete entry (provider):', err);
            if (previous) {
                setEntries((prev) => [previous, ...prev.filter((entry) => String(entry.id) !== String(id))]);
            }
            throw err;
        }
    };

    const forgiveEntry = async (id, message = 'Forgiven from the card view.') => {
        const previous = entries.find((entry) => String(entry.id) === String(id));
        if (previous) {
            setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? { ...entry, status: 'forgiven' } : entry)));
        }

        try {
            await healingApi.addForgiveness({ originalEntryId: id, message });
            return true;
        } catch (err) {
            console.error('Failed to forgive entry (provider):', err);
            if (previous) {
                setEntries((prev) => prev.map((entry) => (String(entry.id) === String(id) ? previous : entry)));
            }
            throw err;
        }
    };

    const addPromise = async (payload) => {
        const tempId = `temp:${Date.now()}`;
        const temp = {
            id: tempId,
            apologizer: payload.from || payload.apologizer || '',
            forgiver: payload.to || payload.forgiver || '',
            reason: payload.reason || payload.promiseText || payload.message || payload.description || '',
            why: payload.reason || payload.promiseText || payload.message || payload.description || '',
            punishment: payload.punishment || payload.title || '',
            description: payload.description || payload.message || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            doneAt: null,
            completedAt: null,
            raw: payload,
        };

        setPromises((prev) => [temp, ...prev.filter((item) => String(item.id) !== String(temp.id))]);

        try {
            const res = await healingApi.addPromise(payload);
            const saved = res.data?.data || res.data || null;
            if (saved) {
                const mapped = {
                    id: saved._id || saved.id,
                    apologizer: saved.from || saved.apologizer || '',
                    forgiver: saved.to || saved.forgiver || '',
                    reason: saved.reason || saved.why || saved.message || '',
                    why: saved.reason || saved.why || saved.message || '',
                    punishment: saved.punishment || saved.title || '',
                    description: saved.description || saved.message || '',
                    status: (saved.status === 'completed' || saved.status === 'done') ? 'completed' : 'pending',
                    createdAt: saved.createdAt,
                    doneAt: (saved.metadata && saved.metadata.completedAt) || saved.completedAt || null,
                    completedAt: (saved.metadata && saved.metadata.completedAt) || saved.completedAt || null,
                    raw: saved,
                };
                setPromises((prev) => [mapped, ...prev.filter((item) => String(item.id) !== String(tempId))]);
            }
        } catch (err) {
            console.error('Failed to add promise (provider):', err);
            setPromises((prev) => prev.filter((item) => String(item.id) !== String(tempId)));
            try { showError && showError('Failed to save promise. Please login and try again.'); } catch (e) { }
        }
    };

    const completePromise = async (id) => {
        const previous = promises.find((promise) => String(promise.id) === String(id));
        if (previous) {
            setPromises((prev) => prev.map((promise) => (String(promise.id) === String(id) ? {
                ...promise,
                status: 'completed',
                doneAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            } : promise)));
        }

        try {
            const res = await healingApi.fulfillPromise(id);
            const payload = res.data?.data || res.data || null;
            if (payload) {
                const updated = {
                    id: payload._id || payload.id,
                    apologizer: payload.from || payload.apologizer || '',
                    forgiver: payload.to || payload.forgiver || '',
                    reason: payload.reason || payload.why || payload.message || '',
                    why: payload.reason || payload.why || payload.message || '',
                    punishment: payload.punishment || payload.title || '',
                    description: payload.description || payload.message || '',
                    status: (payload.status === 'completed' || payload.status === 'done') ? 'completed' : 'pending',
                    createdAt: payload.createdAt,
                    doneAt: (payload.metadata && payload.metadata.completedAt) || payload.completedAt || null,
                    completedAt: (payload.metadata && payload.metadata.completedAt) || payload.completedAt || null,
                    raw: payload,
                };
                setPromises((prev) => prev.map((promise) => (String(promise.id) === String(id) ? updated : promise)));
            }
            return payload;
        } catch (err) {
            console.error('Failed to complete promise (provider):', err);
            if (previous) {
                setPromises((prev) => prev.map((promise) => (String(promise.id) === String(id) ? previous : promise)));
            }
            throw err;
        }
    };

    const editPromise = async (id, payload) => {
        const previous = promises.find((promise) => String(promise.id) === String(id));
        if (previous) {
            setPromises((prev) => prev.map((promise) => (String(promise.id) === String(id) ? {
                ...promise,
                reason: payload.reason || payload.why || promise.reason || promise.why,
                why: payload.reason || payload.why || promise.reason || promise.why,
                punishment: payload.punishment || promise.punishment,
                description: payload.description || promise.description,
            } : promise)));
        }

        try {
            const res = await healingApi.updateEntry(id, payload);
            const updatedPayload = res.data?.data || res.data || null;
            if (updatedPayload) {
                const updated = mapEntry(updatedPayload);
                setPromises((prev) => prev.map((promise) => (String(promise.id) === String(id) ? updated : promise)));
            }
            return updatedPayload;
        } catch (err) {
            console.error('Failed to update promise (provider):', err);
            if (previous) {
                setPromises((prev) => prev.map((promise) => (String(promise.id) === String(id) ? previous : promise)));
            }
            throw err;
        }
    };

    const deletePromise = async (id) => {
        const previous = promises.find((promise) => String(promise.id) === String(id));
        setPromises((prev) => prev.filter((promise) => String(promise.id) !== String(id)));

        try {
            await healingApi.deletePromise(id);
            return true;
        } catch (err) {
            console.error('Failed to delete promise (provider):', err);
            if (previous) {
                setPromises((prev) => [previous, ...prev.filter((promise) => String(promise.id) !== String(id))]);
            }
            throw err;
        }
    };

    const value = {
        entries,
        promises,
        loading,
        addEntry,
        completeEntry,
        reopenEntry,
        editEntry,
        deleteEntry,
        forgiveEntry,
        addPromise,
        completePromise,
        editPromise,
        deletePromise,
        setEntries,
        setPromises,
    };

    return <HealingContext.Provider value={value}>{children}</HealingContext.Provider>;
}

export default HealingContext;
