/**
 * WebRTC Connection Manager
 * Manages peer-to-peer mesh RTCPeerConnection instances between participants.
 * Implements the W3C Perfect Negotiation pattern to eliminate offer glare/collisions,
 * robust trickle ICE with candidate queuing, track synchronization, and STUN/TURN relays.
 */

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

export interface WebRTCCallbacks {
  onSignal: (targetPeerId: string, signal: any) => void;
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onPeerDisconnected: (peerId: string) => void;
}

export class WebRTCManager {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, MediaStream>();
  private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  private makingOffer = new Map<string, boolean>();
  private ignoreOffer = new Map<string, boolean>();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private localPeerId: string;
  private callbacks: WebRTCCallbacks;

  constructor(localPeerId: string, callbacks: WebRTCCallbacks) {
    this.localPeerId = localPeerId;
    this.callbacks = callbacks;
  }

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    this.peerConnections.forEach((pc) => {
      this.syncTracks(pc);
    });
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public setScreenStream(stream: MediaStream | null) {
    this.screenStream = stream;
    this.peerConnections.forEach((pc) => {
      this.syncTracks(pc);
    });
  }

  public getOrCreatePeerConnection(peerId: string): RTCPeerConnection {
    let pc = this.peerConnections.get(peerId);
    if (pc) return pc;

    pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnections.set(peerId, pc);

    // Initial track attachment
    this.syncTracks(pc);

    // ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        this.callbacks.onSignal(peerId, {
          type: 'candidate',
          candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
        });
      }
    };

    // Remote Track received
    pc.ontrack = (event) => {
      console.log(`[MeetFlow WebRTC] Remote ${event.track.kind} track received from ${peerId}`);
      let stream = this.remoteStreams.get(peerId);
      if (!stream) {
        stream = new MediaStream();
        this.remoteStreams.set(peerId, stream);
      }

      // Add track or replace existing of same kind
      const existing = stream.getTracks().find((t) => t.kind === event.track.kind);
      if (existing) {
        stream.removeTrack(existing);
      }
      stream.addTrack(event.track);

      // Pass a fresh MediaStream container so React components detect reference change
      const streamSnapshot = new MediaStream(stream.getTracks());
      this.callbacks.onRemoteStream(peerId, streamSnapshot);

      event.track.onended = () => {
        console.log(`[MeetFlow WebRTC] Remote ${event.track.kind} track ended from ${peerId}`);
      };
    };

    // ICE state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`[MeetFlow WebRTC] ICE state [${peerId}]: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed') {
        console.warn(`[MeetFlow WebRTC] ICE failed for ${peerId}, restarting ICE...`);
        this.callPeer(peerId, true).catch(() => {});
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[MeetFlow WebRTC] Connection state [${peerId}]: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        // Notify media stream disconnection but do not kick participant from meeting
        this.callbacks.onPeerDisconnected(peerId);
      }
    };

    return pc;
  }

  public syncTracks(pc: RTCPeerConnection) {
    if (!this.localStream) return;

    const currentSenders = pc.getSenders();
    const videoTrack = this.screenStream
      ? this.screenStream.getVideoTracks()[0]
      : this.localStream.getVideoTracks()[0];
    const audioTrack = this.localStream.getAudioTracks()[0];

    // Synchronize video track
    if (videoTrack) {
      const videoSender = currentSenders.find((s) => s.track?.kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(videoTrack).catch((err) => {
          console.warn('[MeetFlow WebRTC] Error replacing video track:', err);
        });
      } else {
        try {
          pc.addTrack(videoTrack, this.localStream);
        } catch (e) {
          console.debug('[MeetFlow WebRTC] addTrack video info:', e);
        }
      }
    }

    // Synchronize audio track
    if (audioTrack) {
      const audioSender = currentSenders.find((s) => s.track?.kind === 'audio');
      if (audioSender) {
        audioSender.replaceTrack(audioTrack).catch((err) => {
          console.warn('[MeetFlow WebRTC] Error replacing audio track:', err);
        });
      } else {
        try {
          pc.addTrack(audioTrack, this.localStream);
        } catch (e) {
          console.debug('[MeetFlow WebRTC] addTrack audio info:', e);
        }
      }
    }
  }

  /**
   * Initiate an outgoing WebRTC call to an existing peer.
   * Handles state checks so we don't create conflicting offers.
   */
  public async callPeer(peerId: string, iceRestart: boolean = false) {
    const pc = this.getOrCreatePeerConnection(peerId);
    this.syncTracks(pc);

    try {
      this.makingOffer.set(peerId, true);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart,
      });

      // Avoid setting local description if state changed during offer creation
      if (pc.signalingState !== 'stable') {
        console.debug(`[MeetFlow WebRTC] State is ${pc.signalingState}, waiting for remote response.`);
        return;
      }

      await pc.setLocalDescription(offer);

      this.callbacks.onSignal(peerId, {
        type: 'offer',
        sdp: offer,
      });
    } catch (err) {
      console.error(`[MeetFlow WebRTC] Failed to create offer for peer ${peerId}:`, err);
    } finally {
      this.makingOffer.set(peerId, false);
    }
  }

  /**
   * Handle incoming WebRTC signaling message with Perfect Negotiation
   */
  public async handleSignal(senderPeerId: string, signal: any) {
    const pc = this.getOrCreatePeerConnection(senderPeerId);
    // Deterministic politeness tie-breaker: alphabetical comparison of peer IDs
    const isPolite = this.localPeerId > senderPeerId;

    try {
      if (signal.type === 'offer') {
        const isCollision =
          this.makingOffer.get(senderPeerId) || pc.signalingState !== 'stable';

        // Impolite peer ignores colliding offer; polite peer rolls back to accept incoming offer
        const ignore = !isPolite && isCollision;
        this.ignoreOffer.set(senderPeerId, ignore);

        if (ignore) {
          console.warn(
            `[MeetFlow WebRTC] Glare collision detected. Impolite peer ignoring offer from ${senderPeerId}`
          );
          return;
        }

        if (isCollision && isPolite) {
          console.log(
            `[MeetFlow WebRTC] Glare collision detected. Polite peer rolling back local offer for ${senderPeerId}`
          );
          try {
            await pc.setLocalDescription({ type: 'rollback' });
          } catch (e) {
            console.debug('[MeetFlow WebRTC] Rollback notice:', e);
          }
        }

        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        // Sync local tracks so the answer contains our media
        this.syncTracks(pc);

        // Process any queued ICE candidates that arrived before remote description
        const queued = this.pendingCandidates.get(senderPeerId) || [];
        for (const cand of queued) {
          if (cand && cand.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
        }
        this.pendingCandidates.delete(senderPeerId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.callbacks.onSignal(senderPeerId, {
          type: 'answer',
          sdp: answer,
        });
      } else if (signal.type === 'answer') {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          const queued = this.pendingCandidates.get(senderPeerId) || [];
          for (const cand of queued) {
            if (cand && cand.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
          }
          this.pendingCandidates.delete(senderPeerId);
        }
      } else if (signal.type === 'candidate' && signal.candidate?.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch((err) => {
            console.debug('[MeetFlow WebRTC] addIceCandidate notice:', err);
          });
        } else {
          // Queue candidate until remote description is established
          const list = this.pendingCandidates.get(senderPeerId) || [];
          list.push(signal.candidate);
          this.pendingCandidates.set(senderPeerId, list);
        }
      }
    } catch (err) {
      console.warn(`[MeetFlow WebRTC] Error handling signal from ${senderPeerId}:`, err);
    }
  }

  public removePeer(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      try {
        pc.close();
      } catch {}
      this.peerConnections.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
    this.pendingCandidates.delete(peerId);
    this.makingOffer.delete(peerId);
    this.ignoreOffer.delete(peerId);
  }

  public destroy() {
    this.peerConnections.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.pendingCandidates.clear();
    this.makingOffer.clear();
    this.ignoreOffer.clear();
  }
}
