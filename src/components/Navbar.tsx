import React, { useState, useEffect } from 'react';
import { LayoutGrid, User, Copy, Check, ShieldCheck, Share2, Settings, Crown, Palette } from 'lucide-react';
import { MeetingViewMode } from '../types/meeting';
import { PWAInstallButton } from './PWAInstallButton';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  roomName: string;
  roomId: string;
  hasPassword?: boolean;
  viewMode: MeetingViewMode;
  onToggleViewMode: (mode: MeetingViewMode) => void;
  onOpenInvite: () => void;
  onOpenSettings: () => void;
  participantCount: number;
  isOwner?: boolean;
  onOpenOwnerDashboard?: () => void;
  onOpenThemeSwitcher?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomName,
  roomId,
  hasPassword,
  viewMode,
  onToggleViewMode,
  onOpenInvite,
  onOpenSettings,
  participantCount,
  isOwner,
  onOpenOwnerDashboard,
  onOpenThemeSwitcher,
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className={`flex items-center justify-between px-4 py-2.5 ${theme.isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-950 border-slate-800/80'} border-b z-20 shrink-0 transition-colors`}>
      {/* Zone 1: Single text element Brand mark */}
      <div className="flex items-center gap-2">
        <a href="/" className={`text-base sm:text-lg font-bold tracking-tight ${theme.isLight ? 'text-slate-900 hover:text-amber-600' : 'text-white hover:text-indigo-400'} flex items-center gap-1.5 transition-colors`}>
          <img src="/icon.svg" alt="" className="w-6 h-6 rounded-md" />
          <span>MeetFlow</span>
        </a>
      </div>

      {/* Zone 2: Contextual Room Metadata & Time */}
      <div className="flex items-center gap-2 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-medium max-w-[160px] md:max-w-xs truncate">
          <span className="truncate">{roomName}</span>
          {hasPassword && (
            <span title="Password Protected">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </span>
          )}
        </div>

        <span className="hidden sm:inline text-slate-600">·</span>

        <button
          onClick={copyRoomCode}
          title="Click to copy meeting ID"
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors font-mono text-[11px] tabular-nums"
        >
          <span>{roomId}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
        </button>

        <span className="text-slate-600">·</span>

        <span className="font-mono text-slate-400 tabular-nums text-[11px]">
          {formatTimer(elapsedSeconds)}
        </span>
      </div>

      {/* Zone 3: Primary Actions (View Mode Switcher & Invite) */}
      <div className="flex items-center gap-2">
        {/* Owner Dashboard quick access button if logged in */}
        {isOwner && onOpenOwnerDashboard && (
          <button
            onClick={onOpenOwnerDashboard}
            title="Open Owner Control Center (Mirza Adeel)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Owner Center</span>
          </button>
        )}

        {/* Quick App Install button */}
        <PWAInstallButton variant="nav" />

        {/* Grid vs Speaker View Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => onToggleViewMode('grid')}
            title="Grid view"
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Grid</span>
          </button>
          <button
            onClick={() => onToggleViewMode('speaker')}
            title="Speaker spotlight view"
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              viewMode === 'speaker'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Speaker</span>
          </button>
        </div>

        {/* Share Invite Button */}
        <button
          onClick={onOpenInvite}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm text-slate-950 ${theme.accentBg}`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Invite</span>
        </button>

        {/* Theme Appearance Switcher */}
        {onOpenThemeSwitcher && (
          <button
            onClick={onOpenThemeSwitcher}
            title="Appearance & Theme Presets"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Palette className={`w-4 h-4 ${theme.accentText}`} />
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Meeting Settings"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
