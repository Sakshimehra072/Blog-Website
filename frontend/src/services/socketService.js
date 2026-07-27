import { io } from 'socket.io-client';

function getSocketUrl() {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, '');
    }
    return window.location.origin;
  }
  return 'http://localhost:5000';
}

let socket = null;

export function getSocket() {
  if (!socket) {
    const targetUrl = getSocketUrl();
    socket = io(targetUrl, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to BlogVerse Real-Time Server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection fallback:', err.message);
    });
  }
  return socket;
}
