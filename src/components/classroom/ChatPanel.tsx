import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Hand } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ChatMessage } from '../../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  onRaiseHand?: () => void;
  onSendGift?: (giftType: string, targetUserId: string) => void;
  isHandRaised?: boolean;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onRaiseHand,
  onSendGift,
  isHandRaised = false,
  className
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😀', '😊', '😍', '🤔', '👍', '👏', '❤️', '🎉', '💯', '🔥'];
  const gifts = [
    { type: 'star', emoji: '⭐', name: 'Ngôi sao' },
    { type: 'trophy', emoji: '🏆', name: 'Cúp vàng' },
    { type: 'heart', emoji: '❤️', name: 'Trái tim' },
    { type: 'thumbsup', emoji: '👍', name: 'Like' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const formatMessageTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm', { locale: vi });
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
          <div className="flex space-x-2">
            {onRaiseHand && (
              <Button
                variant={isHandRaised ? 'success' : 'outline'}
                size="sm"
                icon={Hand}
                onClick={onRaiseHand}
                className={isHandRaised ? 'animate-pulse' : ''}
              >
                {isHandRaised ? 'Đã giơ tay' : 'Giơ tay'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && (
                    <p className="text-xs text-gray-500 mb-1 px-3">
                      {message.userName}
                    </p>
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Smile className="h-4 w-4" />
              </button>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={!newMessage.trim()}
            />
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-2">
            {gifts.map((gift) => (
              <button
                key={gift.type}
                type="button"
                onClick={() => onSendGift?.(gift.type, 'all')}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title={`Tặng ${gift.name}`}
              >
                <span>{gift.emoji}</span>
                <span>{gift.name}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
