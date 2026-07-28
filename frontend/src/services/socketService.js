import { io } from 'socket.io-client';

const dummySocket = {
  on: () => {},
  off: () => {},
  emit: () => {},
  connected: false,
  id: null
};

let socket = null;

export function getSocket() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (isLocal ? 'http://localhost:5000' : null);

    if (!socketUrl) {
      return dummySocket;
    }

    if (!socket) {
      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnectionAttempts: 3,
        timeout: 3000
      });

      socket.on('connect', () => {
        console.log('⚡ Connected to BlogVerse Real-Time Server:', socket.id);
      });

      socket.on('connect_error', () => {
        // Suppress socket error logs in browser console
      });
    }
    return socket;
  }

  return dummySocket;
}
