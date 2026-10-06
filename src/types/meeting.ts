export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isLocal: boolean;
  isHost: boolean;
  isOwner?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  stream?: MediaStream | null;
  isSpeaking?: boolean;
  audioLevel?: number; // 0 - 100
}

export interface OwnerAuth {
  isLoggedIn: boolean;
  name: string;
  email: string;
  role: string;
  token?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderPeerId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isHost?: boolean;
  directTo?: string; // target peer ID if private
}

export interface ReactionItem {
  id: string;
  emoji: string;
  senderName: string;
  senderPeerId: string;
  xOffset?: number; // visual float jitter
}

export interface MeetingInfo {
  id: string;
  name: string;
  hostId: string;
  hasPassword?: boolean;
  password?: string;
  createdAt?: number;
}

export type MeetingViewMode = 'grid' | 'speaker';

export interface DeviceSettings {
  audioInputId: string;
  videoInputId: string;
  audioOutputId: string;
  noiseSuppression: boolean;
  mirrorLocalVideo: boolean;
  virtualBackground: 'none' | 'blur' | 'office';
}
