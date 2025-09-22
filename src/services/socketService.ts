import { io, Socket } from 'socket.io-client';

interface DrawingElement {
  id: string;
  type: 'pen' | 'text' | 'shape' | 'line';
  points?: { x: number; y: number }[];
  text?: string;
  position?: { x: number; y: number };
  color: string;
  size: number;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  width?: number;
  height?: number;
  timestamp: number;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(serverUrl: string = 'http://localhost:3001') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to whiteboard server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from whiteboard server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId: string, userName: string, userRole: string) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, userName, userRole });
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', { roomId });
    }
  }

  // Drawing events
  sendDrawingElement(roomId: string, element: DrawingElement) {
    if (this.socket && this.isConnected) {
      console.log('SocketService: Sending drawing element to room:', roomId, element);
      this.socket.emit('drawing-element', { roomId, element });
    } else {
      console.error('SocketService: Cannot send drawing element - not connected');
    }
  }

  sendDrawingPath(roomId: string, path: { x: number; y: number }[], color: string, size: number) {
    if (this.socket && this.isConnected) {
      this.socket.emit('drawing-path', { roomId, path, color, size });
    }
  }

  sendClearCanvas(roomId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('clear-canvas', { roomId });
    }
  }

  sendEraseElement(roomId: string, elementId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('erase-element', { roomId, elementId });
    }
  }

  // Event listeners
  onDrawingElement(callback: (element: DrawingElement) => void) {
    if (this.socket) {
      console.log('🔧 Setting up drawing-element listener');
      this.socket.on('drawing-element', (data) => {
        console.log('🔧 Raw drawing-element received:', data);
        callback(data);
      });
    }
  }

  onDrawingPath(callback: (data: { path: { x: number; y: number }[], color: string, size: number }) => void) {
    if (this.socket) {
      this.socket.on('drawing-path', callback);
    }
  }

  onClearCanvas(callback: () => void) {
    if (this.socket) {
      this.socket.on('clear-canvas', callback);
    }
  }

  onEraseElement(callback: (elementId: string) => void) {
    if (this.socket) {
      this.socket.on('erase-element', callback);
    }
  }

  onUserJoined(callback: (data: { userName: string, userRole: string }) => void) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: { userName: string }) => void) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
