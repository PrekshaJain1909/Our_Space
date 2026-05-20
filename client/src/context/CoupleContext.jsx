
import React, { createContext, useState, useEffect, useCallback } from "react";
import coupleApi from "../api/coupleApi";
import useAuth from "../hooks/useAuth";
import socketClient, { connectSocket, joinRoom, leaveRoom, onEvent } from '../lib/socket';

const CoupleContext = createContext(null);


export function CoupleProvider({ children }) {
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // for silent reloads
  const [error, setError] = useState(null);
  const { user } = useAuth();

  /* ---------------------- Load Couple Info ---------------------- */
  const loadCouple = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await coupleApi.getCouple();
      // Backend wraps responses in an envelope: { success, message, data }
      const payload = res.data?.data || res.data || null;
      setCouple(payload);
      setError(null);
    } catch (err) {
      console.error("Failed to load couple profile:", err);
      setError(err?.message || "Failed to load couple profile");
      // Do not setCouple(null) here to avoid unnecessary UI resets/loops
    } finally {
      setRefreshing(false);
    }
  }, []);


  /* ----------------- Initial fetch on first mount ---------------- */
  useEffect(() => {
    if (!user) return; // Only fetch couple data if logged in
    loadCouple();
  }, [user, loadCouple]);

  // Setup socket when couple is loaded
  useEffect(() => {
    if (!couple || !couple._id) return;
    try {
      connectSocket();
      joinRoom(couple._id);

      const offCreated = onEvent('task:created', (task) => {
        window.dispatchEvent(new CustomEvent('socket:task', { detail: { type: 'created', task } }));
      });

      const offUpdated = onEvent('task:updated', (task) => {
        window.dispatchEvent(new CustomEvent('socket:task', { detail: { type: 'updated', task } }));
      });

      const offDeleted = onEvent('task:deleted', (payload) => {
        window.dispatchEvent(new CustomEvent('socket:task', { detail: { type: 'deleted', payload } }));
      });

      return () => {
        offCreated(); offUpdated(); offDeleted();
        leaveRoom(couple._id);
      };
    } catch (e) {
      console.warn('Socket setup failed:', e.message);
    }
  }, [couple]);

  /* ---------------------- Update Couple Info --------------------- */
  const updateCouple = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        setError(null);
        const res = await coupleApi.updateCouple(payload);
        const payloadData = res.data?.data || res.data || null;
        setCouple(payloadData);
        return { success: true };
      } catch (err) {
        setError(err?.message || "Failed to update couple profile");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ---------------------- Update Photo --------------------- */
  const updatePhoto = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError(null);
        const res = await coupleApi.updatePhoto(formData);
        const payloadData = res.data?.data || res.data || null;
        setCouple(payloadData);
        return { success: true };
      } catch (err) {
        setError(err?.message || "Failed to update photo");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ---------------------- Field Update Helper --------------------- */
  const updateField = useCallback(async (field, value) => {
    return updateCouple({ [field]: value });
  }, [updateCouple]);

  /* ---------------------- Delete Couple (optional) --------------------- */
  const deleteCouple = useCallback(async () => {
    try {
      setLoading(true);
      await coupleApi.deleteCouple();
      setCouple(null);
      return { success: true };
    } catch (err) {
      setError("Failed to delete couple profile");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    couple,
    setCouple,
    loading,
    error,
    refreshing,
    loadCouple,
    updateCouple,
    updateField,
    updatePhoto,
    deleteCouple,
    isSet: !!couple,
  };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

export default CoupleContext;
