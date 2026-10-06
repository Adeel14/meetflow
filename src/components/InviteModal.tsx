import React, { useState } from 'react';
import { X, Copy, Check, Share2, Shield, Link2 } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  password?: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
  password,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!isOpen) return null;

  const meetingUrl = `${window.location.origin}/room/${roomId}`;

  const fullInvitation = `Join MeetFlow Meeting: ${roomName}
Meeting ID: ${roomId}
${password ? `Password: ${password}\n` : ''}Meeting Link: ${meetingUrl}

Meet. Talk. Share. Connect.`;

  const copyToClipboard = (text: string, type: 'link' | 'id' | 'full') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else if (type === 'full') {
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 2000);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Meeting Invitation</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{roomName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="mt-4 space-y-4">
          {/* Shareable Link */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Shareable Meeting Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono overflow-hidden">
                <Link2 className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                <span className="truncate">{meetingUrl}</span>
              </div>
              <button
                onClick={() => copyToClipboard(meetingUrl, 'link')}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors shrink-0 shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Meeting ID & Password Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Meeting ID
              </label>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-200">
                <span>{roomId}</span>
                <button
                  onClick={() => copyToClipboard(roomId, 'id')}
                  className="text-slate-400 hover:text-white ml-1"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {password ? (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Password</span>
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200">
                  {password}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Access
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400">
                  Open link
                </div>
              </div>
            )}
          </div>

          {/* Copy Full Invitation Action */}
          <button
            onClick={() => copyToClipboard(fullInvitation, 'full')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedFull ? 'Invitation Copied to Clipboard!' : 'Copy Full Invitation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
