import React, { useEffect, useState } from 'react';
import {
  Crown,
  ShieldCheck,
  X,
  Radio,
  Users,
  Clock,
  Trash2,
  Send,
  RefreshCw,
  LogOut,
  Sparkles,
  ExternalLink,
  Lock,
  Plus,
  Server,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { OwnerAuth } from '../types/meeting';

interface ActiveRoomData {
  id: string;
  name: string;
  participantCount: number;
  createdAt: number;
  hasPassword: boolean;
  participants?: Array<{ id: string; name: string; isHost: boolean; isOwner?: boolean }>;
}

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: OwnerAuth;
  onLogout: () => void;
  onJoinRoom: (roomId: string) => void;
  onCreateVipRoom: (name: string, password?: string) => void;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({
  isOpen,
  onClose,
  owner,
  onLogout,
  onJoinRoom,
  onCreateVipRoom,
}) => {
  const [activeRooms, setActiveRooms] = useState<ActiveRoomData[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState('');

  // VIP Room state
  const [vipRoomName, setVipRoomName] = useState('Mirza Adeel Executive Boardroom');
  const [vipPassword, setVipPassword] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/owner/dashboard');
      if (res.ok) {
        const data = await res.json();
        setActiveRooms(data.activeRooms || []);
        setTotalRooms(data.totalActiveRooms || 0);
        setTotalParticipants(data.totalParticipants || 0);
        setUptime(data.uptimeSeconds || 0);
      }
    } catch (e) {
      console.error('Failed to load owner dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/owner/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: broadcastText.trim(), token: owner.token }),
      });
      if (res.ok) {
        setBroadcastNotice('Announcement broadcasted to all active rooms successfully!');
        setBroadcastText('');
        setTimeout(() => setBroadcastNotice(''), 4000);
      }
    } catch {
      setBroadcastNotice('Failed to broadcast announcement.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleTerminateRoom = async (roomId: string) => {
    if (!window.confirm(`Are you sure you want to terminate Room ${roomId}? All participants will be disconnected.`)) {
      return;
    }
    try {
      const res = await fetch('/api/owner/terminate-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error('Failed to terminate room:', e);
    }
  };

  const handleCreateVip = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateVipRoom(vipRoomName, vipPassword.trim() ? vipPassword.trim() : undefined);
    onClose();
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-bold">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Owner Control Center</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    Verified Owner
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged in as <strong className="text-white font-medium">Mirza Adeel</strong> ({owner.email})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                title="Refresh Live Data"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onLogout}
                title="Log Out of Owner Session"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Active Rooms</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">{totalRooms}</p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Users</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">{totalParticipants}</p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Server Uptime</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">{formatUptime(uptime)}</p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>WebRTC Status</span>
              </div>
              <p className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                Mesh Active
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Live Active Rooms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Meeting Rooms ({activeRooms.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500">Auto-refreshes every 8 seconds</span>
            </div>

            {activeRooms.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-center">
                <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-300">No Active Meetings In Progress</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When users or guests start meetings, they will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/90 text-indigo-300 border border-indigo-500/30">
                            {room.id}
                          </span>
                          <h5 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{room.name}</h5>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                          <Users className="w-3 h-3 text-indigo-400" />
                          <span>{room.participantCount} peers</span>
                        </div>
                      </div>

                      {/* Participant list preview */}
                      {room.participants && room.participants.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {room.participants.map((p) => (
                            <span
                              key={p.id}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                p.isOwner
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : p.isHost
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-slate-800/80 text-slate-300'
                              }`}
                            >
                              {p.name} {p.isOwner && '👑'} {p.isHost && !p.isOwner && '⭐'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => {
                          onJoinRoom(room.id);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Join as Owner</span>
                      </button>

                      <button
                        onClick={() => handleTerminateRoom(room.id)}
                        title="End room remotely for all users"
                        className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>End</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Global System Broadcast */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Global Owner Announcement</span>
              </div>
              <span className="text-[10px] text-slate-400">Broadcasts instant banner to all active calls</span>
            </div>

            {broadcastNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{broadcastNotice}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="flex gap-2">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="e.g. Platform update: Live recording & AI summaries launching soon..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/70"
              />
              <button
                type="submit"
                disabled={isBroadcasting || !broadcastText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast'}</span>
              </button>
            </form>
          </div>

          {/* Section 3: Create VIP Owner Room */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-bold">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Launch VIP Owner Meeting Room</span>
              </div>
              <span className="text-[10px] text-slate-400">Instant host & super-moderator privileges</span>
            </div>

            <form onSubmit={handleCreateVip} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Meeting Title</label>
                <input
                  type="text"
                  value={vipRoomName}
                  onChange={(e) => setVipRoomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Optional Passcode</label>
                <input
                  type="text"
                  value={vipPassword}
                  onChange={(e) => setVipPassword(e.target.value)}
                  placeholder="Leave empty for open room"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Start VIP Boardroom as Mirza Adeel</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Platform Owner: <strong className="text-white">Mirza Adeel</strong></span>
          </div>
          <span className="text-[11px] font-mono text-amber-400">adeel.techub@gmail.com</span>
        </div>
      </div>
    </div>
  );
};
