import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import WhiteboardPage from './pages/WhiteboardPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import DocumentManagement from './pages/admin/DocumentManagement';
import ClassManagement from './pages/admin/ClassManagement';
import UserManagement from './pages/admin/UserManagement';

// Simple Login Page
function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student' | null>(null);

  const handleRoleSelect = (role: 'admin' | 'teacher' | 'student') => {
    setSelectedRole(role);
    // In a real app, this would authenticate with backend
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      alert('✅ Backend connection successful!\n' + JSON.stringify(data, null, 2));
    } catch (error) {
      alert('❌ Backend connection failed:\n' + error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            🎓 Online Study System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Hệ thống quản lý tài liệu học tập trực tuyến
          </p>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px',
            textAlign: 'center',
            color: '#374151'
          }}>
            Chọn vai trò để truy cập
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link 
              to="/admin"
              onClick={() => handleRoleSelect('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#dc2626',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              <span style={{ fontSize: '20px' }}>👨‍💼</span>
              <span>Admin Panel - Quản lý hệ thống</span>
            </Link>
            
            <Link 
              to="/whiteboard/1"
              onClick={() => handleRoleSelect('teacher')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              <span style={{ fontSize: '20px' }}>👨‍🏫</span>
              <span>Teacher - Whiteboard Lớp 1</span>
            </Link>
            
            <Link 
              to="/whiteboard/2"
              onClick={() => handleRoleSelect('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#059669',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <span style={{ fontSize: '20px' }}>👨‍🎓</span>
              <span>Student - Whiteboard Lớp 2</span>
            </Link>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '30px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <button 
            onClick={testBackend}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            🔗 Test Backend Connection
          </button>
          
          <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
            <p><strong>Demo Accounts:</strong></p>
            <p>Admin: admin@school.edu.vn / admin123</p>
            <p>Teacher: teacher1@school.edu.vn / teacher123</p>
            <p>Student: student1@school.edu.vn / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home/Login Page */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Whiteboard Routes */}
          <Route 
            path="/whiteboard/:classId" 
            element={
              <ProtectedRoute>
                <WhiteboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
