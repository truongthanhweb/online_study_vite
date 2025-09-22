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
  User,
  Download,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { classesApi } from '../../services/api';

interface ClassInfo {
  id: number;
  class_name: string;
  class_code: string;
  description?: string;
  teacher_name: string;
  student_count: number;
  document_count: number;
  last_activity?: string;
  is_active: boolean;
  schedule?: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentClasses();
  }, []);

  const loadStudentClasses = async () => {
    try {
      // Mock data for now - in real app would fetch student's enrolled classes
      const mockClasses: ClassInfo[] = [
        {
          id: 1,
          class_name: 'Toán học 10A1',
          class_code: 'MATH10A1',
          description: 'Lớp toán nâng cao khối 10',
          teacher_name: 'Nguyễn Văn An',
          student_count: 25,
          document_count: 12,
          last_activity: '2 giờ trước',
          is_active: true,
          schedule: 'Thứ 2, 4, 6 - 7:00-8:30'
        },
        {
          id: 2,
          class_name: 'Vật lý 10A1',
          class_code: 'PHYS10A1',
          description: 'Lớp vật lý cơ bản khối 10',
          teacher_name: 'Trần Thị Bình',
          student_count: 25,
          document_count: 8,
          last_activity: '1 ngày trước',
          is_active: true,
          schedule: 'Thứ 3, 5, 7 - 8:45-10:15'
        },
        {
          id: 3,
          class_name: 'Hóa học 10A1',
          class_code: 'CHEM10A1',
          description: 'Lớp hóa học cơ bản khối 10',
          teacher_name: 'Lê Văn Cường',
          student_count: 25,
          document_count: 10,
          last_activity: '3 giờ trước',
          is_active: true,
          schedule: 'Thứ 2, 4, 6 - 10:30-12:00'
        }
      ];
      
      setClasses(mockClasses);
    } catch (error) {
      console.error('Error loading student classes:', error);
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
      state: { className, userRole: 'student' }
    });
  };

  const viewClassDetails = (classId: number) => {
    navigate(`/student/class/${classId}`);
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
            borderTop: '4px solid #059669',
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
              👨‍🎓 Học sinh
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
              onClick={() => navigate('/student/profile')}
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
              <User size={16} />
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
        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0'
          }}>
            Chào mừng trở lại! 🎉
          </h2>
          <p style={{ 
            fontSize: '16px', 
            opacity: 0.9,
            margin: '0 0 20px 0'
          }}>
            Bạn đang tham gia {classes.length} lớp học. Hãy tiếp tục học tập và phát triển!
          </p>
          
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <div>
              <span style={{ opacity: 0.8 }}>Tổng lớp học: </span>
              <strong>{classes.length}</strong>
            </div>
            <div>
              <span style={{ opacity: 0.8 }}>Tài liệu: </span>
              <strong>{classes.reduce((total, cls) => total + cls.document_count, 0)}</strong>
            </div>
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
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              margin: 0
            }}>
              Lớp học của tôi
            </h2>
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
                  Chưa tham gia lớp học nào
                </p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Liên hệ giáo viên để được thêm vào lớp học
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {classes.map((classInfo) => (
                  <div
                    key={classInfo.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '24px',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#059669';
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
                            fontSize: '20px', 
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
                            {classInfo.is_active ? 'Đang diễn ra' : 'Tạm dừng'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                          <p style={{ 
                            color: '#6b7280', 
                            margin: 0,
                            fontSize: '14px'
                          }}>
                            👨‍🏫 <strong>{classInfo.teacher_name}</strong>
                          </p>
                          <p style={{ 
                            color: '#6b7280', 
                            margin: 0,
                            fontSize: '14px'
                          }}>
                            Mã lớp: <strong>{classInfo.class_code}</strong>
                          </p>
                        </div>
                        
                        {classInfo.description && (
                          <p style={{ 
                            color: '#6b7280', 
                            margin: '0 0 12px 0',
                            fontSize: '14px'
                          }}>
                            {classInfo.description}
                          </p>
                        )}
                        
                        {classInfo.schedule && (
                          <p style={{ 
                            color: '#059669', 
                            margin: '0 0 12px 0',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            📅 {classInfo.schedule}
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
                          padding: '12px 20px',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
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
                          padding: '12px 20px',
                          backgroundColor: '#7c3aed',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        <Video size={16} />
                        <span>Video Call</span>
                      </button>
                      
                      <button
                        onClick={() => viewClassDetails(classInfo.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 20px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <FileText size={16} />
                        <span>Tài liệu</span>
                      </button>
                      
                      <button
                        onClick={() => navigate(`/student/class/${classInfo.id}/chat`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 20px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <MessageSquare size={16} />
                        <span>Thảo luận</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ 
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <Calendar size={32} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Lịch học
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
              Xem lịch học hàng tuần
            </p>
            <button
              onClick={() => navigate('/student/schedule')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Xem lịch
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <Download size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Tài liệu
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
              Tải xuống tài liệu học tập
            </p>
            <button
              onClick={() => navigate('/student/documents')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Xem tài liệu
            </button>
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

export default StudentDashboard;
