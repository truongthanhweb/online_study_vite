const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "null", "*"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "null", "*"],
  credentials: true
}));
app.use(express.json());

// Store room data
const rooms = new Map();

// Helper function to get or create room
function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      users: new Map(),
      elements: [],
      createdAt: new Date()
    });
  }
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room
  socket.on('join-room', (data) => {
    const { roomId, userName, userRole } = data;
    
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = userName;
    socket.userRole = userRole;

    const room = getRoom(roomId);
    room.users.set(socket.id, { userName, userRole, joinedAt: new Date() });

    console.log(`${userName} (${userRole}) joined room: ${roomId}`);

    // Send existing elements to new user
    socket.emit('room-state', {
      elements: room.elements,
      users: Array.from(room.users.values())
    });

    // Notify others about new user
    socket.to(roomId).emit('user-joined', { userName, userRole });

    // Send updated user count
    io.to(roomId).emit('user-count', room.users.size);
  });

  // Leave room
  socket.on('leave-room', (data) => {
    const { roomId } = data;
    handleUserLeave(socket, roomId);
  });

  // Handle drawing element
  socket.on('drawing-element', (data) => {
    const { roomId, element } = data;
    
    if (socket.roomId === roomId) {
      const room = getRoom(roomId);
      room.elements.push(element);
      
      // Broadcast to all other users in the room
      socket.to(roomId).emit('drawing-element', element);
      
      console.log(`Drawing element added to room ${roomId}:`, element.type);
    }
  });

  // Handle real-time drawing path (for smooth pen drawing)
  socket.on('drawing-path', (data) => {
    const { roomId, path, color, size } = data;
    
    if (socket.roomId === roomId) {
      // Broadcast real-time path to other users
      socket.to(roomId).emit('drawing-path', { path, color, size });
    }
  });

  // Handle clear canvas
  socket.on('clear-canvas', (data) => {
    const { roomId } = data;
    
    if (socket.roomId === roomId) {
      const room = getRoom(roomId);
      room.elements = [];
      
      // Broadcast clear to all users in the room
      io.to(roomId).emit('clear-canvas');
      
      console.log(`Canvas cleared in room ${roomId}`);
    }
  });

  // Handle erase element
  socket.on('erase-element', (data) => {
    const { roomId, elementId } = data;
    
    if (socket.roomId === roomId) {
      const room = getRoom(roomId);
      room.elements = room.elements.filter(el => el.id !== elementId);
      
      // Broadcast erase to all users in the room
      socket.to(roomId).emit('erase-element', elementId);
      
      console.log(`Element ${elementId} erased from room ${roomId}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (socket.roomId) {
      handleUserLeave(socket, socket.roomId);
    }
  });

  // Helper function to handle user leaving
  function handleUserLeave(socket, roomId) {
    const room = getRoom(roomId);
    
    if (room.users.has(socket.id)) {
      const user = room.users.get(socket.id);
      room.users.delete(socket.id);
      
      // Notify others about user leaving
      socket.to(roomId).emit('user-left', { userName: user.userName });
      
      // Send updated user count
      io.to(roomId).emit('user-count', room.users.size);
      
      console.log(`${user.userName} left room: ${roomId}`);
      
      // Clean up empty rooms after 1 hour
      if (room.users.size === 0) {
        setTimeout(() => {
          if (rooms.has(roomId) && rooms.get(roomId).users.size === 0) {
            rooms.delete(roomId);
            console.log(`Empty room ${roomId} cleaned up`);
          }
        }, 3600000); // 1 hour
      }
    }
    
    socket.leave(roomId);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({
      id: room.id,
      userCount: room.users.size,
      elementCount: room.elements.length,
      createdAt: room.createdAt
    });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Whiteboard server running on port ${PORT}`);
  console.log(`📝 Ready to handle real-time drawing sessions`);
});
