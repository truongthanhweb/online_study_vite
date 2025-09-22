import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

const SocketDebug: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('test-room');
  const [userName, setUserName] = useState('Test User');
  const [messages, setMessages] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('Hello World');

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    const socket = socketService.connect('http://localhost:3001');
    
    socket.on('connect', () => {
      setIsConnected(true);
      addMessage('✅ Connected to socket server');
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
      addMessage('❌ Disconnected from socket server');
    });
    
    socket.on('connect_error', (error) => {
      addMessage(`❌ Connection error: ${error.message}`);
    });

    socketService.onUserJoined((data) => {
      addMessage(`👋 User joined: ${data.userName} (${data.userRole})`);
    });

    socketService.onUserLeft((data) => {
      addMessage(`👋 User left: ${data.userName}`);
    });

    socketService.onDrawingElement((element) => {
      addMessage(`🎨 Drawing received: ${element.type} (${element.color})`);
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const handleJoinRoom = () => {
    if (isConnected) {
      socketService.joinRoom(roomId, userName, 'teacher');
      addMessage(`🚪 Joining room: ${roomId} as ${userName}`);
    }
  };

  const handleSendDrawing = () => {
    if (isConnected) {
      const testElement = {
        id: Date.now().toString(),
        type: 'pen' as const,
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        color: '#ff0000',
        size: 3,
        timestamp: Date.now()
      };
      
      socketService.sendDrawingElement(roomId, testElement);
      addMessage(`🎨 Sent test drawing to room: ${roomId}`);
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Socket.IO Debug Console</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          padding: '10px', 
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ padding: '5px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ padding: '5px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleJoinRoom}
            disabled={!isConnected}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: isConnected ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: isConnected ? 'pointer' : 'not-allowed'
            }}
          >
            Join Room
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={handleSendDrawing}
            disabled={!isConnected}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: isConnected ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: isConnected ? 'pointer' : 'not-allowed'
            }}
          >
            Send Test Drawing
          </button>
          <button 
            onClick={handleClearMessages}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Clear Messages
          </button>
        </div>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '400px', 
        overflowY: 'scroll',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>📝 Debug Messages:</h3>
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
              {msg}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Make sure whiteboard server is running on port 3001</li>
          <li>Enter room ID and user name</li>
          <li>Click "Join Room" to connect</li>
          <li>Click "Send Test Drawing" to test drawing sync</li>
          <li>Open another browser tab with same room ID to test real-time sync</li>
        </ol>
      </div>
    </div>
  );
};

export default SocketDebug;
