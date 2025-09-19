import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Extend Window interface for Jitsi API
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
    jitsiAPI: any;
  }
}

// Simple Login Page
function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 EduConnect LMS</h1>
          <p className="text-gray-600">Đăng nhập để vào lớp học</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@educonnect.com"
                defaultValue="admin@educonnect.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                defaultValue="123456"
              />
            </div>
            <Link 
              to="/dashboard"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Đăng nhập (Demo)
            </Link>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Demo: admin@educonnect.com / 123456
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Dashboard Page
function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">🎓 EduConnect LMS</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Xin chào, Admin</span>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Quản lý lớp học và tham gia học trực tuyến</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <span className="text-white text-lg">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lớp học</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <span className="text-white text-lg">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Học sinh</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <span className="text-white text-lg">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <span className="text-white text-lg">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Giờ học</p>
                <p className="text-2xl font-bold text-gray-900">8h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Lớp học của tôi</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                + Tạo lớp mới
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Class 1 */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Toán 10A</h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Đang hoạt động</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">Đại số và Hình học cơ bản</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">8 học sinh</span>
                  <Link 
                    to="/classroom/math-10a"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    🎥 Vào lớp
                  </Link>
                </div>
              </div>

              {/* Class 2 */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Lý 11B</h4>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Sắp bắt đầu</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">Vật lý chuyển động</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">12 học sinh</span>
                  <Link 
                    to="/classroom/physics-11b"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    🎥 Vào lớp
                  </Link>
                </div>
              </div>

              {/* Class 3 */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Hóa 12C</h4>
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Đã kết thúc</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">Hóa học hữu cơ</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">15 học sinh</span>
                  <Link 
                    to="/classroom/chemistry-12c"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    🎥 Vào lớp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Jitsi Meet Classroom Page
function ClassroomPage() {
  const [isJitsiLoaded, setIsJitsiLoaded] = React.useState(false);
  const [participantCount, setParticipantCount] = React.useState(1);
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [isVideoMuted, setIsVideoMuted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('jitsi');
  
  // Get room ID from URL
  const roomId = window.location.pathname.split('/').pop() || 'default-room';
  
  React.useEffect(() => {
    // Load Jitsi Meet when component mounts
    loadJitsiMeet();
    
    return () => {
      // Cleanup when component unmounts
      const jitsiContainer = document.getElementById('jitsi-container');
      if (jitsiContainer) {
        jitsiContainer.innerHTML = '';
      }
    };
  }, []);

  const loadJitsiMeet = () => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      initializeJitsi();
    };
    document.head.appendChild(script);
  };

  const initializeJitsi = () => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: `educonnect-${roomId}`,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        prejoinPageEnabled: false,
        disableInviteFunctions: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen', 
          'hangup', 'chat', 'raisehand', 'tileview'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
      },
      userInfo: {
        displayName: 'Học viên EduConnect'
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    
    // Event listeners
    api.addEventListeners({
      participantJoined: () => {
        setParticipantCount(prev => prev + 1);
      },
      participantLeft: () => {
        setParticipantCount(prev => Math.max(1, prev - 1));
      },
      videoConferenceJoined: () => {
        setIsJitsiLoaded(true);
      },
      audioMuteStatusChanged: (event: any) => {
        setIsAudioMuted(event.muted);
      },
      videoMuteStatusChanged: (event: any) => {
        setIsVideoMuted(event.muted);
      }
    });

    // Store API reference for controls
    window.jitsiAPI = api;
  };

  const handleToggleAudio = () => {
    if (window.jitsiAPI) {
      window.jitsiAPI.executeCommand('toggleAudio');
    }
  };

  const handleToggleVideo = () => {
    if (window.jitsiAPI) {
      window.jitsiAPI.executeCommand('toggleVideo');
    }
  };

  const handleToggleScreenShare = () => {
    if (window.jitsiAPI) {
      window.jitsiAPI.executeCommand('toggleShareScreen');
    }
  };

  const handleRaiseHand = () => {
    if (window.jitsiAPI) {
      window.jitsiAPI.executeCommand('toggleRaiseHand');
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Bạn có chắc chắn muốn rời khỏi lớp học?')) {
      if (window.jitsiAPI) {
        window.jitsiAPI.dispose();
      }
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">🎓 EduConnect - Lớp {roomId.toUpperCase()}</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isJitsiLoaded ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-sm">
              {isJitsiLoaded ? `${participantCount} người tham gia` : 'Đang kết nối...'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleToggleAudio}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              isAudioMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isAudioMuted ? '🎤❌' : '🎤'} Micro
          </button>
          <button 
            onClick={handleToggleVideo}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              isVideoMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isVideoMuted ? '📹❌' : '📹'} Camera
          </button>
          <button 
            onClick={handleToggleScreenShare}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
          >
            🖥️ Chia sẻ
          </button>
          <button 
            onClick={handleRaiseHand}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-sm"
          >
            ✋ Giơ tay
          </button>
          <button 
            onClick={handleLeaveRoom}
            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
          >
            ❌ Rời lớp
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {activeTab === 'jitsi' && (
            <div id="jitsi-container" className="w-full h-full">
              {!isJitsiLoaded && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Đang tải Jitsi Meet...</h3>
                    <p className="text-gray-300">Vui lòng đợi trong giây lát</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'whiteboard' && (
            <div className="w-full h-full bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Whiteboard</h3>
                <p className="text-gray-600">Tính năng whiteboard sẽ được tích hợp</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white flex flex-col">
          {/* Tabs */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab('jitsi')}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  activeTab === 'jitsi' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                🎥 Video
              </button>
              <button 
                onClick={() => setActiveTab('whiteboard')}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  activeTab === 'whiteboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                🎨 Bảng
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                👥 Thành viên
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">✅ Jitsi Meet đã sẵn sàng!</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Hoàn toàn miễn phí</li>
                  <li>• Không giới hạn thời gian</li>
                  <li>• Chất lượng HD</li>
                  <li>• Chia sẻ màn hình</li>
                  <li>• Chat tích hợp</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Tính năng</h4>
                <div className="space-y-2">
                  <button 
                    onClick={handleRaiseHand}
                    className="w-full bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm hover:bg-yellow-200"
                  >
                    ✋ Giơ tay phát biểu
                  </button>
                  <button className="w-full bg-red-100 text-red-800 px-3 py-2 rounded text-sm hover:bg-red-200">
                    ❤️ Thích bài giảng
                  </button>
                  <button className="w-full bg-green-100 text-green-800 px-3 py-2 rounded text-sm hover:bg-green-200">
                    ⭐ Tặng sao cho giáo viên
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Thống kê</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Người tham gia:</span>
                    <span className="font-medium">{participantCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái âm thanh:</span>
                    <span className={isAudioMuted ? 'text-red-600' : 'text-green-600'}>
                      {isAudioMuted ? 'Tắt' : 'Bật'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái video:</span>
                    <span className={isVideoMuted ? 'text-red-600' : 'text-green-600'}>
                      {isVideoMuted ? 'Tắt' : 'Bật'}
                    </span>
                  </div>
                </div>
              </div>
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
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/classroom/:classId" element={<ClassroomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
