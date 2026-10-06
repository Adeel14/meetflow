import React, { useEffect, useState } from 'react';
import { ReactionItem } from '../types/meeting';

interface ReactionsOverlayProps {
  reactions: ReactionItem[];
}

interface FloatingEmoji extends ReactionItem {
  key: string;
  leftPercent: number;
}

export const ReactionsOverlay: React.FC<ReactionsOverlayProps> = ({ reactions }) => {
  const [floatingList, setFloatingList] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    if (!reactions.length) return;
    const latest = reactions[reactions.length - 1];
    const newEmoji: FloatingEmoji = {
      ...latest,
      key: `${latest.id}-${Date.now()}`,
      leftPercent: 30 + Math.random() * 40,
    };

    setFloatingList((prev) => [...prev.slice(-15), newEmoji]);

    const timer = setTimeout(() => {
      setFloatingList((prev) => prev.filter((item) => item.key !== newEmoji.key));
    }, 2800);

    return () => clearTimeout(timer);
  }, [reactions]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {floatingList.map((item) => (
        <div
          key={item.key}
          className="absolute bottom-24 flex flex-col items-center animate-reaction-float"
          style={{
            left: `${item.leftPercent}%`,
            transform: `translateX(${item.xOffset || 0}px)`,
          }}
        >
          <div className="text-4xl filter drop-shadow-md select-none transform transition-transform hover:scale-125">
            {item.emoji}
          </div>
          <span className="text-[10px] text-slate-300/80 bg-slate-900/60 px-1.5 py-0.5 rounded backdrop-blur-sm mt-1 whitespace-nowrap">
            {item.senderName}
          </span>
        </div>
      ))}
    </div>
  );
};
