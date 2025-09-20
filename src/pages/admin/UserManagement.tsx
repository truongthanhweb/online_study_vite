import React from 'react';

const UserManagement: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          👥 Quản lý người dùng
        </h1>
        <p style={{ color: '#6b7280' }}>
          Tạo và quản lý tài khoản admin, giáo viên và học sinh
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
          Tính năng quản lý người dùng đang được hoàn thiện
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
            <li>✅ Tạo tài khoản admin, teacher, student</li>
            <li>✅ Chỉnh sửa thông tin người dùng</li>
            <li>✅ Kích hoạt/vô hiệu hóa tài khoản</li>
            <li>✅ Đổi mật khẩu và reset password</li>
            <li>✅ Phân quyền truy cập</li>
            <li>✅ Thống kê hoạt động người dùng</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#e0f2fe', 
          padding: '16px', 
          borderRadius: '6px',
          marginTop: '20px',
          textAlign: 'left'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            💡 Demo Accounts hiện tại:
          </h4>
          <div style={{ fontSize: '12px', color: '#0277bd', fontFamily: 'monospace' }}>
            <p>Admin: admin@school.edu.vn / admin123</p>
            <p>Teacher: teacher1@school.edu.vn / teacher123</p>
            <p>Student: student1@school.edu.vn / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
