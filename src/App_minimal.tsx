import React from 'react';

function App() {
  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      alert('Backend test successful: ' + JSON.stringify(data));
    } catch (error) {
      alert('Backend test failed: ' + error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue', fontSize: '32px', marginBottom: '20px' }}>
        🎓 Online Study System
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          ✅ Frontend đã hoạt động!
        </p>
        <p style={{ fontSize: '16px', color: 'green' }}>
          React đã load thành công
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={testBackend}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔗 Test Backend API
        </button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '15px' }}>📋 Tính năng hệ thống:</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ Frontend React + TypeScript</li>
          <li>✅ Backend Node.js + Express</li>
          <li>✅ Database PostgreSQL</li>
          <li>⏳ Admin Panel</li>
          <li>⏳ Whiteboard với PDF</li>
          <li>⏳ Authentication</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Backend: <a href="http://localhost:5000/health" target="_blank">http://localhost:5000/health</a></p>
        <p>Frontend: http://localhost:5173</p>
      </div>
    </div>
  );
}

export default App;
