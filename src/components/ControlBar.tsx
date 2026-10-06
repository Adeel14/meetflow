import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Minimize,
  PhoneOff,
  Hand,
  Smile,
  ChevronUp,
  Check,
} from 'lucide-react';
import { DeviceItem } from '../hooks/useMediaDevices';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onSendReaction: (emoji: string) => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onOpenSettings: () => void;
  onLeaveMeeting: () => void;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  unreadCount: number;
  participantsCount: number;
  audioDevices: DeviceItem[];
  videoDevices: DeviceItem[];
  selectedAudioId: string;
  selectedVideoId: string;
  onSelectAudioDevice: (id: string) => void;
  onSelectVideoDevice: (id: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '👏', '🎉', '😂', '😮', '💡', '🚀'];

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  handRaised,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHandRaise,
  onSendReaction,
  onToggleChat,
  onToggleParticipants,
  onOpenSettings,
  onLeaveMeeting,
  isChatOpen,
  isParticipantsOpen,
  unreadCount,
  participantsCount,
  audioDevices,
  videoDevices,
  selectedAudioId,
  selectedVideoId,
  onSelectAudioDevice,
  onSelectVideoDevice,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMicMenu, setShowMicMenu] = useState(false);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const micMenuRef = useRef<HTMLDivElement>(null);
  const camMenuRef = useRef<HTMLDivElement>(null);
  const reactionsMenuRef = useRef<HTMLDivElement>(null);

  // Monitor fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (micMenuRef.current && !micMenuRef.current.contains(e.target as Node)) {
        setShowMicMenu(false);
      }
      if (camMenuRef.current && !camMenuRef.current.contains(e.target as Node)) {
        setShowCamMenu(false);
      }
      if (reactionsMenuRef.current && !reactionsMenuRef.current.contains(e.target as Node)) {
        setShowReactionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="relative z-30 flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl shrink-0">
      {/* Left zone: Meeting quick details & active presentation status */}
      <div className="hidden sm:flex items-center gap-2 min-w-[140px]">
        {isScreenSharing && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-medium animate-pulse">
            <Monitor className="w-3.5 h-3.5" />
            <span>Presenting</span>
          </div>
        )}
      </div>

      {/* Center Zone: Core Audio / Video / Share / Reaction Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 mx-auto">
        {/* Microphone with Device Dropdown */}
        <div ref={micMenuRef} className="relative flex items-center">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-l-xl transition-all duration-150 ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-y border-l border-red-500/30'
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border-y border-l border-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={() => setShowMicMenu((v) => !v)}
            title="Audio settings"
            className={`flex items-center justify-center h-10 w-4 sm:h-11 sm:w-5 rounded-r-xl transition-all duration-150 ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-y border-r border-red-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border-y border-r border-slate-700'
            }`}
          >
            <ChevronUp className="w-3 h-3" />
          </button>

          {/* Mic Device Selector Dropdown */}
          {showMicMenu && (
            <div className="absolute bottom-14 left-0 w-64 rounded-xl bg-slate-900 border border-slate-750 p-2 shadow-2xl backdrop-blur-xl z-50 text-xs">
              <span className="block px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Microphone
              </span>
              <div className="max-h-48 overflow-y-auto space-y-0.5 mt-1">
                {audioDevices.length > 0 ? (
                  audioDevices.map((dev) => (
                    <button
                      key={dev.deviceId}
                      onClick={() => {
                        onSelectAudioDevice(dev.deviceId);
                        setShowMicMenu(false);
                      }}
                      className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        selectedAudioId === dev.deviceId
                          ? 'bg-indigo-600/30 text-indigo-300 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate pr-2">{dev.label}</span>
                      {selectedAudioId === dev.deviceId && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))
                ) : (
                  <span className="block px-2 py-1 text-slate-500">Default System Microphone</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Camera with Device Dropdown */}
        <div ref={camMenuRef} className="relative flex items-center">
          <button
            onClick={onToggleVideo}
            title={isVideoOff ? 'Start video' : 'Stop video'}
            className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-l-xl transition-all duration-150 ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-y border-l border-red-500/30'
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border-y border-l border-slate-700'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={() => setShowCamMenu((v) => !v)}
            title="Video settings"
            className={`flex items-center justify-center h-10 w-4 sm:h-11 sm:w-5 rounded-r-xl transition-all duration-150 ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-y border-r border-red-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border-y border-r border-slate-700'
            }`}
          >
            <ChevronUp className="w-3 h-3" />
          </button>

          {/* Cam Device Selector Dropdown */}
          {showCamMenu && (
            <div className="absolute bottom-14 left-0 w-64 rounded-xl bg-slate-900 border border-slate-750 p-2 shadow-2xl backdrop-blur-xl z-50 text-xs">
              <span className="block px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Camera
              </span>
              <div className="max-h-48 overflow-y-auto space-y-0.5 mt-1">
                {videoDevices.length > 0 ? (
                  videoDevices.map((dev) => (
                    <button
                      key={dev.deviceId}
                      onClick={() => {
                        onSelectVideoDevice(dev.deviceId);
                        setShowCamMenu(false);
                      }}
                      className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        selectedVideoId === dev.deviceId
                          ? 'bg-indigo-600/30 text-indigo-300 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate pr-2">{dev.label}</span>
                      {selectedVideoId === dev.deviceId && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))
                ) : (
                  <span className="block px-2 py-1 text-slate-500">Default System Camera</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Share Screen */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop screen share' : 'Share entire screen, window, or tab'}
          className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-150 border ${
            isScreenSharing
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 hover:text-white'
          }`}
        >
          {isScreenSharing ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Hand Raise */}
        <button
          onClick={onToggleHandRaise}
          title={handRaised ? 'Lower hand' : 'Raise hand'}
          className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-150 border ${
            handRaised
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700 hover:text-white'
          }`}
        >
          <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Reactions Picker */}
        <div ref={reactionsMenuRef} className="relative">
          <button
            onClick={() => setShowReactionsMenu((v) => !v)}
            title="Send reaction"
            className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all duration-150"
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showReactionsMenu && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl z-50">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactionsMenu(false);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 text-lg transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Zone: Panels, Settings, Fullscreen, and Leave */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Chat Toggle with Unread Badge */}
        <button
          onClick={onToggleChat}
          title="Meeting chat"
          className={`relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl border transition-all duration-150 ${
            isChatOpen
              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Participants Toggle with Count */}
        <button
          onClick={onToggleParticipants}
          title="Participants list"
          className={`relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl border transition-all duration-150 ${
            isParticipantsOpen
              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-slate-200 border border-slate-600">
            {participantsCount}
          </span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          className="hidden sm:flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all duration-150"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          className="hidden sm:flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all duration-150"
        >
          {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Leave Meeting (Call End) */}
        <button
          onClick={onLeaveMeeting}
          title="Leave meeting"
          className="flex items-center gap-1.5 h-10 px-3 sm:h-11 sm:px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-red-600/25 transition-all duration-150 shrink-0"
        >
          <PhoneOff className="w-4 h-4 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
};
