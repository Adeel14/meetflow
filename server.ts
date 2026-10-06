import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Explicit PWA manifest and service worker endpoints
app.get(['/manifest.json', '/manifest.webmanifest'], (_req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  const manifestPath = path.resolve(__dirname, 'public', 'manifest.json');
  res.sendFile(manifestPath);
});

app.get(['/sw.js', '/registerSW.js', '/dev-sw.js'], (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  const fileName = req.path.replace('/', '');
  const distPath = path.resolve(__dirname, 'dist', fileName);
  const publicPath = path.resolve(__dirname, 'public', fileName);
  const swPublicPath = path.resolve(__dirname, 'public', 'sw.js');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    res.sendFile(distPath);
  } else if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else if (fs.existsSync(swPublicPath)) {
    res.sendFile(swPublicPath);
  } else {
    res.status(404).end();
  }
});

interface PeerData {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isOwner?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  ws: WebSocket;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderPeerId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isHost: boolean;
  directTo?: string;
}

interface Room {
  id: string;
  name: string;
  hostId: string;
  password?: string;
  createdAt: number;
  peers: Map<string, PeerData>;
  messages: ChatMessage[];
}

const rooms = new Map<string, Room>();

// Helper to extract canonical alphanumeric room key (e.g. ABC-123-XYZ -> ABC123XYZ)
export function getRoomKey(id: string): string {
  if (!id) return '';
  let clean = String(id).trim();
  if (clean.includes('/room/')) clean = clean.split('/room/')[1].split('?')[0].split('#')[0];
  if (clean.includes('room=')) clean = clean.split('room=')[1].split('&')[0].split('#')[0];
  return clean.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

// Helper to format room display (e.g. ABC123XYZ -> ABC-123-XYZ)
export function formatRoomDisplay(id: string): string {
  const clean = getRoomKey(id);
  if (clean.length === 9) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}`;
  }
  return clean;
}

// Backward compatibility alias
export const normalizeRoomId = formatRoomDisplay;

// Helper to generate IDs like ABC-123-XYZ
export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(3)}-${part(3)}-${part(3)}`;
}

// REST API
app.post('/api/rooms', (req, res) => {
  const { name, password, roomId: requestedRoomId } = req.body;
  const roomKey = getRoomKey(requestedRoomId || generateRoomId());
  const displayId = formatRoomDisplay(roomKey);
  const roomName = (name && String(name).trim()) || `Meeting ${displayId}`;

  const room: Room = {
    id: displayId,
    name: roomName,
    hostId: '',
    password: password ? String(password).trim() : undefined,
    createdAt: Date.now(),
    peers: new Map(),
    messages: [],
  };

  rooms.set(roomKey, room);
  res.json({
    roomId: displayId,
    name: room.name,
    hasPassword: Boolean(room.password),
    createdAt: room.createdAt,
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const roomKey = getRoomKey(req.params.roomId);
  const room = rooms.get(roomKey);

  if (!room) {
    return res.status(404).json({ exists: false, error: 'Meeting room not found' });
  }

  res.json({
    exists: true,
    roomId: room.id,
    name: room.name,
    hasPassword: Boolean(room.password),
    participantCount: room.peers.size,
    createdAt: room.createdAt,
  });
});

// Dedicated Owner Authentication & Management APIs (Restricted to Mirza Adeel)
const OWNER_EMAIL = 'adeel.techub@gmail.com';
const OWNER_PASS = 'mirza204548';
const OWNER_NAME = 'Mirza Adeel';

app.post('/api/owner/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const providedPass = String(password).trim();

  if (normalizedEmail === OWNER_EMAIL && providedPass === OWNER_PASS) {
    const token = `owner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return res.json({
      success: true,
      owner: {
        name: OWNER_NAME,
        email: OWNER_EMAIL,
        role: 'Platform Owner & Creator',
        token,
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Access denied: Invalid credentials. This login portal is strictly reserved for Platform Owner (Mirza Adeel).',
  });
});

app.get('/api/owner/dashboard', (_req, res) => {
  const activeRooms = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
    participantCount: r.peers.size,
    createdAt: r.createdAt,
    hasPassword: Boolean(r.password),
    hostId: r.hostId,
    participants: Array.from(r.peers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isOwner: Boolean(p.isOwner),
    })),
  }));

  res.json({
    activeRooms,
    totalActiveRooms: rooms.size,
    totalParticipants: activeRooms.reduce((acc, curr) => acc + curr.participantCount, 0),
    uptimeSeconds: Math.floor(process.uptime()),
    serverTime: Date.now(),
  });
});

app.post('/api/owner/broadcast', (req, res) => {
  const { text } = req.body;
  const messageText = String(text || '').trim();
  if (!messageText) {
    return res.status(400).json({ error: 'Announcement text is required' });
  }

  const broadcastMsg: ChatMessage = {
    id: `owner-announcement-${Date.now()}`,
    roomId: 'global',
    senderPeerId: 'owner-mirza-adeel',
    senderName: '👑 Mirza Adeel (Platform Owner)',
    text: `[OFFICIAL ANNOUNCEMENT]: ${messageText}`,
    timestamp: Date.now(),
    isHost: true,
  };

  let totalBroadcastedPeers = 0;
  rooms.forEach((room, roomId) => {
    room.messages.push({ ...broadcastMsg, roomId });
    const payload = JSON.stringify({ type: 'chat-message', message: { ...broadcastMsg, roomId } });
    room.peers.forEach((peer) => {
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(payload);
        totalBroadcastedPeers++;
      }
    });
  });

  res.json({ success: true, roomsReached: rooms.size, peersReached: totalBroadcastedPeers });
});

app.post('/api/owner/terminate-room', (req, res) => {
  const { roomId } = req.body;
  if (!roomId) return res.status(400).json({ error: 'roomId required' });

  const roomKey = getRoomKey(roomId);
  const room = rooms.get(roomKey);
  if (room) {
    const payload = JSON.stringify({
      type: 'kicked',
      reason: 'This meeting was concluded by Platform Owner (Mirza Adeel).',
    });
    room.peers.forEach((peer) => {
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(payload);
        peer.ws.close();
      }
    });
    rooms.delete(roomKey);
    return res.json({ success: true, message: `Room ${roomKey} terminated.` });
  }

  res.status(404).json({ error: 'Room not found' });
});

// WebSocket Signaling & Real-time Room State
wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentPeerId: string | null = null;

  const broadcastToRoom = (roomId: string, message: any, excludePeerId?: string) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const data = JSON.stringify(message);
    room.peers.forEach((peer, peerId) => {
      if (peerId !== excludePeerId && peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(data);
      }
    });
  };

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'join-room': {
          const { roomId, peerId, user, password } = msg;
          if (!roomId || !peerId) return;

          const roomKey = getRoomKey(roomId);
          const displayId = formatRoomDisplay(roomKey);
          let room = rooms.get(roomKey);

          if (!room) {
            // Auto create room if doesn't exist
            room = {
              id: displayId,
              name: `Meeting ${displayId}`,
              hostId: peerId,
              createdAt: Date.now(),
              peers: new Map(),
              messages: [],
            };
            rooms.set(roomKey, room);
          }

          // Check password if configured
          if (room.password && room.password !== password) {
            ws.send(
              JSON.stringify({
                type: 'error',
                code: 'INVALID_PASSWORD',
                message: 'Incorrect meeting password. Please try again.',
              })
            );
            return;
          }

          // Determine host and owner status
          const isUserOwner = Boolean(user?.isOwner) || user?.name?.includes('Mirza Adeel');
          const isFirstUser = room.peers.size === 0;
          const isHost = isFirstUser || room.hostId === peerId || isUserOwner;
          if (isFirstUser || isUserOwner) {
            room.hostId = peerId;
          }

          currentRoomId = roomKey;
          currentPeerId = peerId;

          const peer: PeerData = {
            id: peerId,
            name: isUserOwner ? 'Mirza Adeel' : user?.name || 'Guest',
            avatar: user?.avatar || '',
            isHost,
            isOwner: isUserOwner,
            isMuted: Boolean(user?.isMuted),
            isVideoOff: Boolean(user?.isVideoOff),
            isScreenSharing: Boolean(user?.isScreenSharing),
            handRaised: Boolean(user?.handRaised),
            ws,
          };

          room.peers.set(peerId, peer);
          console.log(`[MeetFlow Server] Peer joined: "${peer.name}" (${peer.id}) in room ${roomKey}. Active peers: ${room.peers.size}`);

          // Return room state to the newly joined peer
          const peersList = Array.from(room.peers.values()).map((p) => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            isHost: p.isHost,
            isOwner: Boolean(p.isOwner),
            isMuted: p.isMuted,
            isVideoOff: p.isVideoOff,
            isScreenSharing: p.isScreenSharing,
            handRaised: p.handRaised,
          }));

          ws.send(
            JSON.stringify({
              type: 'room-state',
              roomId: room.id,
              roomName: room.name,
              hostId: room.hostId,
              peers: peersList,
              messages: room.messages.slice(-100),
            })
          );

          // Broadcast to everyone else in the room
          broadcastToRoom(
            roomKey,
            {
              type: 'peer-joined',
              peer: {
                id: peer.id,
                name: peer.name,
                avatar: peer.avatar,
                isHost: peer.isHost,
                isOwner: Boolean(peer.isOwner),
                isMuted: peer.isMuted,
                isVideoOff: peer.isVideoOff,
                isScreenSharing: peer.isScreenSharing,
                handRaised: peer.handRaised,
              },
            },
            peerId
          );

          // System message for joined
          const joinMsg: ChatMessage = {
            id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            roomId: room.id,
            senderPeerId: 'system',
            senderName: 'System',
            text: `${peer.name} joined the meeting`,
            timestamp: Date.now(),
            isHost: false,
          };
          room.messages.push(joinMsg);
          broadcastToRoom(roomKey, { type: 'chat-message', message: joinMsg });
          break;
        }

        case 'signal': {
          const { targetPeerId, signal } = msg;
          if (!currentRoomId || !currentPeerId || !targetPeerId) return;

          const room = rooms.get(currentRoomId);
          if (!room) return;

          const target = room.peers.get(targetPeerId);
          if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(
              JSON.stringify({
                type: 'signal',
                senderPeerId: currentPeerId,
                signal,
              })
            );
          }
          break;
        }

        case 'peer-update': {
          if (!currentRoomId || !currentPeerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const peer = room.peers.get(currentPeerId);
          if (!peer) return;

          const updates = msg.updates || {};
          if (typeof updates.name === 'string') peer.name = updates.name;
          if (typeof updates.isMuted === 'boolean') peer.isMuted = updates.isMuted;
          if (typeof updates.isVideoOff === 'boolean') peer.isVideoOff = updates.isVideoOff;
          if (typeof updates.isScreenSharing === 'boolean') peer.isScreenSharing = updates.isScreenSharing;
          if (typeof updates.handRaised === 'boolean') peer.handRaised = updates.handRaised;

          broadcastToRoom(
            currentRoomId,
            {
              type: 'peer-updated',
              peerId: currentPeerId,
              updates,
            },
            currentPeerId
          );
          break;
        }

        case 'chat-message': {
          if (!currentRoomId || !currentPeerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const peer = room.peers.get(currentPeerId);
          if (!peer) return;

          const text = String(msg.text || '').trim();
          if (!text) return;

          const chatMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            roomId: currentRoomId,
            senderPeerId: currentPeerId,
            senderName: peer.name,
            text,
            timestamp: Date.now(),
            isHost: peer.isHost,
            directTo: msg.directTo,
          };

          room.messages.push(chatMsg);
          if (room.messages.length > 300) {
            room.messages.shift();
          }

          if (msg.directTo) {
            // Direct message: send to target and sender
            const targetPeer = room.peers.get(msg.directTo);
            const payload = JSON.stringify({ type: 'chat-message', message: chatMsg });
            if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
              targetPeer.ws.send(payload);
            }
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(payload);
            }
          } else {
            // Public to everyone in the room
            broadcastToRoom(currentRoomId, { type: 'chat-message', message: chatMsg });
          }
          break;
        }

        case 'reaction': {
          if (!currentRoomId || !currentPeerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const peer = room.peers.get(currentPeerId);
          const emoji = String(msg.emoji || '👍');

          broadcastToRoom(currentRoomId, {
            type: 'reaction',
            id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            emoji,
            senderPeerId: currentPeerId,
            senderName: peer?.name || 'Someone',
          });
          break;
        }

        case 'mute-participant': {
          if (!currentRoomId || !currentPeerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const currentPeer = room.peers.get(currentPeerId);
          if (!currentPeer?.isHost && !currentPeer?.isOwner) return; // Only host/owner

          const targetPeer = room.peers.get(msg.targetPeerId);
          if (targetPeer?.isOwner) return; // Owner cannot be muted

          if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
            targetPeer.ws.send(
              JSON.stringify({
                type: 'remote-mute-request',
                by: currentPeer.name,
              })
            );
          }
          break;
        }

        case 'mute-all': {
          if (!currentRoomId || !currentPeerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const currentPeer = room.peers.get(currentPeerId);
          if (!currentPeer?.isHost && !currentPeer?.isOwner) return;

          room.peers.forEach((peer, peerId) => {
            if (peerId !== currentPeerId && !peer.isOwner && peer.ws.readyState === WebSocket.OPEN) {
              peer.ws.send(
                JSON.stringify({
                  type: 'remote-mute-request',
                  by: currentPeer.name,
                })
              );
            }
          });
          break;
        }

        case 'kick-peer': {
          if (!currentRoomId || !currentPeerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const currentPeer = room.peers.get(currentPeerId);
          if (!currentPeer?.isHost && !currentPeer?.isOwner) return;

          const targetPeer = room.peers.get(msg.targetPeerId);
          if (targetPeer?.isOwner) return; // Owner cannot be kicked

          if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
            targetPeer.ws.send(
              JSON.stringify({
                type: 'kicked',
                reason: currentPeer.isOwner
                  ? 'Removed by Platform Owner (Mirza Adeel)'
                  : 'Removed by meeting host',
              })
            );
            targetPeer.ws.close();
          }
          break;
        }

        case 'leave-room': {
          cleanUpPeer();
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  const cleanUpPeer = () => {
    if (!currentRoomId || !currentPeerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const peer = room.peers.get(currentPeerId);
    room.peers.delete(currentPeerId);

    // If host left, assign new host if peers remain
    if (peer?.isHost && room.peers.size > 0) {
      const nextHost = Array.from(room.peers.values())[0];
      nextHost.isHost = true;
      room.hostId = nextHost.id;
      broadcastToRoom(currentRoomId, {
        type: 'peer-updated',
        peerId: nextHost.id,
        updates: { isHost: true },
      });
    }

    broadcastToRoom(currentRoomId, {
      type: 'peer-left',
      peerId: currentPeerId,
    });

    if (peer) {
      const leaveMsg: ChatMessage = {
        id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        roomId: room.id,
        senderPeerId: 'system',
        senderName: 'System',
        text: `${peer.name} left the meeting`,
        timestamp: Date.now(),
        isHost: false,
      };
      room.messages.push(leaveMsg);
      broadcastToRoom(currentRoomId, { type: 'chat-message', message: leaveMsg });
    }

    currentRoomId = null;
    currentPeerId = null;
  };

  ws.on('close', cleanUpPeer);
  ws.on('error', cleanUpPeer);
});

// Periodic ping to keep WebSocket connections alive across Cloud Run & proxy timeouts
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.ping();
      } catch {}
    }
  });
}, 25000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

// Dev server or Production static serving
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/ws')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNumber = Number(PORT) || 3000;
  server.listen(portNumber, '0.0.0.0', () => {
    console.log(`MeetFlow server listening on http://0.0.0.0:${portNumber}`);
  });
}

startServer();
