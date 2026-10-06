import React, { useState } from 'react';
import { Download, Monitor, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallModal } from './InstallModal';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'secondary' | 'nav';
  showLabel?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'secondary',
  showLabel = true,
}) => {
  const { isInstallable, isWindows, isAndroid, isIOS, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Try browser prompt if ready, otherwise open direct install guide & launcher modal
    if (isInstallable) {
      install().then((accepted) => {
        if (!accepted) {
          setModalOpen(true);
        }
      });
    } else {
      setModalOpen(true);
    }
  };

  const label = isWindows
    ? 'Install Windows App'
    : isAndroid || isIOS
    ? 'Install Mobile App'
    : 'Install App';

  return (
    <>
      <button
        onClick={handleClick}
        title="Install MeetFlow on Windows PC, Android, or iPhone"
        className={`flex items-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer ${
          variant === 'primary'
            ? 'px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/40 ring-1 ring-white/10'
            : variant === 'nav'
            ? 'px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 hover:text-white text-xs font-semibold rounded-lg border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
            : 'px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-medium rounded-xl border border-slate-700 shadow-sm'
        }`}
      >
        {/* App Logo */}
        <img
          src="/icon.svg"
          alt="MeetFlow Logo"
          className="w-4 h-4 rounded-md shadow shrink-0 object-contain"
        />

        {showLabel && <span>{label}</span>}
      </button>

      <InstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

