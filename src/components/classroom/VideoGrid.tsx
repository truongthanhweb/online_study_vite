import React from 'react';
import { clsx } from 'clsx';
import { VideoPlayer } from './VideoPlayer';
import type { Participant } from '../../types';

interface VideoGridProps {
  participants: Participant[];
  localParticipant?: Participant;
  speakingParticipants?: string[];
  onToggleLocalVideo?: () => void;
  onToggleLocalAudio?: () => void;
  getVideoTrack?: (userId: string) => any;
  getAudioTrack?: (userId: string) => any;
  className?: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localParticipant,
  speakingParticipants = [],
  onToggleLocalVideo,
  onToggleLocalAudio,
  getVideoTrack,
  getAudioTrack,
  className
}) => {
  const allParticipants = localParticipant 
    ? [localParticipant, ...participants]
    : participants;

  const getGridClasses = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (count <= 9) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  const gridClasses = getGridClasses(allParticipants.length);

  return (
    <div className={clsx('h-full', className)}>
      {allParticipants.length === 0 ? (
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">Chưa có ai tham gia</p>
          </div>
        </div>
      ) : (
        <div className={clsx(
          'grid gap-4 h-full',
          gridClasses
        )}>
          {allParticipants.map((participant) => {
            const isLocal = participant.userId === localParticipant?.userId;
            const isSpeaking = speakingParticipants.includes(participant.userId);
            const videoTrack = getVideoTrack?.(participant.userId);
            const audioTrack = getAudioTrack?.(participant.userId);

            return (
              <VideoPlayer
                key={participant.userId}
                participant={participant}
                isLocal={isLocal}
                isSpeaking={isSpeaking}
                videoTrack={videoTrack}
                audioTrack={audioTrack}
                onToggleVideo={isLocal ? onToggleLocalVideo : undefined}
                onToggleAudio={isLocal ? onToggleLocalAudio : undefined}
                className={clsx(
                  'min-h-0',
                  allParticipants.length === 1 && 'h-full',
                  allParticipants.length > 1 && 'aspect-video'
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
