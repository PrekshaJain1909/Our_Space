import { useState, useCallback } from "react";

export default function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null); // for passing payload to modal

  /* open modal & optionally pass data */
  const openModal = useCallback((payload = null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  /* close modal & clear data */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  /* toggle */
  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    data, // dynamic payload for modal
  };
}
