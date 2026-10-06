import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  ShieldAlert,
  ArrowLeft,
  Volume2,
  Sparkles,
  Camera,
} from 'lucide-react';
import { DeviceItem } from '../hooks/useMediaDevices';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { PWAInstallButton } from './PWAInstallButton';

interface LobbyProps {
  roomId: string;
  roomName: string;
  hasPassword?: boolean;
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  audioDevices: DeviceItem[];
  videoDevices: DeviceItem[];
  audioOutputDevices: DeviceItem[];
  selectedAudioId: string;
  selectedVideoId: string;
  selectedOutputId: string;
  onSelectAudioDevice: (id: string) => void;
  onSelectVideoDevice: (id: string) => void;
  onSelectOutputDevice: (id: string) => void;
  onJoin: (name: string, password?: string) => void;
  onBack: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  roomId,
  roomName,
  hasPassword = false,
  localStream,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  audioDevices,
  videoDevices,
  audioOutputDevices,
  selectedAudioId,
  selectedVideoId,
  selectedOutputId,
  onSelectAudioDevice,
  onSelectVideoDevice,
  onSelectOutputDevice,
  onJoin,
  onBack,
}) => {
  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem('meetflow_name') || ''
  );
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [virtualBg, setVirtualBg] = useState<'none' | 'blur' | 'office'>('none');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Audio level meter
  const { audioLevel, isSpeaking } = useAudioAnalyser(localStream, !isMuted);

  useEffect(() => {
    if (videoRef.current) {
      if (localStream && !isVideoOff) {
        videoRef.current.srcObject = localStream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [localStream, isVideoOff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();
    if (!trimmedName) return;

    if (hasPassword && !password.trim()) {
      setPasswordError('Meeting requires a password');
      return;
    }

    localStorage.setItem('meetflow_name', trimmedName);
    onJoin(trimmedName, password.trim() || undefined);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-3">
          <PWAInstallButton variant="nav" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Green Room Preview</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Camera Preview Card */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-video max-h-[420px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Virtual office backdrop if selected */}
              {virtualBg === 'office' && (
                <img
                  src="/src/assets/images/meetflow_backdrop_office_1790616101020.jpg"
                  alt="Office Backdrop"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Video Element */}
              {localStream && !isVideoOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover scale-x-[-1] transition-all duration-300 ${
                    virtualBg === 'blur' ? 'blur-[3px]' : ''
                  }`}
                />
              ) : (
                /* Avatar when video is off */
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-indigo-900/80 border border-indigo-700/50 text-2xl font-bold text-white shadow-xl">
                    {getInitials(displayName || 'User')}
                    {isSpeaking && (
                      <span className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-60" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400 mt-3 font-medium">Camera is off</span>
                </div>
              )}

              {/* Real-time Voice Audio Meter Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                {isMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Mic className={`w-3.5 h-3.5 ${isSpeaking ? 'text-emerald-400' : 'text-slate-400'}`} />
                )}
                {/* Audio visualizer bars */}
                <div className="flex items-center gap-0.5 h-3 w-16 bg-slate-800/80 rounded px-1 overflow-hidden">
                  <div
                    className={`h-1.5 rounded transition-all duration-75 ${
                      isMuted ? 'w-0' : isSpeaking ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                    style={{ width: `${isMuted ? 0 : Math.min(100, audioLevel * 1.5)}%` }}
                  />
                </div>
              </div>

              {/* Floating Camera & Mic Toggles */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-10">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`flex items-center justify-center h-12 w-12 rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-95 ${
                    isMuted
                      ? 'bg-red-500/90 text-white hover:bg-red-600'
                      : 'bg-slate-900/85 text-slate-200 hover:bg-slate-800 border border-slate-700'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={onToggleVideo}
                  className={`flex items-center justify-center h-12 w-12 rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-95 ${
                    isVideoOff
                      ? 'bg-red-500/90 text-white hover:bg-red-600'
                      : 'bg-slate-900/85 text-slate-200 hover:bg-slate-800 border border-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Virtual Background Options */}
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="text-slate-400 font-medium">Virtual Backdrop:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setVirtualBg('none')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    virtualBg === 'none' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => setVirtualBg('blur')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    virtualBg === 'blur' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blur
                </button>
                <button
                  type="button"
                  onClick={() => setVirtualBg('office')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    virtualBg === 'office' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Executive Office
                </button>
              </div>
            </div>
          </div>

          {/* Right: Join Form & Device Selectors */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Ready to join?
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{roomName}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Room ID: {roomId}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Password if required */}
              {hasPassword && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Meeting Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter room password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  {passwordError && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {passwordError}
                    </p>
                  )}
                </div>
              )}

              {/* Device Selector Controls */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                {/* Microphone Select */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Microphone
                  </label>
                  <select
                    value={selectedAudioId}
                    onChange={(e) => onSelectAudioDevice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
                  >
                    {audioDevices.length > 0 ? (
                      audioDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label}
                        </option>
                      ))
                    ) : (
                      <option value="">Default Microphone</option>
                    )}
                  </select>
                </div>

                {/* Camera Select */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Camera
                  </label>
                  <select
                    value={selectedVideoId}
                    onChange={(e) => onSelectVideoDevice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
                  >
                    {videoDevices.length > 0 ? (
                      videoDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label}
                        </option>
                      ))
                    ) : (
                      <option value="">Default Camera</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Join Action CTA */}
              <button
                type="submit"
                disabled={!displayName.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.99]"
              >
                <span>Join Meeting</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lobby Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto w-full">
        <span>MeetFlow · “Meet. Talk. Share. Connect.”</span>
        <span className="text-slate-400 font-medium">Owned & Created by <strong className="text-slate-200">Mirza Adeel</strong></span>
      </footer>
    </div>
  );
};
