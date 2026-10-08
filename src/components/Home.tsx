import React, { useState } from 'react';
import {
  Video,
  Plus,
  LogIn,
  Shield,
  Copy,
  Check,
  Monitor,
  Mic,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Lock,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  Crown,
  Palette,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { InstallModal } from './InstallModal';
import { OwnerAuth } from '../types/meeting';
import { normalizeRoomId } from '../utils/roomId';
import { useTheme } from '../context/ThemeContext';

interface HomeProps {
  onCreateMeeting: (name: string, password?: string, preferredRoomId?: string) => void;
  onJoinMeeting: (roomId: string) => void;
  ownerAuth?: OwnerAuth;
  onOpenOwnerLogin?: () => void;
  onOpenOwnerDashboard?: () => void;
  onOpenThemeSwitcher?: () => void;
}

function generateDisplayId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(3)}-${part(3)}-${part(3)}`;
}

export const Home: React.FC<HomeProps> = ({
  onCreateMeeting,
  onJoinMeeting,
  ownerAuth,
  onOpenOwnerLogin,
  onOpenOwnerDashboard,
  onOpenThemeSwitcher,
}) => {
  const { theme } = useTheme();
  const [meetingName, setMeetingName] = useState('Executive Product Sync');
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [previewId, setPreviewId] = useState(generateDisplayId);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateMeeting(
      meetingName,
      usePassword && password.trim() ? password.trim() : undefined,
      previewId
    );
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeRoomId(joinCodeInput);
    if (normalized) {
      onJoinMeeting(normalized);
    }
  };

  const copyInstantLink = () => {
    const url = `${window.location.origin}/room/${previewId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className={`min-h-screen ${theme.bgApp} ${theme.textPrimary} flex flex-col justify-between transition-colors duration-200`}>
      {/* Top Bar */}
      <header className={`flex items-center justify-between px-6 py-4 border-b ${theme.border} ${theme.isLight ? 'bg-white/80' : 'bg-slate-950/40'} backdrop-blur-md sticky top-0 z-30`}>
        <a href="/" className="text-lg font-bold tracking-tight flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-slate-900 shadow-md shadow-amber-500/25 font-bold">
            <Video className="w-4 h-4 text-white fill-current" />
          </div>
          <span className={`font-bold tracking-tight ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>MeetFlow</span>
        </a>

        <nav className={`hidden md:flex items-center gap-6 text-xs font-medium ${theme.textMuted}`}>
          <a href="#create" className={`${theme.isLight ? 'hover:text-slate-900' : 'hover:text-slate-100'} transition-colors`}>Create Room</a>
          <a href="#join" className={`${theme.isLight ? 'hover:text-slate-900' : 'hover:text-slate-100'} transition-colors`}>Join Call</a>
          <a href="#install" className={`${theme.isLight ? 'hover:text-slate-900' : 'hover:text-slate-100'} transition-colors`}>Windows & Mobile App</a>
          <a href="#features" className={`${theme.isLight ? 'hover:text-slate-900' : 'hover:text-slate-100'} transition-colors`}>Features</a>
        </nav>

        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Button */}
          {onOpenThemeSwitcher && (
            <button
              onClick={onOpenThemeSwitcher}
              title="Change Theme & Appearance"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                theme.isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70'
              } text-xs font-medium transition-all cursor-pointer`}
            >
              <Palette className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span className="hidden sm:inline">Theme</span>
            </button>
          )}

          {/* Owner Login / Owner Dashboard access */}
          {ownerAuth?.isLoggedIn ? (
            <button
              onClick={onOpenOwnerDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
              title="Open Owner Dashboard (Mirza Adeel)"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Mirza Adeel (Owner)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          ) : (
            <button
              onClick={onOpenOwnerLogin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                theme.isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80'
              } text-xs font-semibold transition-all cursor-pointer`}
              title="Exclusive Login for Platform Owner (Mirza Adeel)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Owner Login</span>
            </button>
          )}

          {/* In-app Install Trigger button */}
          <PWAInstallButton variant="nav" />

          <button
            onClick={() => {
              const el = document.getElementById('create');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm ${theme.accentBg}`}
          >
            Start Meeting
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16 max-w-6xl mx-auto w-full">
        {/* Brand Hero Copy */}
        <div className="text-center max-w-3xl mb-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
            theme.isLight
              ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : 'bg-indigo-950/70 border border-indigo-700/50 text-indigo-300'
          } text-xs font-medium mb-3`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Windows Desktop App & Mobile PWA Ready · Owned by Mirza Adeel</span>
          </div>
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight ${theme.isLight ? 'text-slate-900' : 'text-white'} text-balance leading-tight`}>
            High-fidelity video meetings built for real-time teams.
          </h1>
          <p className={`mt-4 text-sm sm:text-base ${theme.textMuted} max-w-2xl mx-auto leading-relaxed text-balance`}>
            Peer-to-peer WebRTC video, crystal audio with active speaker detection, HD screen sharing, real-time chat, and frictionless room joining on Web, Windows PC, and Mobile.
          </p>

          {/* Quick Hero Install CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 hover:from-yellow-300 hover:to-amber-300 text-slate-900 font-semibold text-xs sm:text-sm shadow-xl shadow-amber-500/25 border border-amber-400/50 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install Windows & Mobile App</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('create');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${
                theme.isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
              } font-semibold text-xs sm:text-sm transition-colors cursor-pointer`}
            >
              <Video className={`w-4 h-4 ${theme.accentText}`} />
              <span>Start Instant Meeting</span>
            </button>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Create Meeting */}
          <div id="create" className={`flex flex-col justify-between ${
            theme.isLight
              ? 'bg-white border-slate-200 shadow-lg'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          } border rounded-2xl p-6 sm:p-7 backdrop-blur-sm transition-colors`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${
                    theme.isLight
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  } flex items-center justify-center`}>
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-semibold ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>Create a Meeting</h2>
                    <p className={`text-xs ${theme.textMuted}`}>Generate a new meeting room instantly</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <label className={`block text-xs font-medium ${theme.isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                    Meeting Name
                  </label>
                  <input
                    type="text"
                    required
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                    placeholder="e.g. Design Architecture Review"
                    className={`w-full ${
                      theme.isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                        : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                    } border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors`}
                  />
                </div>

                {/* Password Protection Option */}
                <div className="pt-1">
                  <label className={`flex items-center gap-2 cursor-pointer text-xs ${theme.isLight ? 'text-slate-700' : 'text-slate-300'} select-none`}>
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                      className={`rounded ${
                        theme.isLight ? 'border-slate-300 bg-white text-amber-600' : 'border-slate-700 bg-slate-950 text-indigo-600'
                      } focus:ring-0 focus:ring-offset-0`}
                    />
                    <span>Require a meeting password</span>
                  </label>

                  {usePassword && (
                    <div className="mt-2 animate-in fade-in duration-150">
                      <div className="relative">
                        <Lock className={`w-3.5 h-3.5 ${theme.isLight ? 'text-slate-400' : 'text-slate-500'} absolute left-3 top-3`} />
                        <input
                          type="password"
                          required={usePassword}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create meeting passcode"
                          className={`w-full ${
                            theme.isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                              : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                          } border rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none transition-colors`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pre-generated Meeting ID & Share link preview */}
                <div className="pt-2">
                  <div className={`${
                    theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
                  } border rounded-xl p-3 flex items-center justify-between`}>
                    <div className="min-w-0 pr-2">
                      <span className={`text-[11px] ${theme.textMuted} block`}>Assigned Room ID</span>
                      <span className={`text-xs font-mono font-medium ${theme.isLight ? 'text-amber-700' : 'text-indigo-300'}`}>{previewId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyInstantLink}
                      className={`flex items-center gap-1 text-xs ${
                        theme.isLight
                          ? 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200'
                          : 'text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border-slate-700'
                      } border px-2.5 py-1 rounded-lg transition-colors shrink-0`}
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer ${theme.accentBg}`}
                >
                  <Video className="w-4 h-4" />
                  <span>Start Meeting Now</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Join Meeting */}
          <div id="join" className={`flex flex-col justify-between ${
            theme.isLight
              ? 'bg-white border-slate-200 shadow-lg'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          } border rounded-2xl p-6 sm:p-7 backdrop-blur-sm transition-colors`}>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-9 h-9 rounded-xl ${
                  theme.isLight
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                } flex items-center justify-center`}>
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-base font-semibold ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>Join a Meeting</h2>
                  <p className={`text-xs ${theme.textMuted}`}>Enter a meeting code or invitation link</p>
                </div>
              </div>

              <form onSubmit={handleJoin} className="space-y-4 mt-2">
                <div>
                  <label className={`block text-xs font-medium ${theme.isLight ? 'text-slate-700' : 'text-slate-300'} mb-1`}>
                    Meeting Code or Link
                  </label>
                  <input
                    type="text"
                    required
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="e.g. ABC-123-XYZ or meetflow.app/room/..."
                    className={`w-full ${
                      theme.isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
                        : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                    } border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none transition-colors`}
                  />
                  <p className={`text-[11px] ${theme.isLight ? 'text-slate-500' : 'text-slate-500'} mt-1.5`}>
                    Format: 9 characters formatted as <span className="font-mono font-medium">ABC-123-XYZ</span>
                  </p>
                </div>

                <div className={`${
                  theme.isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
                } border rounded-xl p-3.5 text-xs space-y-1.5`}>
                  <div className={`flex items-center gap-2 ${theme.isLight ? 'text-slate-800 font-semibold' : 'text-slate-300 font-medium'}`}>
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Lobby Green Room</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${theme.textMuted}`}>
                    You'll be able to test your camera, adjust your microphone, and set your display name before entering.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className={`w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${
                    theme.isLight
                      ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
                  } disabled:opacity-50 font-medium text-xs sm:text-sm transition-all active:scale-[0.99]`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Join Meeting</span>
                </button>
              </form>
            </div>

            <div className={`mt-6 pt-4 border-t ${theme.border} flex items-center justify-between text-xs ${theme.textMuted}`}>
              <span>No account or download required</span>
              <span>WebRTC Direct Mesh</span>
            </div>
          </div>
        </div>

        {/* Windows Desktop & Mobile App Install Showcase Banner */}
        <div id="install" className="w-full mt-10 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/40 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Download className="w-3.5 h-3.5" />
                <span>PWA Standalone App for Windows & Mobile</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Install MeetFlow on Windows PC, Android & iPhone
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Run MeetFlow in a dedicated desktop window without browser tabs. Pin it to your Windows Taskbar or smartphone Home Screen with instant 1-tap launching.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => setShowInstallModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-transform active:scale-95"
              >
                <Monitor className="w-4 h-4" />
                <span>Install Windows App</span>
              </button>

              <button
                onClick={() => setShowInstallModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-transform active:scale-95"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Mobile App Options</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div id="features" className={`w-full mt-12 pt-12 border-t ${theme.border} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`}>
          <div className={`flex flex-col p-4 rounded-xl ${theme.isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'} border`}>
            <div className={`w-8 h-8 rounded-lg ${theme.isLight ? 'bg-amber-50 text-amber-600' : 'bg-indigo-900/50 text-indigo-400'} flex items-center justify-center mb-3`}>
              <Video className="w-4 h-4" />
            </div>
            <h3 className={`text-xs font-semibold ${theme.isLight ? 'text-slate-800' : 'text-slate-200'}`}>Real-time WebRTC</h3>
            <p className={`text-[11px] ${theme.textMuted} mt-1 leading-relaxed`}>
              Low-latency video and audio transmission with automatic fallback streams.
            </p>
          </div>

          <div className={`flex flex-col p-4 rounded-xl ${theme.isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'} border`}>
            <div className={`w-8 h-8 rounded-lg ${theme.isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/50 text-emerald-400'} flex items-center justify-center mb-3`}>
              <Mic className="w-4 h-4" />
            </div>
            <h3 className={`text-xs font-semibold ${theme.isLight ? 'text-slate-800' : 'text-slate-200'}`}>Active Speaker Detection</h3>
            <p className={`text-[11px] ${theme.textMuted} mt-1 leading-relaxed`}>
              Real-time Web Audio API frequency analysis automatically spotlights current speakers.
            </p>
          </div>

          <div className={`flex flex-col p-4 rounded-xl ${theme.isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'} border`}>
            <div className={`w-8 h-8 rounded-lg ${theme.isLight ? 'bg-amber-50 text-amber-600' : 'bg-indigo-900/50 text-indigo-400'} flex items-center justify-center mb-3`}>
              <Monitor className="w-4 h-4" />
            </div>
            <h3 className={`text-xs font-semibold ${theme.isLight ? 'text-slate-800' : 'text-slate-200'}`}>HD Screen Sharing</h3>
            <p className={`text-[11px] ${theme.textMuted} mt-1 leading-relaxed`}>
              Share your entire screen, application windows, or browser tabs with 1-click presenter controls.
            </p>
          </div>

          <div className={`flex flex-col p-4 rounded-xl ${theme.isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'} border`}>
            <div className={`w-8 h-8 rounded-lg ${theme.isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/50 text-amber-400'} flex items-center justify-center mb-3`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className={`text-xs font-semibold ${theme.isLight ? 'text-slate-800' : 'text-slate-200'}`}>Live Chat & Reactions</h3>
            <p className={`text-[11px] ${theme.textMuted} mt-1 leading-relaxed`}>
              Send in-call text messages, hand raises, and floating animated emoji reactions.
            </p>
          </div>
        </div>
      </main>

      {/* Website Bottom Footer with Mirza Adeel Owner Attribution */}
      <footer className={`px-6 py-8 border-t ${theme.border} ${theme.isLight ? 'bg-white text-slate-700' : 'bg-slate-950 text-slate-400'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
            <div className={`flex items-center gap-2 font-bold ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>MeetFlow</span>
            </div>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className={`italic ${theme.textMuted}`}>“Meet. Talk. Share. Connect.”</span>
          </div>

          {/* Prominent Owner Name Badge as requested */}
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl ${
            theme.isLight
              ? 'bg-slate-50 border-slate-200 shadow-sm'
              : 'bg-slate-900/90 border-slate-800 shadow-md'
          } border`}>
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`${theme.textMuted} font-medium`}>Platform Owner:</span>
              <span className={`text-sm font-bold tracking-wide ${
                theme.isLight
                  ? 'text-slate-900 font-extrabold'
                  : 'bg-gradient-to-r from-indigo-300 via-white to-indigo-200 bg-clip-text text-transparent'
              }`}>
                Mirza Adeel
              </span>
            </div>
          </div>
        </div>

        {/* Sub-footer Copyright */}
        <div className={`max-w-6xl mx-auto mt-4 pt-4 border-t ${theme.border} flex flex-col sm:flex-row items-center justify-between text-[11px] ${theme.textMuted} gap-2`}>
          <p>© 2026 MeetFlow Platform. Owned and Created by <strong className={`${theme.isLight ? 'text-slate-800' : 'text-slate-400'} font-medium`}>Mirza Adeel</strong>. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowInstallModal(true)} className={`${theme.isLight ? 'hover:text-slate-900' : 'hover:text-slate-300'} transition-colors cursor-pointer`}>
              Install Windows App
            </button>
            <button onClick={() => setShowInstallModal(true)} className={`${theme.isLight ? 'hover:text-slate-900' : 'hover:text-slate-300'} transition-colors cursor-pointer`}>
              Install Mobile App
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Quick Install Button for Windows & Mobile */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowInstallModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs sm:text-sm rounded-full shadow-2xl shadow-indigo-600/50 border border-indigo-400/40 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-indigo-400/20"
          title="Install MeetFlow App on Windows or Mobile"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>Install App (Windows / Mobile)</span>
        </button>
      </div>

      {/* Global Install Modal */}
      <InstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </div>
  );
};

