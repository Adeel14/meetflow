import React, { useState } from 'react';
import { X, Mic, Video, Keyboard, Volume2, ShieldCheck, Check, Palette } from 'lucide-react';
import { DeviceItem } from '../hooks/useMediaDevices';
import { DeviceSettings } from '../types/meeting';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioDevices: DeviceItem[];
  videoDevices: DeviceItem[];
  audioOutputDevices: DeviceItem[];
  selectedAudioId: string;
  selectedVideoId: string;
  selectedOutputId: string;
  onSelectAudioDevice: (id: string) => void;
  onSelectVideoDevice: (id: string) => void;
  onSelectOutputDevice: (id: string) => void;
  mirrorLocalVideo: boolean;
  onToggleMirror: () => void;
  noiseSuppression: boolean;
  onToggleNoiseSuppression: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  audioDevices,
  videoDevices,
  audioOutputDevices,
  selectedAudioId,
  selectedVideoId,
  selectedOutputId,
  onSelectAudioDevice,
  onSelectVideoDevice,
  onSelectOutputDevice,
  mirrorLocalVideo,
  onToggleMirror,
  noiseSuppression,
  onToggleNoiseSuppression,
}) => {
  const { currentTheme, setTheme, availableThemes, theme } = useTheme();
  const [tab, setTab] = useState<'audio' | 'video' | 'theme' | 'shortcuts'>('audio');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100">Meeting Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setTab('audio')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              tab === 'audio'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>

          <button
            onClick={() => setTab('video')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              tab === 'video'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>

          <button
            onClick={() => setTab('theme')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              tab === 'theme'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Colors</span>
          </button>

          <button
            onClick={() => setTab('shortcuts')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              tab === 'shortcuts'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tab === 'audio' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Microphone Device
                </label>
                <select
                  value={selectedAudioId}
                  onChange={(e) => onSelectAudioDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Speaker Output
                </label>
                <select
                  value={selectedOutputId}
                  onChange={(e) => onSelectOutputDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
                >
                  {audioOutputDevices.length > 0 ? (
                    audioOutputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </option>
                    ))
                  ) : (
                    <option value="">Default Speaker / Headphones</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <h4 className="text-xs font-medium text-slate-200">Noise Suppression</h4>
                  <p className="text-[11px] text-slate-400">Reduce background hum and typing sounds</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleNoiseSuppression}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    noiseSuppression ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      noiseSuppression ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {tab === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Camera Device
                </label>
                <select
                  value={selectedVideoId}
                  onChange={(e) => onSelectVideoDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
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

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <h4 className="text-xs font-medium text-slate-200">Mirror My Video</h4>
                  <p className="text-[11px] text-slate-400">Flip your local camera feed horizontally</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleMirror}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    mirrorLocalVideo ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      mirrorLocalVideo ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {tab === 'theme' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-300 block mb-1">
                  Visual Theme & Color Accent
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  Choose a high-contrast visual theme tailored for day or night meetings.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {availableThemes.map((item) => {
                    const isSelected = currentTheme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTheme(item.id)}
                        className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-slate-800/80 shadow-md ring-1 ring-cyan-400/40'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: item.previewHex }}
                            />
                            <span className="text-xs font-semibold text-white truncate">
                              {item.name}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {item.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'shortcuts' && (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">Mute / Unmute Microphone</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">
                  M
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">Turn Camera On / Off</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">
                  V
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">Toggle Screen Sharing</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">Raise / Lower Hand</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">
                  H
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300">Open In-Call Chat</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">
                  C
                </kbd>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            MeetFlow · Owned by <strong className="text-slate-200">Mirza Adeel</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
