import { useCallback, useEffect, useRef, useState } from 'react';
import { createSyntheticStream } from '../services/syntheticMedia';

export interface DeviceItem {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export function useMediaDevices(userName: string = 'User') {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  const [audioDevices, setAudioDevices] = useState<DeviceItem[]>([]);
  const [videoDevices, setVideoDevices] = useState<DeviceItem[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<DeviceItem[]>([]);

  const [selectedAudioId, setSelectedAudioId] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedOutputId, setSelectedOutputId] = useState<string>('');

  const [isReady, setIsReady] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const isSyntheticRef = useRef<boolean>(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  localStreamRef.current = localStream;

  // Refresh hardware devices
  const enumerateDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics: DeviceItem[] = [];
      const cams: DeviceItem[] = [];
      const speakers: DeviceItem[] = [];

      devices.forEach((d, idx) => {
        if (d.kind === 'audioinput') {
          mics.push({
            deviceId: d.deviceId || `default-mic-${idx}`,
            label: d.label || `Microphone ${mics.length + 1}`,
            kind: d.kind,
          });
        } else if (d.kind === 'videoinput') {
          cams.push({
            deviceId: d.deviceId || `default-cam-${idx}`,
            label: d.label || `Camera ${cams.length + 1}`,
            kind: d.kind,
          });
        } else if (d.kind === 'audiooutput') {
          speakers.push({
            deviceId: d.deviceId || `default-speaker-${idx}`,
            label: d.label || `Speaker ${speakers.length + 1}`,
            kind: d.kind,
          });
        }
      });

      setAudioDevices(mics);
      setVideoDevices(cams);
      setAudioOutputDevices(speakers);

      if (mics.length && !selectedAudioId) setSelectedAudioId(mics[0].deviceId);
      if (cams.length && !selectedVideoId) setSelectedVideoId(cams[0].deviceId);
      if (speakers.length && !selectedOutputId) setSelectedOutputId(speakers[0].deviceId);
    } catch (e) {
      console.warn('enumerateDevices error:', e);
    }
  }, [selectedAudioId, selectedVideoId, selectedOutputId]);

  // Request user media
  const initMedia = useCallback(
    async (options?: { audioId?: string; videoId?: string; startMuted?: boolean; startVideoOff?: boolean }) => {
      setPermissionError(null);
      let stream: MediaStream | null = null;

      const audioConstraint = options?.audioId
        ? { deviceId: { exact: options.audioId }, echoCancellation: true, noiseSuppression: true }
        : { echoCancellation: true, noiseSuppression: true };

      const videoConstraint = options?.videoId
        ? { deviceId: { exact: options.videoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } };

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: audioConstraint,
              video: videoConstraint,
            });
            isSyntheticRef.current = false;
          } catch (mediaErr: any) {
            console.warn('Real camera/mic failed or was blocked, falling back to audio-only or synthetic stream:', mediaErr);
            // Try video only or audio only before synthetic fallback
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch {
              // fallback to synthetic media stream so platform always functions
              stream = createSyntheticStream(userName);
              isSyntheticRef.current = true;
            }
          }
        } else {
          stream = createSyntheticStream(userName);
          isSyntheticRef.current = true;
        }
      } catch (err: any) {
        console.warn('Stream setup encountered error, applying synthetic stream:', err);
        stream = createSyntheticStream(userName);
        isSyntheticRef.current = true;
      }

      if (options?.startMuted) {
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
        setIsMuted(true);
      }
      if (options?.startVideoOff) {
        stream.getVideoTracks().forEach((t) => (t.enabled = false));
        setIsVideoOff(true);
      }

      setLocalStream(stream);
      setIsReady(true);
      await enumerateDevices();
      return stream;
    },
    [userName, enumerateDevices]
  );

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  }, []);

  // Toggle Video
  const toggleVideo = useCallback(() => {
    setIsVideoOff((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  }, []);

  // Switch microphone
  const switchAudioDevice = useCallback(
    async (deviceId: string) => {
      setSelectedAudioId(deviceId);
      if (isSyntheticRef.current || !navigator.mediaDevices?.getUserMedia) return;
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        const newAudioTrack = newStream.getAudioTracks()[0];
        if (newAudioTrack && localStreamRef.current) {
          const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];
          if (oldAudioTrack) {
            oldAudioTrack.stop();
            localStreamRef.current.removeTrack(oldAudioTrack);
          }
          newAudioTrack.enabled = !isMuted;
          localStreamRef.current.addTrack(newAudioTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }
      } catch (e) {
        console.warn('Failed switching audio device:', e);
      }
    },
    [isMuted]
  );

  // Switch camera
  const switchVideoDevice = useCallback(
    async (deviceId: string) => {
      setSelectedVideoId(deviceId);
      if (isSyntheticRef.current || !navigator.mediaDevices?.getUserMedia) return;
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (newVideoTrack && localStreamRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldVideoTrack) {
            oldVideoTrack.stop();
            localStreamRef.current.removeTrack(oldVideoTrack);
          }
          newVideoTrack.enabled = !isVideoOff;
          localStreamRef.current.addTrack(newVideoTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }
      } catch (e) {
        console.warn('Failed switching video device:', e);
      }
    },
    [isVideoOff]
  );

  // Start Screen Share
  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen sharing is not supported in this browser.');
      return null;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });

      const screenTrack = displayStream.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.onended = () => {
          stopScreenShare();
        };
      }

      setScreenStream(displayStream);
      setIsScreenSharing(true);
      return displayStream;
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.warn('Screen share error:', err);
      }
      return null;
    }
  }, []);

  // Stop Screen Share
  const stopScreenShare = useCallback(() => {
    setScreenStream((curr) => {
      if (curr) {
        curr.getTracks().forEach((t) => t.stop());
      }
      return null;
    });
    setIsScreenSharing(false);
  }, []);

  // Device change listener
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      const handler = () => enumerateDevices();
      navigator.mediaDevices.addEventListener('devicechange', handler);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handler);
      };
    }
  }, [enumerateDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [screenStream]);

  return {
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
    isReady,
    permissionError,
    initMedia,
    toggleMute,
    toggleVideo,
    switchAudioDevice,
    switchVideoDevice,
    setSelectedOutputId,
    startScreenShare,
    stopScreenShare,
  };
}
