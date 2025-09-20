import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WhiteboardPage from './pages/WhiteboardPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import DocumentManagement from './pages/admin/DocumentManagement';
import ClassManagement from './pages/admin/ClassManagement';
import UserManagement from './pages/admin/UserManagement';

// Simple Login Page
function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 Online Study System</h1>
          <p className="text-gray-600">Hệ thống học tập trực tuyến</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Chọn vai trò để truy cập</h2>
            </div>
            
            <Link 
              to="/admin"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>👨‍💼</span>
              <span>Admin Panel</span>
            </Link>
            
            <Link 
              to="/whiteboard/1"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>🎨</span>
              <span>Whiteboard (Lớp 1)</span>
            </Link>
            
            <Link 
              to="/whiteboard/2"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>🎨</span>
              <span>Whiteboard (Lớp 2)</span>
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Thông tin đăng nhập:</p>
              <p>• Admin: admin@school.edu.vn / admin123</p>
              <p>• Teacher: teacher1@school.edu.vn / teacher123</p>
              <p>• Student: student1@school.edu.vn / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home/Login Page */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Whiteboard Routes */}
          <Route path="/whiteboard/:classId" element={<WhiteboardPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
