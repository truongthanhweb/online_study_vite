import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useClassStore } from '../store/classStore';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Video, 
  Plus,
  Clock,
  Star
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { classes, getClassesByUser, isLoading } = useClassStore();

  useEffect(() => {
    if (user) {
      getClassesByUser(user.id, user.role);
    }
  }, [user, getClassesByUser]);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    {
      title: 'Lớp học của tôi',
      value: classes.length,
      icon: BookOpen,
      color: 'bg-primary-500'
    },
    {
      title: 'Học sinh',
      value: classes.reduce((total, cls) => total + cls.studentIds.length, 0),
      icon: Users,
      color: 'bg-success-500'
    },
    {
      title: 'Buổi học hôm nay',
      value: 3, // This would be calculated from schedules
      icon: Calendar,
      color: 'bg-warning-500'
    },
    {
      title: 'Giờ học',
      value: '24h',
      icon: Clock,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                EduConnect LMS
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, {user.displayName}
              </span>
              <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại!
          </h2>
          <p className="text-gray-600">
            {user.role === 'teacher' 
              ? 'Quản lý lớp học và tương tác với học sinh của bạn'
              : 'Tham gia các lớp học và nâng cao kiến thức'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} variant="elevated" padding="md">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.role === 'teacher' ? 'Lớp học của tôi' : 'Lớp học đã tham gia'}
                  </h3>
                  {user.role === 'teacher' && (
                    <Button variant="primary" size="sm" icon={Plus}>
                      Tạo lớp mới
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Đang tải...</p>
                  </div>
                ) : classes.length > 0 ? (
                  <div className="space-y-4">
                    {classes.slice(0, 3).map((classroom) => (
                      <div key={classroom.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {classroom.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {classroom.studentIds.length} học sinh
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" icon={Video}>
                          Vào lớp
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {user.role === 'teacher' 
                        ? 'Chưa có lớp học nào. Tạo lớp đầu tiên của bạn!'
                        : 'Chưa tham gia lớp học nào.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader title="Hoạt động gần đây" />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-success-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Tham gia lớp Toán 10A</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-primary-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Hoàn thành bài tập</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-warning-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Nhận điểm 9.5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader title="Thành tích" />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Học sinh xuất sắc</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Tham gia tích cực</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
