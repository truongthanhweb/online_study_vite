import React from 'react';

const ClassManagement: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          🏫 Quản lý lớp học
        </h1>
        <p style={{ color: '#6b7280' }}>
          Tạo và quản lý lớp học, phân công giáo viên và học sinh
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
          Tính năng quản lý lớp học đang được hoàn thiện
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
            <li>✅ Tạo và chỉnh sửa lớp học</li>
            <li>✅ Phân công giáo viên chủ nhiệm</li>
            <li>✅ Thêm/xóa học sinh khỏi lớp</li>
            <li>✅ Xem danh sách tài liệu của lớp</li>
            <li>✅ Thống kê số lượng học sinh</li>
            <li>✅ Quản lý năm học và học kỳ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
