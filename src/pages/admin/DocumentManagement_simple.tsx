import React from 'react';

const DocumentManagement: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          📚 Quản lý tài liệu
        </h1>
        <p style={{ color: '#6b7280' }}>
          Upload và quản lý tài liệu PDF cho các lớp học
        </p>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
          Đang phát triển
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Tính năng quản lý tài liệu đang được hoàn thiện
        </p>
        
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '20px', 
          borderRadius: '6px',
          textAlign: 'left',
          marginTop: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            📋 Tính năng sẽ có:
          </h3>
          <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
            <li>✅ Upload tài liệu PDF, DOC, PPT</li>
            <li>✅ Tự động convert PDF thành ảnh</li>
            <li>✅ Phân loại theo lớp học và ngày</li>
            <li>✅ Preview và download tài liệu</li>
            <li>✅ Quản lý trạng thái xử lý</li>
            <li>✅ Tracking lượt xem và download</li>
          </ul>
        </div>

        <div style={{ marginTop: '30px' }}>
          <a 
            href="/whiteboard/1"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            🎨 Test Whiteboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
