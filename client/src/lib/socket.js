import { io as ioClient } from 'socket.io-client';

let socket = null;

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/,'');
  if (import.meta.env.DEV) return 'http://localhost:5000';
  return 'https://our-love-space.onrender.com';
};

export function connectSocket() {
  if (socket && socket.connected) return socket;
  const base = getBaseURL();
  // Attach auth token from localStorage so server can validate handshake
  const token = typeof window !== 'undefined' && (localStorage.getItem('auth_token') || localStorage.getItem('token'));
  socket = ioClient(base, { transports: ['websocket', 'polling'], auth: { token } });
  socket.on('connect', () => console.log('[socket] connected', socket.id));
  socket.on('disconnect', () => console.log('[socket] disconnected'));
  socket.on('connect_error', (err) => console.error('[socket] connect_error', err && err.message));
  socket.on('error', (err) => console.error('[socket] error', err && err.message));
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function joinRoom(coupleId) {
  if (!socket) connectSocket();
  if (!socket) return;
  socket.emit('join', { coupleId });
}

export function leaveRoom(coupleId) {
  if (!socket) return;
  socket.emit('leave', { coupleId });
}

export function onEvent(event, cb) {
  if (!socket) connectSocket();
  if (!socket) return () => {};
  socket.on(event, cb);
  return () => socket.off(event, cb);
}

export default {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  onEvent,
};
