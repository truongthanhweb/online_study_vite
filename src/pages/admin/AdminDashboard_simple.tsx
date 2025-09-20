import React, { useState, useEffect } from 'react';
import { testApi } from '../../services/api';

const AdminDashboard: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    checkAPI();
  }, []);

  const checkAPI = async () => {
    try {
      const response = await testApi();
      setApiStatus('success');
      setApiMessage('Backend API connected successfully');
    } catch (error) {
      setApiStatus('error');
      setApiMessage('Failed to connect to backend API');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          👨‍💼 Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Quản lý hệ thống học tập trực tuyến
        </p>
      </div>

      {/* API Status */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          🔗 Trạng thái kết nối
        </h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '12px',
          backgroundColor: apiStatus === 'success' ? '#f0fdf4' : apiStatus === 'error' ? '#fef2f2' : '#fffbeb',
          borderRadius: '6px',
          border: `1px solid ${apiStatus === 'success' ? '#bbf7d0' : apiStatus === 'error' ? '#fecaca' : '#fed7aa'}`
        }}>
          <span style={{ fontSize: '20px' }}>
            {apiStatus === 'success' ? '✅' : apiStatus === 'error' ? '❌' : '⏳'}
          </span>
          <span style={{ 
            color: apiStatus === 'success' ? '#166534' : apiStatus === 'error' ? '#dc2626' : '#d97706',
            fontWeight: '500'
          }}>
            {apiMessage}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>-</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Tài liệu</div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏫</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>-</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Lớp học</div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>-</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Người dùng</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          ⚡ Thao tác nhanh
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a 
            href="/admin/documents"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>📄</span>
            <div>
              <div style={{ fontWeight: '500' }}>Quản lý tài liệu</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Upload và quản lý tài liệu PDF</div>
            </div>
          </a>

          <a 
            href="/admin/classes"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>🏫</span>
            <div>
              <div style={{ fontWeight: '500' }}>Quản lý lớp học</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Tạo lớp học và quản lý học sinh</div>
            </div>
          </a>

          <a 
            href="/admin/users"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>👥</span>
            <div>
              <div style={{ fontWeight: '500' }}>Quản lý người dùng</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Tạo và quản lý tài khoản</div>
            </div>
          </a>

          <a 
            href="/whiteboard/1"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>🎨</span>
            <div>
              <div style={{ fontWeight: '500' }}>Whiteboard Demo</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Test whiteboard với tài liệu</div>
            </div>
          </a>
        </div>
      </div>

      {/* System Info */}
      <div style={{ 
        marginTop: '30px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <p><strong>🔗 System Endpoints:</strong></p>
        <p>• Frontend: http://localhost:5173</p>
        <p>• Backend API: http://localhost:5000/api</p>
        <p>• Health Check: http://localhost:5000/health</p>
        <p>• Database: PostgreSQL (online_study)</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
