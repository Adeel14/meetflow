import React, { useState } from 'react';
import {
  X,
  Download,
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Share,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isWindows,
    isAndroid,
    isInIframe,
    platform,
    install,
    downloadWindowsLauncher,
  } = usePWAInstall();

  // Default active tab to current user's detected platform
  const [activeTab, setActiveTab] = useState<'windows' | 'mobile' | 'ios'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'mobile';
    return 'windows';
  });

  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-text">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header with App Branding & Owner Badge */}
        <div className="relative px-6 pt-5 pb-4 bg-gradient-to-b from-indigo-950/70 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/icon.svg"
                alt="MeetFlow Icon"
                className="w-12 h-12 rounded-2xl shadow-lg ring-1 ring-indigo-500/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Install MeetFlow App</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Windows & Mobile
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live Meeting Platform · Created & Owned by <strong className="text-indigo-300 font-semibold">Mirza Adeel</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex gap-2 mt-4 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('windows')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'windows'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Windows App</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ios'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone / iOS</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {installSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <h4 className="text-base font-semibold text-white">MeetFlow Successfully Installed!</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                You can now launch MeetFlow directly from your Desktop, Taskbar, or Applications menu.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: WINDOWS PC */}
              {activeTab === 'windows' && (
                <div className="space-y-4">
                  {/* Action 1: Direct Browser Install button if prompt ready */}
                  {isInstallable && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99]"
                    >
                      <Download className="w-4 h-4" />
                      <span>One-Click Browser Install</span>
                    </button>
                  )}

                  {/* Action 2: Download Windows Desktop Launcher (.cmd) */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-indigo-300 font-semibold text-xs">
                        <img src="/icon.svg" alt="MeetFlow" className="w-5 h-5 rounded-md shadow" />
                        <Monitor className="w-4 h-4 text-indigo-400" />
                        <span>Windows 10 / 11 1-Click Desktop Launcher</span>
                      </div>
                      <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                        Direct .cmd
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Download and double-click to launch MeetFlow in a dedicated native window without browser address bars:
                    </p>
                    <button
                      onClick={downloadWindowsLauncher}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <img src="/icon.svg" alt="MeetFlow" className="w-4 h-4 rounded" />
                      <Download className="w-3.5 h-3.5" />
                      <span>Download MeetFlow Windows App (.cmd)</span>
                    </button>
                  </div>

                  {/* Action 3: Open in Dedicated Tab (if preview iframe) */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-200 font-semibold">
                      <div className="flex items-center gap-2">
                        <img src="/icon.svg" alt="MeetFlow" className="w-4 h-4 rounded" />
                        <span>Open in Dedicated Full Browser Tab</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      To install directly through the browser <strong className="text-white">App Install Icon (🖥️)</strong> in Chrome or Edge, open MeetFlow in a full browser tab:
                    </p>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open MeetFlow in Dedicated Browser Tab</span>
                    </a>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">How to install via Chrome or Edge on Windows:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-400">
                      <li>Click the <strong className="text-slate-200">Desktop with Down Arrow icon</strong> in your browser address bar.</li>
                      <li>Or click browser menu <strong className="text-slate-200">(⋮ or ...)</strong> &gt; <strong className="text-indigo-300">"Install MeetFlow"</strong>.</li>
                      <li>Click <strong>Install</strong> to add it to your Windows Desktop, Start Menu, & Taskbar.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 2: ANDROID MOBILE */}
              {activeTab === 'mobile' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <img src="/icon.svg" alt="MeetFlow" className="w-4 h-4 rounded" />
                      <Smartphone className="w-4 h-4" />
                      <span>Android Mobile App (PWA)</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Install MeetFlow directly to your Android device home screen with offline caching and camera support:
                    </p>

                    {isInstallable && (
                      <button
                        onClick={handleInstallClick}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <img src="/icon.svg" alt="MeetFlow" className="w-4 h-4 rounded" />
                        <Download className="w-4 h-4" />
                        <span>Install on Android Phone</span>
                      </button>
                    )}

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px] text-slate-300">
                      <p className="font-semibold text-emerald-300">Android Chrome Installation Steps:</p>
                      <p>1. Tap the three dots menu <strong className="text-white">(⋮)</strong> in Chrome at top-right.</p>
                      <p>2. Select <strong className="text-emerald-300">"Install app"</strong> or <strong className="text-emerald-300">"Add to Home screen"</strong>.</p>
                      <p>3. Confirm <strong>Install</strong> to add MeetFlow icon directly to your phone screen.</p>
                    </div>

                    <a
                      href={typeof window !== 'undefined' ? window.location.origin : '/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Direct in Mobile Chrome</span>
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 3: IPHONE / IOS */}
              {activeTab === 'ios' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                      <img src="/icon.svg" alt="MeetFlow" className="w-4 h-4 rounded" />
                      <Apple className="w-4 h-4" />
                      <span>iPhone & iPad Home Screen App</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Install MeetFlow on your iPhone or iPad directly using Safari without the App Store:
                    </p>
                    <div className="space-y-2.5 pt-1 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-[11px] font-bold shrink-0">
                          1
                        </span>
                        <span className="text-slate-300">
                          In Safari, tap the <strong className="text-white">Share button (square with arrow pointing up)</strong> in the bottom bar.
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-[11px] font-bold shrink-0">
                          2
                        </span>
                        <span className="text-slate-300">
                          Scroll down the share sheet and tap <strong className="text-indigo-400">"Add to Home Screen" (➕)</strong>.
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-[11px] font-bold shrink-0">
                          3
                        </span>
                        <span className="text-slate-300">
                          Tap <strong className="text-white">Add</strong> in the top-right corner. The MeetFlow app icon will appear on your Home Screen!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Owner attribution footer badge */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Platform Owner: <strong className="text-slate-200">Mirza Adeel</strong></span>
          </div>
          <span className="font-mono text-indigo-400">MeetFlow PWA</span>
        </div>
      </div>
    </div>
  );
};

