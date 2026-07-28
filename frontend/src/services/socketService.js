import { io } from 'socket.io-client';
import { getSocketBaseUrl } from '../utils/apiUrl';

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
    const socketUrl = getSocketBaseUrl();

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
