# 🎨 Real-time Whiteboard Setup

## 🚀 Quick Start

### 1. Start Whiteboard Server
```bash
# Option 1: Use batch file (Windows)
start-whiteboard-server.bat

# Option 2: Manual start
cd whiteboard-server
npm install
npm start
```

### 2. Start Frontend
```bash
npm run dev
```

## 📋 Features

### ✅ Real-time Collaboration
- **Teacher draws** → **Students see instantly**
- **Multi-user support** with Socket.IO
- **Connection status** indicator
- **Online user count**

### 🎯 Role-based Permissions
- **Teacher/Admin**: Can draw, clear, upload
- **Student**: View-only mode

### 🔧 Technical Stack
- **Frontend**: React + Socket.IO Client
- **Backend**: Node.js + Socket.IO Server
- **Port**: 3001 (Whiteboard Server)
- **Port**: 5173 (Vite Dev Server)

## 🌐 Server Endpoints

### Health Check
```
GET http://localhost:3001/health
```

### Room Info
```
GET http://localhost:3001/rooms/:roomId
```

## 🔌 Socket Events

### Client → Server
- `join-room`: Join whiteboard room
- `drawing-element`: Send drawing element
- `clear-canvas`: Clear whiteboard
- `leave-room`: Leave room

### Server → Client
- `drawing-element`: Receive drawing element
- `clear-canvas`: Canvas cleared
- `user-joined`: User joined room
- `user-left`: User left room
- `user-count`: Updated user count

## 🎨 Workflow

```
1. Teacher opens whiteboard → Connects to Socket server
2. Students join same room → Receive existing drawings
3. Teacher draws → Broadcast to all students
4. Students see real-time updates
5. Teacher clears → All students' canvas cleared
```

## 🐛 Troubleshooting

### Server not starting?
```bash
cd whiteboard-server
npm install
node server.js
```

### Connection issues?
- Check if port 3001 is available
- Verify CORS settings in server.js
- Check browser console for errors

### Not seeing real-time updates?
- Ensure both users are in same room (classId)
- Check Socket connection status indicator
- Verify server is running on port 3001

## 📱 Testing

1. **Open 2 browser windows**
2. **Login as Teacher** in window 1
3. **Login as Student** in window 2
4. **Go to same classroom**
5. **Teacher draws** → Student should see instantly

## 🔧 Configuration

### Change Server URL
Edit `src/services/socketService.ts`:
```typescript
connect(serverUrl: string = 'http://your-server:3001')
```

### Change Server Port
Edit `whiteboard-server/server.js`:
```javascript
const PORT = process.env.PORT || 3001;
```
