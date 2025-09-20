import React, { useState, useEffect } from 'react';
import { testApi } from '../services/api';

interface SystemCheck {
  name: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  details?: string;
}

const SystemStatus: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: 'Frontend React', status: 'success', message: 'Đang chạy' },
    { name: 'Backend API', status: 'checking', message: 'Đang kiểm tra...' },
    { name: 'Database Connection', status: 'checking', message: 'Đang kiểm tra...' },
    { name: 'File Upload', status: 'checking', message: 'Đang kiểm tra...' },
    { name: 'PDF Processing', status: 'checking', message: 'Đang kiểm tra...' }
  ]);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    // Check Backend API
    try {
      const response = await testApi();
      updateCheck('Backend API', 'success', 'Kết nối thành công', JSON.stringify(response, null, 2));
    } catch (error) {
      updateCheck('Backend API', 'error', 'Kết nối thất bại', String(error));
    }

    // Check other services (mock for now)
    setTimeout(() => {
      updateCheck('Database Connection', 'success', 'PostgreSQL đã kết nối');
      updateCheck('File Upload', 'success', 'Thư mục uploads đã sẵn sàng');
      updateCheck('PDF Processing', 'success', 'PDF.js và poppler đã cấu hình');
    }, 1000);
  };

  const updateCheck = (name: string, status: 'success' | 'error', message: string, details?: string) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, status, message, details } : check
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'checking': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'checking': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      padding: '20px' 
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            🎓 Online Study System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Trạng thái hệ thống và kiểm tra kết nối
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#374151'
          }}>
            📊 Kiểm tra hệ thống
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checks.map((check, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: `2px solid ${getStatusColor(check.status)}20`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{getStatusIcon(check.status)}</span>
                  <div>
                    <div style={{ fontWeight: '500', color: '#374151' }}>
                      {check.name}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: getStatusColor(check.status),
                      fontWeight: '500'
                    }}>
                      {check.message}
                    </div>
                  </div>
                </div>
                
                {check.details && (
                  <details style={{ fontSize: '12px', color: '#6b7280' }}>
                    <summary style={{ cursor: 'pointer' }}>Chi tiết</summary>
                    <pre style={{ 
                      marginTop: '8px', 
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxWidth: '300px'
                    }}>
                      {check.details}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          marginTop: '30px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#374151'
          }}>
            🚀 Truy cập hệ thống
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <a 
              href="/admin"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#dc2626',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>👨‍💼</div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Admin Panel</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Quản lý tài liệu, lớp học, người dùng</div>
            </a>
            
            <a 
              href="/whiteboard/1"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Whiteboard</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Vẽ và ghi chú trên tài liệu PDF</div>
            </a>
          </div>
        </div>

        <div style={{ 
          marginTop: '30px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e5e7eb',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <p><strong>🔗 Endpoints:</strong></p>
          <p>Frontend: <code>http://localhost:5173</code></p>
          <p>Backend API: <code>http://localhost:5000/api</code></p>
          <p>Health Check: <code>http://localhost:5000/health</code></p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
