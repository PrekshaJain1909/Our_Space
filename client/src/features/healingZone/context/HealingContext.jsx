import React, { createContext, useContext, useState, useEffect } from 'react';
import healingApi from '../../../api/healingApi';
import useToast from '../../../hooks/useToast';
import { connectSocket, joinRoom, leaveRoom, onEvent } from '../../../lib/socket';
import CoupleContext from '../../../context/CoupleContext';

const HealingContext = createContext(null);

export function useHealing() {
  return useContext(HealingContext);
}

export function HealingProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [promises, setPromises] = useState([]);
  const [loading, setLoading] = useState(true);

  // dedupe helper
  const dedupeById = (arr) => {
    const seen = new Map();
    (arr || []).forEach((it) => {
      const id = (it && (it._id || it.id || it.id === 0 ? it.id : null)) || (it && it.id) || (it && it._id) || null;
      const key = id ? String(id) : JSON.stringify(it);
      if (!seen.has(key)) seen.set(key, it);
    });
    return Array.from(seen.values());
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
        // Map entries but exclude promises (promises are tracked separately)
        const mappedEntries = (dedupeById(entriesPayload) || [])
          .filter((e) => String((e.type || '').toLowerCase()) !== 'promise')
          .map((e) => ({
          id: e._id || e.id,
          apologizer: e.from || e.apologizer || 'Unknown',
          forgiver: e.to || e.forgiver || 'Unknown',
          why: e.message || e.why || '',
          punishment: e.title || e.punishment || '',
          description: e.message || e.description || '',
          status: (e.status === 'completed' || e.status === 'done') ? 'done' : 'pending',
          createdAt: e.createdAt || new Date().toISOString(),
          doneAt: (e.metadata && e.metadata.completedAt) || e.completedAt || null,
          raw: e,
        }));

        // Map promises and dedupe by id
        const mappedPromises = (dedupeById(promisesPayload) || []).map((e) => ({
          id: e._id || e.id,
          apologizer: e.from || e.apologizer || 'Unknown',
          forgiver: e.to || e.forgiver || 'Unknown',
          why: e.message || e.why || '',
          punishment: e.title || e.punishment || '',
          description: e.message || e.description || '',
          status: (e.status === 'completed' || e.status === 'done') ? 'done' : 'pending',
          createdAt: e.createdAt || new Date().toISOString(),
          doneAt: (e.metadata && e.metadata.completedAt) || e.completedAt || null,
          raw: e,
        }));

        // Deduplicate mappedPromises by id to avoid accidental duplicates
        const promiseMap = new Map();
        mappedPromises.forEach((p) => {
          const k = String(p.id || JSON.stringify(p));
          if (!promiseMap.has(k)) promiseMap.set(k, p);
        });

        setEntries(mappedEntries || []);
        setPromises(Array.from(promiseMap.values()));
      } catch (err) {
        console.error('Failed to load healing data (provider):', err);
        setEntries([]);
        setPromises([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, []);
  const { error: showError } = useToast();

  // Socket wiring: join couple room if available
  const { couple } = React.useContext(CoupleContext);

  useEffect(() => {
    if (!couple || !couple._id) return;
    try {
      connectSocket();
      joinRoom(couple._id);

      const offCreated = onEvent('healing:created', (payload) => {
        const e = payload;
        const mapped = {
          id: e._id || e.id,
          apologizer: e.from || e.apologizer || '',
          forgiver: e.to || e.forgiver || '',
          why: e.message || e.why || '',
          punishment: e.title || e.punishment || '',
          description: e.message || e.description || '',
          status: (e.status === 'completed') ? 'done' : 'pending',
          createdAt: e.createdAt,
          doneAt: (e.metadata && e.metadata.completedAt) || e.completedAt || null,
          raw: e,
        };

        // If entry is a promise type, update promises list, otherwise update entries
        if (String(e.type || '').toLowerCase() === 'promise') {
          setPromises((prev) => {
            const merged = [mapped, ...prev.filter((p) => String(p.id) !== String(mapped.id))];
            const seen = new Map();
            merged.forEach((it) => {
              const k = String(it.id || (it.raw && (it.raw._id || it.raw.id)) || JSON.stringify(it));
              if (!seen.has(k)) seen.set(k, it);
            });
            return Array.from(seen.values());
          });
        } else {
          setEntries((prev) => {
            const merged = [mapped, ...prev.filter((p) => String(p.id) !== String(mapped.id))];
            const seen = new Map();
            merged.forEach((it) => {
              const k = String(it.id || (it.raw && (it.raw._id || it.raw.id)) || JSON.stringify(it));
              if (!seen.has(k)) seen.set(k, it);
            });
            return Array.from(seen.values());
          });
        }
      });

      const offUpdated = onEvent('healing:updated', (payload) => {
        const e = payload;
        const mapped = {
          id: e._id || e.id,
          apologizer: e.from || e.apologizer || '',
          forgiver: e.to || e.forgiver || '',
          why: e.message || e.why || '',
          punishment: e.title || e.punishment || '',
          description: e.message || e.description || '',
          status: (e.status === 'completed') ? 'done' : 'pending',
          createdAt: e.createdAt,
          doneAt: (e.metadata && e.metadata.completedAt) || e.completedAt || null,
          raw: e,
        };

        if (String(e.type || '').toLowerCase() === 'promise') {
          setPromises((prev) => prev.map((it) => (String(it.id) === String(mapped.id) ? mapped : it)));
        } else {
          setEntries((prev) => prev.map((it) => (String(it.id) === String(mapped.id) ? mapped : it)));
        }
      });

      const offDeleted = onEvent('healing:deleted', (payload) => {
        const { id } = payload || {};
        if (!id) return;
        setEntries((prev) => prev.filter((it) => String(it.id) !== String(id)));
        setPromises((prev) => prev.filter((it) => String(it.id) !== String(id)));
      });

      return () => {
        offCreated();
        offUpdated();
        offDeleted();
        leaveRoom(couple._id);
      };
    } catch (err) {
      console.warn('Socket init failed (provider):', err && err.message);
    }
  }, [couple && couple._id]);

  // API actions
  const addEntry = async (entry) => {
    const tempId = `temp:${Date.now()}`;
    const tempEntry = {
      id: tempId,
      apologizer: entry.apologizerName || entry.apologizer || '',
      forgiver: entry.forgiverName || entry.forgiver || '',
      why: entry.reason || entry.why || entry.message || '',
      punishment: entry.punishment || entry.title || '',
      description: entry.description || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      doneAt: null,
    };

    setEntries((prev) => [tempEntry, ...prev.filter((p) => String(p.id) !== String(tempEntry.id))]);

    try {
      const res = await healingApi.addEntry(entry);
      const payload = res.data?.data || res.data || null;
      if (payload) {
        const newEntry = {
          id: payload._id || payload.id,
          apologizer: payload.from || payload.apologizer || '',
          forgiver: payload.to || payload.forgiver || '',
          why: payload.message || payload.why || '',
          punishment: payload.title || payload.punishment || '',
          description: payload.message || payload.description || '',
          status: (payload.status === 'completed') ? 'done' : 'pending',
          createdAt: payload.createdAt,
          doneAt: (payload.metadata && payload.metadata.completedAt) || payload.completedAt || null,
          raw: payload,
        };
        setEntries((prev) => {
          const merged = [newEntry, ...prev.filter((i) => String(i.id) !== String(tempId))];
          const seen = new Map();
          merged.forEach((it) => {
            const k = String(it.id || (it.raw && (it.raw._id || it.raw.id)) || JSON.stringify(it));
            if (!seen.has(k)) seen.set(k, it);
          });
          return Array.from(seen.values());
        });
      }
    } catch (err) {
      console.error('Failed to save healing entry (provider):', err);
      // remove optimistic entry on failure
      setEntries((prev) => prev.filter((p) => String(p.id) !== String(tempId)));
      try { showError && showError('Failed to save entry. Please login and try again.'); } catch(e){}
    }
  };

  const completeEntry = async (id) => {
    setEntries((prev) => prev.map((e) => (String(e.id) === String(id) ? { ...e, status: 'done', doneAt: new Date().toISOString() } : e)));

    const isObjectId = (v) => typeof v === 'string' && /^[0-9a-fA-F]{24}$/.test(v);
    if (!isObjectId(id)) {
      console.warn('Skipping server complete call for non-ObjectId id:', id);
      return;
    }

    try {
      const res = await healingApi.completeEntry(id);
      const payload = res.data?.data || res.data || null;
      if (payload) {
        const updated = {
          id: payload._id || payload.id,
          apologizer: payload.from || payload.apologizer || '',
          forgiver: payload.to || payload.forgiver || '',
          why: payload.message || payload.why || '',
          punishment: payload.title || payload.punishment || '',
          description: payload.message || payload.description || '',
          status: (payload.status === 'completed') ? 'done' : 'pending',
          createdAt: payload.createdAt,
          doneAt: (payload.metadata && payload.metadata.completedAt) || payload.completedAt || null,
          raw: payload,
        };
        setEntries((prev) => prev.map((e) => (String(e.id) === String(id) ? updated : e)));
      }
    } catch (err) {
      console.error('Failed to complete entry (provider):', err);
      setEntries((prev) => prev.map((e) => (String(e.id) === String(id) ? { ...e, status: 'pending', doneAt: null } : e)));
    }
  };

  const addPromise = async (payload) => {
    const tempId = `temp:${Date.now()}`;
    const temp = {
      id: tempId,
      apologizer: payload.from || payload.apologizer || '',
      forgiver: payload.to || payload.forgiver || '',
      why: payload.promiseText || payload.message || payload.description || '',
      punishment: payload.title || '',
      description: payload.description || payload.message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      doneAt: null,
      raw: payload,
    };

    setPromises((prev) => [temp, ...prev.filter((p) => String(p.id) !== String(temp.id))]);

    try {
      const res = await healingApi.addPromise(payload);
      const saved = res.data?.data || res.data || null;
      if (saved) {
        const mapped = {
          id: saved._id || saved.id,
          apologizer: saved.from || saved.apologizer || '',
          forgiver: saved.to || saved.forgiver || '',
          why: saved.message || saved.why || '',
          punishment: saved.title || saved.punishment || '',
          description: saved.message || saved.description || '',
          status: (saved.status === 'completed') ? 'done' : 'pending',
          createdAt: saved.createdAt,
          doneAt: (saved.metadata && saved.metadata.completedAt) || saved.completedAt || null,
          raw: saved,
        };
        setPromises((prev) => [mapped, ...prev.filter((p) => String(p.id) !== String(tempId))]);
      }
    } catch (err) {
      console.error('Failed to add promise (provider):', err);
      // remove optimistic item on failure
      setPromises((prev) => prev.filter((p) => String(p.id) !== String(tempId)));
      try { showError && showError('Failed to save promise. Please login and try again.'); } catch(e){}
    }
  };

  const completePromise = async (id) => {
    setPromises((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, status: 'done', doneAt: new Date().toISOString() } : p)));

    const isObjectId = (v) => typeof v === 'string' && /^[0-9a-fA-F]{24}$/.test(v);
    if (!isObjectId(id)) {
      console.warn('Skipping server complete call for non-ObjectId id:', id);
      return;
    }

    try {
      const res = await healingApi.fulfillPromise(id);
      const payload = res.data?.data || res.data || null;
      if (payload) {
        const updated = {
          id: payload._id || payload.id,
          apologizer: payload.from || payload.apologizer || '',
          forgiver: payload.to || payload.forgiver || '',
          why: payload.message || payload.why || '',
          punishment: payload.title || payload.punishment || '',
          description: payload.message || payload.description || '',
          status: (payload.status === 'completed') ? 'done' : 'pending',
          createdAt: payload.createdAt,
          doneAt: (payload.metadata && payload.metadata.completedAt) || payload.completedAt || null,
          raw: payload,
        };
        setPromises((prev) => prev.map((p) => (String(p.id) === String(id) ? updated : p)));
      }
    } catch (err) {
      console.error('Failed to complete promise (provider):', err);
      setPromises((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, status: 'pending', doneAt: null } : p)));
    }
  };

  const value = {
    entries,
    promises,
    loading,
    addEntry,
    completeEntry,
    addPromise,
    completePromise,
    setEntries,
    setPromises,
  };

  return <HealingContext.Provider value={value}>{children}</HealingContext.Provider>;
}

export default HealingContext;