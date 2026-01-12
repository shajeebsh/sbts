import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available for socket connection');
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  subscribeToBus(busId) {
    if (this.socket) {
      this.socket.emit('subscribe:bus', busId);
    }
  }

  unsubscribeFromBus(busId) {
    if (this.socket) {
      this.socket.emit('unsubscribe:bus', busId);
    }
  }

  subscribeToAllBuses() {
    if (this.socket) {
      this.socket.emit('subscribe:all-buses');
    }
  }

  unsubscribeFromAllBuses() {
    if (this.socket) {
      this.socket.emit('unsubscribe:all-buses');
    }
  }

  onBusLocation(callback) {
    if (this.socket) {
      this.socket.on('bus:location', callback);
      this.listeners.set('bus:location', callback);
    }
  }

  onBusStatus(callback) {
    if (this.socket) {
      this.socket.on('bus:status', callback);
      this.listeners.set('bus:status', callback);
    }
  }

  offBusLocation() {
    if (this.socket) {
      const callback = this.listeners.get('bus:location');
      if (callback) {
        this.socket.off('bus:location', callback);
        this.listeners.delete('bus:location');
      }
    }
  }

  offBusStatus() {
    if (this.socket) {
      const callback = this.listeners.get('bus:status');
      if (callback) {
        this.socket.off('bus:status', callback);
        this.listeners.delete('bus:status');
      }
    }
  }

  updateLocation(busId, coordinates, speed, heading) {
    if (this.socket) {
      this.socket.emit('update:location', {
        busId,
        coordinates,
        speed,
        heading,
      });
    }
  }

  updateStatus(busId, status) {
    if (this.socket) {
      this.socket.emit('update:status', { busId, status });
    }
  }
}

const socketService = new SocketService();
export default socketService;
