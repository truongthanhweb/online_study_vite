import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Video,
  FileText,
  Calendar,
  Clock,
  Play,
  Settings,
  LogOut,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { classesApi } from '../../services/api';

interface ClassInfo {
  id: number;
  class_name: string;
  class_code: string;
  description?: string;
  student_count: number;
  document_count: number;
  last_activity?: string;
  is_active: boolean;
}

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherClasses();
  }, []);

  const loadTeacherClasses = async () => {
    try {
      // Mock data for now - in real app would fetch teacher's classes
      const mockClasses: ClassInfo[] = [
        {
          id: 1,
          class_name: 'Toán học 10A1',
          class_code: 'MATH10A1',
          description: 'Lớp toán nâng cao khối 10',
          student_count: 25,
          document_count: 12,
          last_activity: '2 giờ trước',
          is_active: true
        },
        {
          id: 2,
          class_name: 'Toán học 10A2',
          class_code: 'MATH10A2',
          description: 'Lớp toán cơ bản khối 10',
          student_count: 28,
          document_count: 8,
          last_activity: '1 ngày trước',
          is_active: true
        },
        {
          id: 3,
          class_name: 'Toán học 11B1',
          class_code: 'MATH11B1',
          description: 'Lớp toán nâng cao khối 11',
          student_count: 22,
          document_count: 15,
          last_activity: '3 giờ trước',
          is_active: true
        }
      ];
      
      setClasses(mockClasses);
    } catch (error) {
      console.error('Error loading teacher classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const joinClass = (classId: number, className: string) => {
    navigate(`/classroom/${classId}`, { 
      state: { className, userRole: 'teacher' }
    });
  };

  const manageClass = (classId: number) => {
    navigate(`/teacher/class/${classId}/manage`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0 
            }}>
              👨‍🏫 Giáo viên
            </h1>
            <p style={{ 
              color: '#6b7280', 
              margin: '4px 0 0 0',
              fontSize: '14px'
            }}>
              Chào mừng, {user?.full_name}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/teacher/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Settings size={16} />
              <span>Hồ sơ</span>
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Stats Summary */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <BookOpen size={32} color="#2563eb" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>
              {classes.length}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Lớp đang dạy
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <Users size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>
              {classes.reduce((total, cls) => total + cls.student_count, 0)}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Tổng học sinh
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <FileText size={32} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>
              {classes.reduce((total, cls) => total + cls.document_count, 0)}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Tài liệu
            </p>
          </div>
        </div>

        {/* Classes List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            padding: '24px 24px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              margin: 0
            }}>
              Danh sách lớp học
            </h2>
            
            <button
              onClick={() => navigate('/teacher/class/create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              <span>Tạo lớp mới</span>
            </button>
          </div>
          
          <div style={{ padding: '16px 24px 24px' }}>
            {classes.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', margin: '0 0 8px 0' }}>
                  Chưa có lớp học nào
                </p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Tạo lớp học đầu tiên để bắt đầu giảng dạy
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {classes.map((classInfo) => (
                  <div
                    key={classInfo.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#2563eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {classInfo.class_name}
                          </h3>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: classInfo.is_active ? '#dcfce7' : '#fee2e2',
                            color: classInfo.is_active ? '#166534' : '#dc2626',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {classInfo.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                          </span>
                        </div>
                        
                        <p style={{ 
                          color: '#6b7280', 
                          margin: '0 0 8px 0',
                          fontSize: '14px'
                        }}>
                          Mã lớp: <strong>{classInfo.class_code}</strong>
                        </p>
                        
                        {classInfo.description && (
                          <p style={{ 
                            color: '#6b7280', 
                            margin: '0 0 12px 0',
                            fontSize: '14px'
                          }}>
                            {classInfo.description}
                          </p>
                        )}
                        
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280' }}>
                          <span>👥 {classInfo.student_count} học sinh</span>
                          <span>📄 {classInfo.document_count} tài liệu</span>
                          {classInfo.last_activity && (
                            <span>🕒 Hoạt động: {classInfo.last_activity}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => joinClass(classInfo.id, classInfo.class_name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <Play size={16} />
                        <span>Vào lớp học</span>
                      </button>
                      
                      <button
                        onClick={() => joinClass(classInfo.id, classInfo.class_name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <Video size={16} />
                        <span>Video Call</span>
                      </button>
                      
                      <button
                        onClick={() => manageClass(classInfo.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <Eye size={16} />
                        <span>Quản lý</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
