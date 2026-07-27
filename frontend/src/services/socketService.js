import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to BlogVerse Real-Time Server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Real-Time Server');
    });
  }
  return socket;
}
