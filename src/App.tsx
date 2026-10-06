/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { Navbar } from './components/Navbar';
import { VideoGrid } from './components/VideoGrid';
import { ControlBar } from './components/ControlBar';
import { ChatPanel } from './components/ChatPanel';
import { ParticipantsPanel } from './components/ParticipantsPanel';
import { SettingsModal } from './components/SettingsModal';
import { InviteModal } from './components/InviteModal';
import { ReactionsOverlay } from './components/ReactionsOverlay';
import { OwnerLoginModal } from './components/OwnerLoginModal';
import { OwnerDashboardModal } from './components/OwnerDashboardModal';
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { useMediaDevices } from './hooks/useMediaDevices';
import { WebRTCManager } from './services/webrtc';
import { WebSocketClient } from './services/websocket';
import { createSyntheticStream } from './services/syntheticMedia';
import { normalizeRoomId, generateRoomId } from './utils/roomId';
import { useTheme } from './context/ThemeContext';
import {
  ChatMessage,
  MeetingInfo,
  MeetingViewMode,
  Participant,
  ReactionItem,
  OwnerAuth,
} from './types/meeting';

export default function App() {
  // Navigation / View states: 'home' | 'lobby' | 'meeting'
  const [appState, setAppState] = useState<'home' | 'lobby' | 'meeting'>('home');
  const [currentRoom, setCurrentRoom] = useState<MeetingInfo>({
    id: '',
    name: 'MeetFlow Meeting',
    hostId: '',
  });

  // User Profile
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem('meetflow_name') || 'Guest'
  );
  const [localPeerId] = useState<string>(
    () => `peer-${Math.random().toString(36).slice(2, 9)}`
  );
  const [isHost, setIsHost] = useState<boolean>(false);
  const [handRaised, setHandRaised] = useState<boolean>(false);

  // Platform Owner authentication state (Strictly reserved for Mirza Adeel)
  const [ownerAuth, setOwnerAuth] = useState<OwnerAuth>(() => {
    try {
      const stored = localStorage.getItem('meetflow_owner_session');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { isLoggedIn: false, name: '', email: '', role: '' };
  });
  const [isOwnerLoginOpen, setIsOwnerLoginOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
  const { theme } = useTheme();

  const handleLoginSuccess = (owner: OwnerAuth) => {
    setOwnerAuth(owner);
    setUserName('Mirza Adeel');
    localStorage.setItem('meetflow_name', 'Mirza Adeel');
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem('meetflow_owner_session');
    setOwnerAuth({ isLoggedIn: false, name: '', email: '', role: '' });
    setIsOwnerDashboardOpen(false);
  };

  // Layout & Panel UI states
  const [viewMode, setViewMode] = useState<MeetingViewMode>('grid');
  const [pinnedPeerId, setPinnedPeerId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Settings
  const [mirrorLocalVideo, setMirrorLocalVideo] = useState<boolean>(true);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);

  // Room Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ReactionItem[]>([]);

  // Media Devices hook
  const {
    localStream,
    screenStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    audioDevices,
    videoDevices,
    audioOutputDevices,
    selectedAudioId,
    selectedVideoId,
    selectedOutputId,
    initMedia,
    toggleMute,
    toggleVideo,
    switchAudioDevice,
    switchVideoDevice,
    setSelectedOutputId,
    startScreenShare,
    stopScreenShare,
  } = useMediaDevices(userName);

  // Service References
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const participantsRef = useRef<Participant[]>(participants);
  participantsRef.current = participants;

  // Initialize URL room check on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/room\/([a-zA-Z0-9_-]+)/);
    const searchParams = new URLSearchParams(window.location.search);
    const roomParam = searchParams.get('room');

    const rawId = match ? match[1] : roomParam;
    const targetRoomId = normalizeRoomId(rawId || '');

    if (targetRoomId) {
      setCurrentRoom((prev) => ({
        ...prev,
        id: targetRoomId,
        name: `Meeting ${targetRoomId}`,
      }));
      setAppState('lobby');
      initMedia();
    }
  }, [initMedia]);

  // Update local participant whenever local stream or flags change
  useEffect(() => {
    setParticipants((prev) => {
      const existing = prev.find((p) => p.isLocal);
      const updatedLocal: Participant = {
        id: localPeerId,
        name: ownerAuth.isLoggedIn ? 'Mirza Adeel' : userName,
        avatar: '',
        isLocal: true,
        isHost: isHost || ownerAuth.isLoggedIn,
        isOwner: ownerAuth.isLoggedIn,
        isMuted,
        isVideoOff,
        isScreenSharing,
        handRaised,
        stream: localStream,
      };

      if (!existing) {
        return [updatedLocal, ...prev];
      }
      return prev.map((p) => (p.isLocal ? updatedLocal : p));
    });

    // Notify server of local peer flag changes
    if (wsClientRef.current && appState === 'meeting') {
      wsClientRef.current.updatePeer({
        isMuted,
        isVideoOff,
        isScreenSharing,
        handRaised,
      });
    }
  }, [localPeerId, userName, isHost, isMuted, isVideoOff, isScreenSharing, handRaised, localStream, appState, ownerAuth.isLoggedIn]);

  // Pass local stream to WebRTC
  useEffect(() => {
    if (webrtcRef.current && localStream) {
      webrtcRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  // Home actions: Create Meeting
  const handleCreateMeeting = async (name: string, password?: string, preferredRoomId?: string) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, roomId: preferredRoomId }),
      });
      const data = await res.json();
      const normalizedRoomId = normalizeRoomId(data.roomId);

      setCurrentRoom({
        id: normalizedRoomId,
        name: data.name,
        hostId: localPeerId,
        hasPassword: data.hasPassword,
        password,
      });

      // Update URL without full page reload
      window.history.pushState({}, '', `/room/${normalizedRoomId}`);
      setAppState('lobby');
      await initMedia();
    } catch {
      // Offline / Direct fallback
      const generatedId = preferredRoomId ? normalizeRoomId(preferredRoomId) : generateRoomId();
      setCurrentRoom({
        id: generatedId,
        name: name || `Meeting ${generatedId}`,
        hostId: localPeerId,
        hasPassword: Boolean(password),
        password,
      });
      window.history.pushState({}, '', `/room/${generatedId}`);
      setAppState('lobby');
      await initMedia();
    }
  };

  // Home actions: Join Meeting
  const handleJoinMeeting = async (roomId: string) => {
    const formatted = normalizeRoomId(roomId);
    if (!formatted) return;
    setCurrentRoom((prev) => ({
      ...prev,
      id: formatted,
      name: `Meeting ${formatted}`,
    }));
    window.history.pushState({}, '', `/room/${formatted}`);
    setAppState('lobby');
    await initMedia();
  };

  // Lobby actions: Join Meeting Room
  const handleJoinFromLobby = async (displayName: string, password?: string) => {
    const finalName = ownerAuth.isLoggedIn ? 'Mirza Adeel' : displayName;
    setUserName(finalName);
    setAppState('meeting');

    // Clean up any stale connections before joining fresh
    if (wsClientRef.current) {
      try {
        wsClientRef.current.disconnect();
      } catch {}
      wsClientRef.current = null;
    }
    if (webrtcRef.current) {
      try {
        webrtcRef.current.destroy();
      } catch {}
      webrtcRef.current = null;
    }

    // Ensure we have a valid media stream before calling peers
    let streamToUse = localStream;
    if (!streamToUse) {
      try {
        streamToUse = await initMedia();
      } catch {
        streamToUse = createSyntheticStream(finalName);
      }
    }
    if (!streamToUse) {
      streamToUse = createSyntheticStream(finalName);
    }

    // Determine normalized room ID to join
    const urlMatch = window.location.pathname.match(/\/room\/([a-zA-Z0-9_-]+)/);
    const roomIdToJoin = normalizeRoomId(currentRoom.id || (urlMatch ? urlMatch[1] : ''));

    // Setup WebRTC Manager with Perfect Negotiation using localPeerId
    const webrtc = new WebRTCManager(localPeerId, {
      onSignal: (targetPeerId, signal) => {
        wsClientRef.current?.sendSignal(targetPeerId, signal);
      },
      onRemoteStream: (peerId, remoteStream) => {
        console.log('[MeetFlow] Attaching remote stream for participant:', peerId);
        setParticipants((prev) =>
          prev.map((p) => (p.id === peerId ? { ...p, stream: remoteStream } : p))
        );
      },
      onPeerDisconnected: (peerId) => {
        // Do NOT remove participant from meeting room! Keep participant tile visible
        console.warn('[MeetFlow] Remote stream disconnected for participant:', peerId);
        setParticipants((prev) =>
          prev.map((p) => (p.id === peerId ? { ...p, stream: null } : p))
        );
      },
    });

    webrtc.setLocalStream(streamToUse);
    webrtcRef.current = webrtc;

    // Setup WebSocket Client
    const wsClient = new WebSocketClient({
      onRoomState: (state) => {
        const canonicalRoomId = normalizeRoomId(state.roomId || roomIdToJoin);
        setCurrentRoom((prev) => ({
          ...prev,
          id: canonicalRoomId,
          name: state.roomName || prev.name,
          hostId: state.hostId,
        }));
        const userIsHost = state.hostId === localPeerId || ownerAuth.isLoggedIn;
        setIsHost(userIsHost);

        // Remote peers from server
        const remotePeers: Participant[] = state.peers
          .filter((p) => p.id !== localPeerId)
          .map((p) => ({
            ...p,
            isLocal: false,
            stream: null,
          }));

        // Explicitly set local participant alongside remote peers
        const localParticipant: Participant = {
          id: localPeerId,
          name: finalName,
          avatar: '',
          isLocal: true,
          isHost: userIsHost,
          isOwner: ownerAuth.isLoggedIn,
          isMuted,
          isVideoOff,
          isScreenSharing,
          handRaised,
          stream: streamToUse,
        };

        setParticipants([localParticipant, ...remotePeers]);
        setMessages(state.messages || []);

        // Fail-safe polite fallback: if existing peers do not initiate within 2.5s, initiate call
        if (remotePeers.length > 0) {
          setTimeout(() => {
            remotePeers.forEach((p) => {
              webrtc.callPeer(p.id).catch(() => {});
            });
          }, 2500);
        }
      },

      onPeerJoined: (peer) => {
        console.log('[MeetFlow] New peer joined room:', peer.name, peer.id);
        setParticipants((prev) => {
          if (prev.some((p) => p.id === peer.id)) {
            return prev.map((p) => (p.id === peer.id ? { ...p, ...peer } : p));
          }
          return [
            ...prev,
            {
              ...peer,
              isLocal: false,
              stream: null,
            },
          ];
        });

        // The existing peer in the room immediately initiates the WebRTC offer to the newly joined peer
        webrtc.callPeer(peer.id);
      },

      onPeerLeft: (peerId) => {
        setParticipants((prev) => prev.filter((p) => p.id !== peerId));
        webrtc.removePeer(peerId);
        if (pinnedPeerId === peerId) {
          setPinnedPeerId(null);
        }
      },

      onPeerUpdated: (peerId, updates) => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === peerId ? { ...p, ...updates } : p))
        );
      },

      onSignal: (senderPeerId, signal) => {
        webrtc.handleSignal(senderPeerId, signal);
      },

      onChatMessage: (message) => {
        setMessages((prev) => [...prev, message]);
        if (!isChatOpen) {
          setUnreadMessagesCount((c) => c + 1);
        }
      },

      onReaction: (reaction) => {
        setReactions((prev) => [...prev, reaction]);
      },

      onRemoteMuteRequest: () => {
        if (!isMuted && !ownerAuth.isLoggedIn) {
          toggleMute();
        }
      },

      onKicked: (reason) => {
        alert(reason || 'You were removed from the meeting by the host.');
        handleLeaveMeeting();
      },

      onError: (err) => {
        alert(err.message || 'Error connecting to meeting');
        setAppState('lobby');
      },
    });

    wsClient.connect().then(() => {
      wsClient.joinRoom(
        roomIdToJoin,
        localPeerId,
        {
          name: finalName,
          avatar: '',
          isHost: ownerAuth.isLoggedIn || isHost,
          isOwner: ownerAuth.isLoggedIn,
          isMuted,
          isVideoOff,
          isScreenSharing,
          handRaised,
        },
        password
      );
    });

    wsClientRef.current = wsClient;
  };

  // Leave Meeting
  const handleLeaveMeeting = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.leaveRoom();
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
    }
    if (webrtcRef.current) {
      webrtcRef.current.destroy();
      webrtcRef.current = null;
    }
    if (isScreenSharing) {
      stopScreenShare();
    }

    setParticipants([]);
    setMessages([]);
    setReactions([]);
    setAppState('home');
    window.history.pushState({}, '', '/');
  }, [isScreenSharing, stopScreenShare]);

  // Screen Share Toggle
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      webrtcRef.current?.setScreenStream(null);
    } else {
      const stream = await startScreenShare();
      if (stream) {
        webrtcRef.current?.setScreenStream(stream);
      }
    }
  };

  // Hand Raise Toggle
  const handleToggleHandRaise = () => {
    setHandRaised((prev) => {
      const next = !prev;
      wsClientRef.current?.updatePeer({ handRaised: next });
      return next;
    });
  };

  // Reactions
  const handleSendReaction = (emoji: string) => {
    wsClientRef.current?.sendReaction(emoji);
    // Optimistic local reaction
    setReactions((prev) => [
      ...prev,
      {
        id: `rx-local-${Date.now()}`,
        emoji,
        senderName: userName,
        senderPeerId: localPeerId,
        xOffset: Math.floor(Math.random() * 80) - 40,
      },
    ]);
  };

  // Chat message send
  const handleSendMessage = (text: string, directTo?: string) => {
    wsClientRef.current?.sendChatMessage(text, directTo);
  };

  // Host Controls
  const handleMuteParticipant = (peerId: string) => {
    wsClientRef.current?.requestMute(peerId);
  };

  const handleMuteAll = () => {
    wsClientRef.current?.requestMuteAll();
  };

  const handleKickParticipant = (peerId: string) => {
    wsClientRef.current?.kickPeer(peerId);
  };

  // Demo Participant Simulator for testing multi-user active speaker, chat, and grid
  const handleAddDemoParticipant = () => {
    const demoNames = [
      'Sarah Chen · Product Lead',
      'Marcus Vance · Staff Engineer',
      'Elena Rostova · UX Architect',
      'David Kim · VP Marketing',
    ];
    const available = demoNames.filter(
      (n) => !participants.some((p) => p.name === n)
    );
    const demoName = available[0] || `Guest ${participants.length + 1}`;
    const demoId = `demo-${Date.now()}`;

    const syntheticStream = createSyntheticStream(demoName);

    const demoPeer: Participant = {
      id: demoId,
      name: demoName,
      avatar: '',
      isLocal: false,
      isHost: false,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      handRaised: false,
      stream: syntheticStream,
      isSpeaking: true,
      audioLevel: 45,
    };

    setParticipants((prev) => [...prev, demoPeer]);

    // System announce in chat
    const demoMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId: currentRoom.id,
      senderPeerId: demoId,
      senderName: demoName,
      text: `Hi everyone! Glad to join the sync.`,
      timestamp: Date.now(),
      isHost: false,
    };
    setMessages((prev) => [...prev, demoMsg]);

    // Send demo reaction
    setTimeout(() => {
      setReactions((prev) => [
        ...prev,
        {
          id: `rx-${Date.now()}`,
          emoji: '👏',
          senderName: demoName,
          senderPeerId: demoId,
          xOffset: Math.floor(Math.random() * 80) - 40,
        },
      ]);
    }, 1200);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    if (appState !== 'meeting') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in chat input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'v':
          e.preventDefault();
          toggleVideo();
          break;
        case 's':
          e.preventDefault();
          handleToggleScreenShare();
          break;
        case 'h':
          e.preventDefault();
          handleToggleHandRaise();
          break;
        case 'c':
          e.preventDefault();
          setIsChatOpen((v) => !v);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, toggleMute, toggleVideo]);

  // Determine active screen share stream and presenter
  const activeScreenPresenter = participants.find((p) => p.isScreenSharing) || null;
  const activeScreenStream =
    activeScreenPresenter?.isLocal ? screenStream : activeScreenPresenter?.stream || null;

  return (
    <>
      {/* View: Home */}
      {appState === 'home' && (
        <Home
          onCreateMeeting={handleCreateMeeting}
          onJoinMeeting={handleJoinMeeting}
          ownerAuth={ownerAuth}
          onOpenOwnerLogin={() => setIsOwnerLoginOpen(true)}
          onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
          onOpenThemeSwitcher={() => setIsThemeSwitcherOpen(true)}
        />
      )}

      {/* View: Lobby (Green Room) */}
      {appState === 'lobby' && (
        <Lobby
          roomId={currentRoom.id}
          roomName={currentRoom.name}
          hasPassword={currentRoom.hasPassword}
          localStream={localStream}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          audioDevices={audioDevices}
          videoDevices={videoDevices}
          audioOutputDevices={audioOutputDevices}
          selectedAudioId={selectedAudioId}
          selectedVideoId={selectedVideoId}
          selectedOutputId={selectedOutputId}
          onSelectAudioDevice={switchAudioDevice}
          onSelectVideoDevice={switchVideoDevice}
          onSelectOutputDevice={setSelectedOutputId}
          onJoin={handleJoinFromLobby}
          onBack={() => {
            setAppState('home');
            window.history.pushState({}, '', '/');
          }}
        />
      )}

      {/* View: Live Meeting */}
      {appState === 'meeting' && (
        <div className={`flex flex-col h-screen w-screen ${theme.bgApp} ${theme.textPrimary} overflow-hidden select-none transition-colors duration-200`}>
          {/* Reactions Floating Overlay */}
          <ReactionsOverlay reactions={reactions} />

          {/* Top Navbar */}
          <Navbar
            roomName={currentRoom.name}
            roomId={currentRoom.id}
            hasPassword={currentRoom.hasPassword}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onOpenInvite={() => setIsInviteOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            participantCount={participants.length}
            isOwner={ownerAuth.isLoggedIn}
            onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
            onOpenThemeSwitcher={() => setIsThemeSwitcherOpen(true)}
          />

          {/* Main Video Arena & Side Drawers */}
          <div className="flex flex-1 min-h-0 relative overflow-hidden">
            {/* Video Canvas Grid */}
            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-slate-950">
              <VideoGrid
                participants={participants}
                viewMode={viewMode}
                pinnedPeerId={pinnedPeerId}
                onTogglePin={(id) => setPinnedPeerId((curr) => (curr === id ? null : id))}
                mirrorLocalVideo={mirrorLocalVideo}
                canModerate={isHost || ownerAuth.isLoggedIn}
                onMuteParticipant={handleMuteParticipant}
                onKickParticipant={handleKickParticipant}
                activeScreenPresenter={activeScreenPresenter}
                activeScreenStream={activeScreenStream}
                isLocalPresenting={Boolean(activeScreenPresenter?.isLocal)}
                onStopScreenShare={handleToggleScreenShare}
              />
            </div>

            {/* In-Call Chat Drawer */}
            <ChatPanel
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              messages={messages}
              participants={participants}
              currentUserId={localPeerId}
              onSendMessage={handleSendMessage}
            />

            {/* Participants Management Drawer */}
            <ParticipantsPanel
              isOpen={isParticipantsOpen}
              onClose={() => setIsParticipantsOpen(false)}
              participants={participants}
              currentUserId={localPeerId}
              isCurrentUserHost={isHost || ownerAuth.isLoggedIn}
              onMuteParticipant={handleMuteParticipant}
              onKickParticipant={handleKickParticipant}
              onMuteAll={handleMuteAll}
              onOpenInvite={() => setIsInviteOpen(true)}
              onAddDemoParticipant={handleAddDemoParticipant}
            />
          </div>

          {/* Bottom Meeting Controls Bar */}
          <ControlBar
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            handRaised={handRaised}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleHandRaise={handleToggleHandRaise}
            onSendReaction={handleSendReaction}
            onToggleChat={() => {
              setIsChatOpen((prev) => {
                const next = !prev;
                if (next) setUnreadMessagesCount(0);
                return next;
              });
              if (!isChatOpen && isParticipantsOpen) setIsParticipantsOpen(false);
            }}
            onToggleParticipants={() => {
              setIsParticipantsOpen((prev) => !prev);
              if (!isParticipantsOpen && isChatOpen) setIsChatOpen(false);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLeaveMeeting={handleLeaveMeeting}
            isChatOpen={isChatOpen}
            isParticipantsOpen={isParticipantsOpen}
            unreadCount={unreadMessagesCount}
            participantsCount={participants.length}
            audioDevices={audioDevices}
            videoDevices={videoDevices}
            selectedAudioId={selectedAudioId}
            selectedVideoId={selectedVideoId}
            onSelectAudioDevice={switchAudioDevice}
            onSelectVideoDevice={switchVideoDevice}
          />

          {/* Settings Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            audioDevices={audioDevices}
            videoDevices={videoDevices}
            audioOutputDevices={audioOutputDevices}
            selectedAudioId={selectedAudioId}
            selectedVideoId={selectedVideoId}
            selectedOutputId={selectedOutputId}
            onSelectAudioDevice={switchAudioDevice}
            onSelectVideoDevice={switchVideoDevice}
            onSelectOutputDevice={setSelectedOutputId}
            mirrorLocalVideo={mirrorLocalVideo}
            onToggleMirror={() => setMirrorLocalVideo((v) => !v)}
            noiseSuppression={noiseSuppression}
            onToggleNoiseSuppression={() => setNoiseSuppression((v) => !v)}
          />

          {/* Invite Modal */}
          <InviteModal
            isOpen={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            roomId={currentRoom.id}
            roomName={currentRoom.name}
            password={currentRoom.password}
          />
        </div>
      )}

      {/* Owner Login Modal: Available everywhere */}
      <OwnerLoginModal
        isOpen={isOwnerLoginOpen}
        onClose={() => setIsOwnerLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Owner Dashboard Control Center: Available everywhere */}
      <OwnerDashboardModal
        isOpen={isOwnerDashboardOpen}
        onClose={() => setIsOwnerDashboardOpen(false)}
        owner={ownerAuth}
        onLogout={handleOwnerLogout}
        onJoinRoom={(roomId) => handleJoinMeeting(roomId)}
        onCreateVipRoom={(name, pwd) => handleCreateMeeting(name, pwd)}
      />

      {/* Theme Appearance Switcher Modal: Available everywhere */}
      <ThemeSwitcherModal
        isOpen={isThemeSwitcherOpen}
        onClose={() => setIsThemeSwitcherOpen(false)}
      />
    </>
  );
}
