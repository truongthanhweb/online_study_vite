import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Users,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Maximize2,
  Minimize2,
  PenTool,
  Monitor,
  Hand
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import VideoConference from '../../components/video/VideoConference';
import WhiteboardPage from '../WhiteboardPage';

interface ClassroomState {
  className?: string;
  userRole?: 'teacher' | 'student';
}

const ClassroomPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const state = location.state as ClassroomState;
  const className = state?.className || `Lớp học ${classId}`;
  const userRole = state?.userRole || user?.role || 'student';

  const [activeTab, setActiveTab] = useState<'video' | 'whiteboard' | 'both'>('both');
  const [participants, setParticipants] = useState(1);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = `${className} - Online Study System`;
    
    return () => {
      document.title = 'Online Study System';
    };
  }, [className]);

  const handleLeaveClass = () => {
    const confirmLeave = window.confirm('Bạn có chắc chắn muốn rời khỏi lớp học?');
    if (confirmLeave) {
      // Navigate back based on user role
      switch (userRole) {
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'teacher': return '#2563eb';
      case 'student': return '#059669';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'teacher': return '👨‍🏫';
      case 'student': return '👨‍🎓';
      default: return '👤';
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#1f2937'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#111827',
        borderBottom: '1px solid #374151',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: 0,
              color: 'white'
            }}>
              📚 {className}
            </h1>
            <p style={{ 
              fontSize: '12px', 
              color: '#9ca3af',
              margin: '2px 0 0 0'
            }}>
              {getRoleIcon()} {user?.full_name} ({userRole})
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: getRoleColor(),
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <Users size={14} />
            <span>{participants} người</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          backgroundColor: '#374151',
          borderRadius: '8px',
          padding: '4px'
        }}>
          <button
            onClick={() => setActiveTab('video')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'video' ? '#2563eb' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Video size={16} />
            <span>Video</span>
          </button>
          
          <button
            onClick={() => setActiveTab('whiteboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'whiteboard' ? '#2563eb' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PenTool size={16} />
            <span>Bảng trắng</span>
          </button>
          
          <button
            onClick={() => setActiveTab('both')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'both' ? '#2563eb' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Monitor size={16} />
            <span>Cả hai</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              padding: '8px',
              backgroundColor: showChat ? '#059669' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Chat"
          >
            <MessageSquare size={16} />
          </button>
          
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            style={{
              padding: '8px',
              backgroundColor: showParticipants ? '#059669' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Danh sách người tham gia"
          >
            <Users size={16} />
          </button>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: '#374151' }} />
          
          <button
            onClick={handleLeaveClass}
            style={{
              padding: '8px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={16} />
            <span>Rời lớp</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Conference Area */}
        {(activeTab === 'video' || activeTab === 'both') && (
          <div style={{ 
            flex: activeTab === 'both' ? 1 : 2,
            backgroundColor: '#1f2937'
          }}>
            <VideoConference
              roomName={classId || 'default'}
              userName={user?.full_name || 'Guest'}
              userRole={userRole as 'admin' | 'teacher' | 'student'}
              onLeave={handleLeaveClass}
            />
          </div>
        )}

        {/* Whiteboard Area */}
        {(activeTab === 'whiteboard' || activeTab === 'both') && (
          <div style={{ 
            flex: activeTab === 'both' ? 1 : 2,
            backgroundColor: 'white',
            borderLeft: activeTab === 'both' ? '1px solid #374151' : 'none'
          }}>
            <WhiteboardPage />
          </div>
        )}

        {/* Chat Sidebar */}
        {showChat && (
          <div style={{
            width: '300px',
            backgroundColor: '#111827',
            borderLeft: '1px solid #374151',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #374151',
              color: 'white'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MessageSquare size={18} />
                Chat lớp học
              </h3>
            </div>
            
            <div style={{ 
              flex: 1, 
              padding: '16px',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div>
                <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Tính năng chat đang được phát triển
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Participants Sidebar */}
        {showParticipants && (
          <div style={{
            width: '250px',
            backgroundColor: '#111827',
            borderLeft: '1px solid #374151',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #374151',
              color: 'white'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users size={18} />
                Người tham gia ({participants})
              </h3>
            </div>
            
            <div style={{ 
              flex: 1, 
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: getRoleColor(),
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  {getRoleIcon()}
                </div>
                <div>
                  <p style={{ 
                    color: 'white', 
                    margin: 0, 
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {user?.full_name}
                  </p>
                  <p style={{ 
                    color: '#9ca3af', 
                    margin: 0, 
                    fontSize: '12px'
                  }}>
                    {userRole} (Bạn)
                  </p>
                </div>
              </div>
              
              <div style={{ 
                color: '#9ca3af',
                textAlign: 'center',
                fontSize: '14px',
                marginTop: '20px'
              }}>
                Người khác sẽ hiển thị khi tham gia
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div style={{
        backgroundColor: '#111827',
        borderTop: '1px solid #374151',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isAudioEnabled ? '#374151' : '#ef4444',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title={isAudioEnabled ? 'Tắt mic' : 'Bật mic'}
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={() => setIsVideoEnabled(!isVideoEnabled)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isVideoEnabled ? '#374151' : '#ef4444',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title={isVideoEnabled ? 'Tắt camera' : 'Bật camera'}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {userRole === 'student' && (
          <button
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f59e0b',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Giơ tay"
          >
            <Hand size={20} />
          </button>
        )}

        <div style={{
          padding: '8px 16px',
          backgroundColor: '#374151',
          borderRadius: '20px',
          color: '#9ca3af',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%'
          }} />
          <span>Đang kết nối</span>
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;
