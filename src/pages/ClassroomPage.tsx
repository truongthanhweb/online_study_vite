import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  MessageCircle,
  FileText,
  Users,
  Settings,
  LogOut,
  Hand,
  Gift
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VideoGrid } from '../components/classroom/VideoGrid';
import { ChatPanel } from '../components/classroom/ChatPanel';
import { Whiteboard } from '../components/classroom/Whiteboard';
import { useAuthStore } from '../store/authStore';
import { useClassStore } from '../store/classStore';
import { agoraService } from '../services/agoraService';
import { Participant, ChatMessage, WhiteboardElement } from '../types';
import toast from 'react-hot-toast';

export const ClassroomPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuthStore();
  const { currentClass, getClassById } = useClassStore();
  
  // Video call state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // UI state
  const [activePanel, setActivePanel] = useState<'chat' | 'whiteboard' | 'files' | 'participants'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Whiteboard state
  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>([]);

  useEffect(() => {
    if (classId && user) {
      getClassById(classId);
      initializeVideoCall();
    }

    return () => {
      // Cleanup video call when leaving
      agoraService.cleanup();
    };
  }, [classId, user]);

  useEffect(() => {
    if (currentClass && user) {
      // Create local participant
      const localUser: Participant = {
        userId: user.id,
        displayName: user.displayName,
        role: user.role,
        isVideoEnabled,
        isAudioEnabled,
        isScreenSharing,
        joinedAt: new Date()
      };
      setLocalParticipant(localUser);
    }
  }, [currentClass, user, isVideoEnabled, isAudioEnabled, isScreenSharing]);

  const initializeVideoCall = async () => {
    try {
      if (!classId || !user) return;

      // Setup Agora event listeners
      agoraService.onUserJoined = (agoraUser) => {
        const participant: Participant = {
          userId: agoraUser.uid.toString(),
          displayName: `User ${agoraUser.uid}`,
          role: 'student',
          isVideoEnabled: agoraUser.hasVideo,
          isAudioEnabled: agoraUser.hasAudio,
          isScreenSharing: false,
          joinedAt: new Date()
        };
        setParticipants(prev => [...prev, participant]);
        toast.success(`${participant.displayName} đã tham gia`);
      };

      agoraService.onUserLeft = (uid) => {
        setParticipants(prev => prev.filter(p => p.userId !== uid.toString()));
        toast.info(`Người dùng ${uid} đã rời khỏi lớp`);
      };

      agoraService.onConnectionStateChanged = (state) => {
        setIsConnected(state === 'CONNECTED');
      };

      // Join channel
      const channelName = `class-${classId}`;
      const token = null; // In production, get token from your server
      await agoraService.joinChannel(channelName, token, user.id);

      // Start local media
      if (isVideoEnabled) {
        await agoraService.startLocalVideo();
      }
      if (isAudioEnabled) {
        await agoraService.startLocalAudio();
      }

      setIsConnected(true);
      toast.success('Đã kết nối thành công!');
    } catch (error) {
      console.error('Failed to initialize video call:', error);
      toast.error('Không thể kết nối video call');
    }
  };

  const handleToggleVideo = async () => {
    try {
      const newState = await agoraService.toggleLocalVideo();
      setIsVideoEnabled(newState);
      toast.success(newState ? 'Đã bật camera' : 'Đã tắt camera');
    } catch (error) {
      toast.error('Không thể thay đổi trạng thái camera');
    }
  };

  const handleToggleAudio = async () => {
    try {
      const newState = await agoraService.toggleLocalAudio();
      setIsAudioEnabled(newState);
      toast.success(newState ? 'Đã bật micro' : 'Đã tắt micro');
    } catch (error) {
      toast.error('Không thể thay đổi trạng thái micro');
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await agoraService.stopScreenShare();
        setIsScreenSharing(false);
        toast.success('Đã dừng chia sẻ màn hình');
      } else {
        await agoraService.startScreenShare();
        setIsScreenSharing(true);
        toast.success('Đã bắt đầu chia sẻ màn hình');
      }
    } catch (error) {
      toast.error('Không thể chia sẻ màn hình');
    }
  };

  const handleSendMessage = (message: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: classId || '',
      userId: user.id,
      userName: user.displayName,
      message,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, newMessage]);
    // In production, send via WebSocket or Firebase
  };

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    toast.success(isHandRaised ? 'Đã hạ tay' : 'Đã giơ tay');
    // In production, notify teacher via WebSocket
  };

  const handleSendGift = (giftType: string, targetUserId: string) => {
    toast.success(`Đã tặng ${giftType}!`);
    // In production, send gift via WebSocket
  };

  const handleLeaveClass = async () => {
    if (window.confirm('Bạn có chắc chắn muốn rời khỏi lớp học?')) {
      try {
        await agoraService.leaveChannel();
        window.location.href = '/dashboard';
      } catch (error) {
        toast.error('Có lỗi khi rời khỏi lớp');
      }
    }
  };

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Loading state
  if (!currentClass) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải lớp học...</p>
        </div>
      </div>
    );
  }

  const canEditWhiteboard = user.role === 'teacher' || user.role === 'admin';

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{currentClass.name}</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm">{isConnected ? 'Đã kết nối' : 'Mất kết nối'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Controls */}
          <Button
            variant={isVideoEnabled ? 'secondary' : 'danger'}
            size="sm"
            icon={isVideoEnabled ? Video : VideoOff}
            onClick={handleToggleVideo}
          />
          <Button
            variant={isAudioEnabled ? 'secondary' : 'danger'}
            size="sm"
            icon={isAudioEnabled ? Mic : MicOff}
            onClick={handleToggleAudio}
          />
          {user.role === 'teacher' && (
            <Button
              variant={isScreenSharing ? 'primary' : 'secondary'}
              size="sm"
              icon={isScreenSharing ? MonitorOff : Monitor}
              onClick={handleToggleScreenShare}
            />
          )}
          <Button
            variant={isHandRaised ? 'success' : 'secondary'}
            size="sm"
            icon={Hand}
            onClick={handleRaiseHand}
          />
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={handleLeaveClass}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4">
          {activePanel === 'whiteboard' ? (
            <Whiteboard
              sessionId={classId || ''}
              canEdit={canEditWhiteboard}
              elements={whiteboardElements}
              onElementAdd={(element) => {
                const newElement: WhiteboardElement = {
                  ...element,
                  id: Date.now().toString(),
                  createdAt: new Date(),
                  createdBy: user.id
                };
                setWhiteboardElements(prev => [...prev, newElement]);
              }}
              onClear={() => setWhiteboardElements([])}
              className="h-full"
            />
          ) : (
            <VideoGrid
              participants={participants}
              localParticipant={localParticipant}
              onToggleLocalVideo={handleToggleVideo}
              onToggleLocalAudio={handleToggleAudio}
              className="h-full"
            />
          )}
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-1">
                <Button
                  variant={activePanel === 'chat' ? 'primary' : 'outline'}
                  size="sm"
                  icon={MessageCircle}
                  onClick={() => setActivePanel('chat')}
                >
                  Chat
                </Button>
                <Button
                  variant={activePanel === 'whiteboard' ? 'primary' : 'outline'}
                  size="sm"
                  icon={FileText}
                  onClick={() => setActivePanel('whiteboard')}
                >
                  Bảng
                </Button>
                <Button
                  variant={activePanel === 'participants' ? 'primary' : 'outline'}
                  size="sm"
                  icon={Users}
                  onClick={() => setActivePanel('participants')}
                >
                  Thành viên
                </Button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {activePanel === 'chat' && (
                <ChatPanel
                  messages={chatMessages}
                  currentUserId={user.id}
                  onSendMessage={handleSendMessage}
                  onRaiseHand={handleRaiseHand}
                  onSendGift={handleSendGift}
                  isHandRaised={isHandRaised}
                  className="h-full"
                />
              )}

              {activePanel === 'participants' && (
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Thành viên ({participants.length + 1})</h3>
                  <div className="space-y-2">
                    {/* Local user */}
                    {localParticipant && (
                      <div className="flex items-center space-x-3 p-2 bg-primary-50 rounded">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {localParticipant.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{localParticipant.displayName} (Bạn)</p>
                          <p className="text-xs text-gray-500 capitalize">{localParticipant.role}</p>
                        </div>
                        <div className="flex space-x-1">
                          {!localParticipant.isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                          {!localParticipant.isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    )}

                    {/* Remote participants */}
                    {participants.map((participant) => (
                      <div key={participant.userId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {participant.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{participant.displayName}</p>
                          <p className="text-xs text-gray-500 capitalize">{participant.role}</p>
                        </div>
                        <div className="flex space-x-1">
                          {!participant.isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                          {!participant.isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'files' && (
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Tài liệu</h3>
                  <p className="text-gray-500 text-sm">Chức năng sẽ được phát triển</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
