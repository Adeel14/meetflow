import React, { useEffect, useRef } from 'react';
import { Maximize2, MonitorOff, User, Volume2, VolumeX } from 'lucide-react';
import { Participant } from '../types/meeting';

interface ScreenShareStageProps {
  screenStream: MediaStream | null;
  presenter: Participant;
  isLocalPresenting: boolean;
  onStopScreenShare: () => void;
}

export const ScreenShareStage: React.FC<ScreenShareStageProps> = ({
  screenStream,
  presenter,
  isLocalPresenting,
  onStopScreenShare,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex flex-col items-center justify-center bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl h-full w-full min-h-[300px]"
    >
      {/* Top Banner Notice */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-lg text-xs pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="font-medium text-slate-200">
            {isLocalPresenting ? 'You are sharing your screen' : `${presenter.name} is sharing screen`}
          </span>
          {isLocalPresenting && (
            <button
              onClick={onStopScreenShare}
              className="ml-2 flex items-center gap-1 bg-red-600/90 hover:bg-red-500 text-white px-2 py-0.5 rounded font-medium transition-colors"
            >
              <MonitorOff className="w-3.5 h-3.5" />
              <span>Stop Sharing</span>
            </button>
          )}
        </div>

        <button
          onClick={toggleFullscreen}
          title="Fullscreen"
          className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md transition-colors pointer-events-auto shadow-md"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Video Element */}
      {screenStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocalPresenting}
          className="h-full w-full object-contain bg-black"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-500 text-sm">
          <span>Loading screen stream...</span>
        </div>
      )}
    </div>
  );
};
