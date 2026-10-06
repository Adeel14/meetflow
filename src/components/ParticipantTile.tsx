import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Pin,
  PinOff,
  Maximize2,
  MoreVertical,
  Hand,
  Monitor,
  VolumeX,
  UserX,
  Crown,
} from 'lucide-react';
import { Participant } from '../types/meeting';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';

interface ParticipantTileProps {
  participant: Participant;
  isPinned?: boolean;
  onTogglePin?: () => void;
  mirror?: boolean;
  isDominant?: boolean;
  canModerate?: boolean;
  onMuteParticipant?: (peerId: string) => void;
  onKickParticipant?: (peerId: string) => void;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  participant,
  isPinned = false,
  onTogglePin,
  mirror = false,
  isDominant = false,
  canModerate = false,
  onMuteParticipant,
  onKickParticipant,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Audio level and speaking detection
  const { isSpeaking: detectedSpeaking } = useAudioAnalyser(
    participant.stream,
    !participant.isMuted
  );

  const isSpeaking = participant.isSpeaking || detectedSpeaking;

  // Sync video stream and call play to prevent autoplay pause
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
      videoRef.current.play().catch((err) => {
        console.debug('Video autoplay playback info:', err);
      });
    }
  }, [participant.stream]);

  // Sync audio stream for remote participants to guarantee voice playback even when camera is off
  useEffect(() => {
    if (audioRef.current && participant.stream && !participant.isLocal) {
      if (audioRef.current.srcObject !== participant.stream) {
        audioRef.current.srcObject = participant.stream;
      }
      audioRef.current.play().catch((err) => {
        console.debug('Audio autoplay playback info:', err);
      });
    }
  }, [participant.stream, participant.isLocal]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || 'U'
    );
  };

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-slate-900 border transition-all duration-200 select-none ${
        isSpeaking
          ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/40'
          : isPinned
          ? 'border-indigo-500/80 ring-1 ring-indigo-500/30'
          : 'border-slate-800 hover:border-slate-700'
      } ${isDominant ? 'w-full h-full' : 'w-full h-full min-h-[160px]'}`}
    >
      {/* Video Stream Element: mounted if stream exists to preserve track pipelines */}
      {participant.stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal} // Prevent audio feedback for local user
          className={`h-full w-full object-cover transition-transform duration-200 ${
            participant.isVideoOff ? 'hidden' : 'block'
          } ${mirror && participant.isLocal ? 'scale-x-[-1]' : ''}`}
        />
      )}

      {/* Dedicated Remote Audio Player: keeps voice playing even if camera is off */}
      {!participant.isLocal && participant.stream && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
        />
      )}

      {/* Video Off Avatar Placeholder */}
      {(!participant.stream || participant.isVideoOff) && (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4">
          <div className="relative">
            {/* Animated speaking pulse rings */}
            {isSpeaking && (
              <div
                className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
                style={{ animationDuration: '1.2s' }}
              />
            )}
            <div
              className={`relative flex items-center justify-center rounded-full font-semibold text-white transition-all duration-200 shadow-xl ${
                isDominant ? 'h-28 w-28 text-3xl' : 'h-16 w-16 text-xl'
              } ${
                isSpeaking
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-4 ring-emerald-400/50'
                  : participant.isOwner
                  ? 'bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 ring-2 ring-amber-400/50 text-slate-950 font-bold'
                  : 'bg-gradient-to-tr from-slate-700 to-indigo-900'
              }`}
            >
              {participant.isOwner ? (
                <Crown className="w-8 h-8 text-slate-950" />
              ) : (
                getInitials(participant.name)
              )}
            </div>
          </div>
          <span className="mt-3 text-xs font-medium text-slate-400 flex items-center gap-1">
            <span>{participant.name}</span>
            {participant.isLocal && <span>(You)</span>}
            {participant.isOwner && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                👑 Owner
              </span>
            )}
          </span>
        </div>
      )}

      {/* Top Bar Indicators (Hand Raised, Screen Share, Pin status) */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5">
          {participant.handRaised && (
            <div className="flex items-center gap-1 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-md text-xs font-semibold backdrop-blur-md shadow-lg animate-bounce">
              <Hand className="w-3.5 h-3.5 fill-current" />
              <span>Hand Raised</span>
            </div>
          )}
          {participant.isScreenSharing && (
            <div className="flex items-center gap-1 bg-indigo-600/90 text-white px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-md">
              <Monitor className="w-3 h-3" />
              <span>Presenting</span>
            </div>
          )}
        </div>

        {/* Quick Actions (visible on hover) */}
        <div className="flex items-center gap-1 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              title={isPinned ? 'Unpin' : 'Pin to spotlight'}
              className="p-1.5 rounded-md bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-md transition-colors"
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5 text-indigo-400" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            title="Full screen view"
            className="p-1.5 rounded-md bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-md transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {canModerate && !participant.isLocal && !participant.isOwner && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-md bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 top-8 z-30 w-44 rounded-lg bg-slate-900/95 border border-slate-700 py-1 shadow-2xl backdrop-blur-xl text-xs text-slate-200"
                >
                  <button
                    onClick={() => {
                      onMuteParticipant?.(participant.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-800 text-left text-slate-200 cursor-pointer"
                  >
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mute for Everyone</span>
                  </button>
                  <button
                    onClick={() => {
                      onKickParticipant?.(participant.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 hover:bg-red-500/20 text-left text-red-400 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Remove from Meeting</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Identity & Audio Status */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800/80 max-w-[90%]">
          {/* Audio Status Icon */}
          {participant.isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
          ) : isSpeaking ? (
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="w-0.5 h-2 bg-emerald-400 animate-pulse rounded-full" />
              <span className="w-0.5 h-3.5 bg-emerald-400 animate-pulse delay-75 rounded-full" />
              <span className="w-0.5 h-2.5 bg-emerald-400 animate-pulse delay-150 rounded-full" />
            </div>
          ) : (
            <Mic className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}

          {/* Name & Badges */}
          <span className="text-xs font-semibold text-slate-200 truncate">
            {participant.name}
          </span>
          {participant.isLocal && (
            <span className="text-[10px] text-slate-400 shrink-0 font-normal">
              (You)
            </span>
          )}
          {participant.isOwner ? (
            <span className="text-[10px] text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold shrink-0 flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5" />
              Owner
            </span>
          ) : participant.isHost ? (
            <span className="text-[10px] text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 px-1 py-0.2 rounded font-medium shrink-0">
              Host
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
