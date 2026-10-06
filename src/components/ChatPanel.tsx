import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Shield, Lock, ArrowDown } from 'lucide-react';
import { ChatMessage, Participant } from '../types/meeting';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  participants: Participant[];
  currentUserId: string;
  onSendMessage: (text: string, directTo?: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  participants,
  currentUserId,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [directTo, setDirectTo] = useState<string>('everyone');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 60;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    onSendMessage(trimmed, directTo === 'everyone' ? undefined : directTo);
    setInputText('');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full sm:w-80 md:w-96 bg-slate-900 border-l border-slate-800 z-30 shrink-0 select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">In-Call Messages</h3>
          <p className="text-[11px] text-slate-400">Messages are visible to participants</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recipient Selector (Everyone / Private) */}
      <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Send to:</span>
        <select
          value={directTo}
          onChange={(e) => setDirectTo(e.target.value)}
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="everyone">Everyone</option>
          {participants
            .filter((p) => p.id !== currentUserId)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Direct)
              </option>
            ))}
        </select>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mb-2">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 font-medium">No messages yet</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Start the discussion by typing a message below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isLocal = msg.senderPeerId === currentUserId;
            const isSystem = msg.senderPeerId === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[11px] text-slate-400/90 bg-slate-950/60 px-2 py-0.5 rounded-full border border-slate-800/50">
                    {msg.text} · {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isLocal ? 'items-end' : 'items-start'}`}
              >
                {/* Sender & Timestamp Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-xs font-medium text-slate-300">
                    {isLocal ? 'You' : msg.senderName}
                  </span>
                  {msg.isHost && (
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-1 rounded">
                      Host
                    </span>
                  )}
                  {msg.directTo && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800 px-1 rounded">
                      Direct
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words leading-relaxed ${
                    isLocal
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                      : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60 shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {/* Scroll to bottom button */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-indigo-600/90 text-white px-2.5 py-1 rounded-full text-xs shadow-lg backdrop-blur-md transition-all hover:bg-indigo-500"
          >
            <ArrowDown className="w-3 h-3" />
            <span>New messages</span>
          </button>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950/60 border-t border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              directTo === 'everyone'
                ? 'Send a message to everyone...'
                : `Send private message...`
            }
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
