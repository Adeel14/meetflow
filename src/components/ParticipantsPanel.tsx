import React, { useState } from 'react';
import {
  X,
  Search,
  Mic,
  MicOff,
  Video,
  VideoOff,
  UserPlus,
  VolumeX,
  Hand,
  MoreVertical,
  Shield,
  UserCheck,
  Bot,
} from 'lucide-react';
import { Participant } from '../types/meeting';

interface ParticipantsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  currentUserId: string;
  isCurrentUserHost: boolean;
  onMuteParticipant: (peerId: string) => void;
  onKickParticipant: (peerId: string) => void;
  onMuteAll: () => void;
  onOpenInvite: () => void;
  onAddDemoParticipant: () => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  isOpen,
  onClose,
  participants,
  currentUserId,
  isCurrentUserHost,
  onMuteParticipant,
  onKickParticipant,
  onMuteAll,
  onOpenInvite,
  onAddDemoParticipant,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort participants: Hand raised first, then host, then others
  const sorted = [...filtered].sort((a, b) => {
    if (a.handRaised && !b.handRaised) return -1;
    if (!a.handRaised && b.handRaised) return 1;
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return a.name.localeCompare(b.name);
  });

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
    <div className="flex flex-col h-full w-full sm:w-80 md:w-96 bg-slate-900 border-l border-slate-800 z-30 shrink-0 select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            People ({participants.length})
          </h3>
          <p className="text-[11px] text-slate-400">Manage meeting participants</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Bar */}
      <div className="p-3 space-y-2 border-b border-slate-800 bg-slate-950/40">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 focus-within:border-indigo-500 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-200">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInvite}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Link</span>
          </button>

          <button
            onClick={onAddDemoParticipant}
            title="Add simulated attendee to test multi-participant views"
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Demo Peer</span>
          </button>

          {isCurrentUserHost && (
            <button
              onClick={onMuteAll}
              title="Mute all participants"
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              <span>Mute All</span>
            </button>
          )}
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {sorted.map((participant) => {
          const isLocal = participant.id === currentUserId;

          return (
            <div
              key={participant.id}
              className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              {/* User info */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="relative">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white shadow-sm ${
                      participant.isSpeaking
                        ? 'bg-emerald-600 ring-2 ring-emerald-400/60'
                        : 'bg-indigo-700'
                    }`}
                  >
                    {getInitials(participant.name)}
                  </div>
                  {participant.isSpeaking && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {participant.name}
                    </span>
                    {isLocal && (
                      <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                        (You)
                      </span>
                    )}
                    {participant.isOwner ? (
                      <span className="text-[10px] text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold shrink-0 flex items-center gap-0.5">
                        👑 Owner
                      </span>
                    ) : participant.isHost ? (
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-1 rounded shrink-0">
                        Host
                      </span>
                    ) : null}
                  </div>

                  {participant.handRaised && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                      <Hand className="w-3 h-3 fill-current" />
                      <span>Hand raised</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Icons & Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Audio Status */}
                <div
                  className={`p-1 rounded-md ${
                    participant.isMuted
                      ? 'text-red-400 bg-red-950/40'
                      : 'text-slate-400'
                  }`}
                >
                  {participant.isMuted ? (
                    <MicOff className="w-3.5 h-3.5" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>

                {/* Video Status */}
                <div
                  className={`p-1 rounded-md ${
                    participant.isVideoOff
                      ? 'text-slate-500 bg-slate-800/40'
                      : 'text-slate-300'
                  }`}
                >
                  {participant.isVideoOff ? (
                    <VideoOff className="w-3.5 h-3.5" />
                  ) : (
                    <Video className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>

                {/* Host Moderation for other participants (Owner cannot be kicked or muted) */}
                {isCurrentUserHost && !isLocal && !participant.isOwner && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!participant.isMuted && (
                      <button
                        onClick={() => onMuteParticipant(participant.id)}
                        title="Mute participant"
                        className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onKickParticipant(participant.id)}
                      title="Remove participant"
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
