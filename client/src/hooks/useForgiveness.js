import { useEffect, useState, useRef } from 'react';
import forgivenessApi from '../api/forgivenessApi';
import { v4 as uuidv4 } from 'uuid';

export function useForgiveness({ coupleId, token }) {
  const [forgiven, setForgiven] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    forgivenessApi.getForgiveness({ page: 1, limit: 200 })
      .then((forgivenResp) => {
        if (!mounted) return;
        const forgivenList = (forgivenResp && forgivenResp.data && (forgivenResp.data.data || forgivenResp.data)) || [];
        setForgiven(Array.isArray(forgivenList) ? forgivenList : []);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [coupleId]);

  // Real-time channel removed: forgiveness updates are pulled via API

  const saveForgiveness = async ({ originalEntryId, forgivenessMessage, title }) => {
    const tempId = `temp-${uuidv4()}`;
    const now = new Date().toISOString();
    const optimisticForgiveness = {
      _id: tempId,
      originalEntryId: originalEntryId || null,
      linkedEntryId: originalEntryId || null,
      forgivenessType: originalEntryId ? 'linked' : 'standalone',
      title: title || 'Forgiveness',
      forgivenessMessage,
      forgivenAt: now,
      status: 'forgiven',
      forgivenBy: { _id: 'me', name: 'You' },
      forgivenTo: null,
      createdAt: now,
    };

    setForgiven((prev) => [optimisticForgiveness, ...prev]);

    try {
      const payload = { forgivenessMessage };
      if (originalEntryId) payload.originalEntryId = originalEntryId;
      if (title) payload.title = title;
      const resp = await forgivenessApi.createForgiveness(payload);
      const body = resp.data || resp;
      const saved = (body && (body.data || body)) || null;
      const list = body && body.list;
      if (list && Array.isArray(list)) {
        setForgiven(list);
      } else if (saved) {
        setForgiven((prev) => prev.map((f) => (f._id === tempId ? saved : f)));
      }
      return saved;
    } catch (err) {
      // revert optimistic
      setForgiven((prev) => prev.filter((f) => f._id !== tempId));
      throw err;
    }
  };

  const markDone = async (forgivenessId) => {
    try {
      const resp = await forgivenessApi.markDone(forgivenessId);
      const body = resp.data || resp;
      const list = body && body.list;
      if (list && Array.isArray(list)) setForgiven(list);
      return body.data || body;
    } catch (err) {
      throw err;
    }
  };

  return { forgiven, loading, saveForgiveness, markDone };
}
