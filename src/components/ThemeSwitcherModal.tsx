import React from 'react';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeId } from '../types/theme';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, theme, setTheme, availableThemes } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Appearance & Theme Presets</h3>
              <p className="text-xs text-slate-400">Select your preferred visual atmosphere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme List */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {availableThemes.map((item) => {
            const isSelected = currentTheme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-400 bg-slate-800/90 shadow-lg ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Header Swatch */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: item.previewHex }}
                    />
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {item.subtitle}
                </p>

                {/* Micro Visual Strip */}
                <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                  <div
                    className="h-2 flex-1 rounded-sm"
                    style={{ backgroundColor: item.isLight ? '#f1f5f9' : '#0c1018' }}
                  />
                  <div
                    className="h-2 w-5 rounded-sm"
                    style={{ backgroundColor: item.previewHex }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Theme preference is saved automatically
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-semibold text-xs shadow-md transition-all cursor-pointer ${theme.accentBg}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
