import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Participant } from '../../types';

interface VideoPlayerProps {
  participant: Participant;
  isLocal?: boolean;
  isSpeaking?: boolean;
  videoTrack?: any;
  audioTrack?: any;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  participant,
  isLocal = false,
  isSpeaking = false,
  videoTrack,
  onToggleVideo,
  onToggleAudio,
  className
}) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.play(videoRef.current);
    }

    return () => {
      if (videoTrack) {
        videoTrack.stop();
      }
    };
  }, [videoTrack]);

  return (
    <div className={clsx(
      'relative bg-gray-900 rounded-lg overflow-hidden',
      isSpeaking && 'ring-2 ring-success-400',
      className
    )}>
      {/* Video Container */}
      <div className="aspect-video w-full relative">
        {participant.isVideoEnabled && videoTrack ? (
          <div ref={videoRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-xl font-semibold">
                  {participant.displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-white text-sm">{participant.displayName}</p>
            </div>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute top-2 left-2">
            <div className="bg-success-500 text-white px-2 py-1 rounded text-xs font-medium">
              Đang nói
            </div>
          </div>
        )}

        {/* Audio/Video Status */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          {!participant.isAudioEnabled && (
            <div className="bg-red-500 p-1 rounded">
              <MicOff className="h-3 w-3 text-white" />
            </div>
          )}
          {!participant.isVideoEnabled && (
            <div className="bg-red-500 p-1 rounded">
              <VideoOff className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {participant.displayName}
            {isLocal && ' (Bạn)'}
          </div>
        </div>

        {/* Local Controls */}
        {isLocal && (onToggleVideo || onToggleAudio) && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {onToggleAudio && (
                <Button
                  variant={participant.isAudioEnabled ? 'secondary' : 'danger'}
                  size="sm"
                  onClick={onToggleAudio}
                  icon={participant.isAudioEnabled ? Mic : MicOff}
                />
              )}
              {onToggleVideo && (
                <Button
                  variant={participant.isVideoEnabled ? 'secondary' : 'danger'}
                  size="sm"
                  onClick={onToggleVideo}
                  icon={participant.isVideoEnabled ? Video : VideoOff}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
