import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText,
  Plus,
  Settings,
  BarChart3,
  Activity,
  LogOut,
  Search,
  Filter
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usersApi, classesApi, documentsApi } from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalClasses: number;
  totalDocuments: number;
  activeStudents: number;
  activeTeachers: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClasses: 0,
    totalDocuments: 0,
    activeStudents: 0,
    activeTeachers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats (mock data for now since we don't have real backend)
      setStats({
        totalUsers: 25,
        totalClasses: 8,
        totalDocuments: 45,
        activeStudents: 18,
        activeTeachers: 5
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Quản lý người dùng',
      description: 'Thêm, sửa, xóa tài khoản admin, giáo viên, học sinh',
      icon: Users,
      color: '#3b82f6',
      action: () => navigate('/admin/users')
    },
    {
      title: 'Quản lý lớp học',
      description: 'Tạo lớp học, phân công giáo viên, quản lý học sinh',
      icon: GraduationCap,
      color: '#10b981',
      action: () => navigate('/admin/classes')
    },
    {
      title: 'Quản lý tài liệu',
      description: 'Upload, phân loại và quản lý tài liệu học tập',
      icon: FileText,
      color: '#f59e0b',
      action: () => navigate('/admin/documents')
    },
    {
      title: 'Báo cáo thống kê',
      description: 'Xem báo cáo hoạt động và thống kê hệ thống',
      icon: BarChart3,
      color: '#8b5cf6',
      action: () => navigate('/admin/reports')
    }
  ];

  const recentActivities = [
    { type: 'user', message: 'Học sinh Nguyễn Văn A đã đăng ký', time: '5 phút trước' },
    { type: 'document', message: 'Tài liệu "Toán học lớp 10" được upload', time: '15 phút trước' },
    { type: 'class', message: 'Lớp "10A1" được tạo bởi GV Trần Thị B', time: '30 phút trước' },
    { type: 'system', message: 'Hệ thống được cập nhật', time: '1 giờ trước' }
  ];

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
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Đang tải dữ liệu...</p>
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
              👨‍💼 Admin Dashboard
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
              onClick={() => navigate('/admin/settings')}
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
              <span>Cài đặt</span>
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
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {stats.totalUsers}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Tổng người dùng
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={24} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {stats.totalClasses}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Lớp học
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={24} color="#f59e0b" />
              </div>
              <div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {stats.totalDocuments}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Tài liệu
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#e0e7ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={24} color="#8b5cf6" />
              </div>
              <div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {stats.activeStudents}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Học sinh hoạt động
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Quick Actions */}
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
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1f2937',
                margin: 0
              }}>
                Thao tác nhanh
              </h2>
            </div>
            
            <div style={{ padding: '16px 24px 24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = action.color;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: action.color + '20',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <action.icon size={20} color={action.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {action.title}
                      </h3>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {action.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
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
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1f2937',
                margin: 0
              }}>
                Hoạt động gần đây
              </h2>
            </div>
            
            <div style={{ padding: '16px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      marginTop: '6px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {activity.message}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default AdminDashboard;
