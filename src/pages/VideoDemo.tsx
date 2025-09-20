import React, { useState } from 'react';
import VideoConference from '../components/video/VideoConference';

const VideoDemo: React.FC = () => {
  const [roomName, setRoomName] = useState('demo-class-1');
  const [userName, setUserName] = useState('Demo User');
  const [userRole, setUserRole] = useState<'admin' | 'teacher' | 'student'>('teacher');
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            🎥 Video Conference Demo
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Test Jitsi Meet integration với server sr-pacific.vn
          </p>
        </div>

        {!showVideo ? (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
              Cấu hình cuộc họp
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Tên phòng:
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Nhập tên phòng họp"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Tên của bạn:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Nhập tên hiển thị"
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Vai trò:
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'admin' | 'teacher' | 'student')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="admin">👨‍💼 Admin</option>
                <option value="teacher">👨‍🏫 Teacher</option>
                <option value="student">👨‍🎓 Student</option>
              </select>
            </div>

            <button
              onClick={() => setShowVideo(true)}
              disabled={!roomName.trim() || !userName.trim()}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: !roomName.trim() || !userName.trim() ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: !roomName.trim() || !userName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🚀 Bắt đầu cuộc họp
            </button>

            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px',
              fontSize: '14px',
              color: '#0369a1'
            }}>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>💡 Thông tin:</p>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                <li>Sử dụng server Jitsi tự host: <strong>sr-pacific.vn</strong></li>
                <li>Không giới hạn thời gian họp</li>
                <li>Hỗ trợ chia sẻ màn hình, chat, recording</li>
                <li>Phân quyền theo role (Admin/Teacher có nhiều tính năng hơn)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            height: '80vh'
          }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#1f2937', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  🎥 {roomName}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  {userName} ({userRole})
                </p>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ❌ Rời phòng
              </button>
            </div>
            
            <div style={{ height: 'calc(100% - 80px)' }}>
              <VideoConference
                roomName={roomName}
                userName={userName}
                userRole={userRole}
                onLeave={() => setShowVideo(false)}
              />
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <p>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
              ← Quay lại trang chủ
            </a>
            {' | '}
            <a href="/whiteboard/1" style={{ color: '#2563eb', textDecoration: 'none' }}>
              Whiteboard với Video →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoDemo;
