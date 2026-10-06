import { useEffect, useRef, useState } from 'react';

export function useAudioAnalyser(stream: MediaStream | null | undefined, enabled: boolean = true) {
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !enabled) {
      setAudioLevel(0);
      setIsSpeaking(false);
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack || !audioTrack.enabled || audioTrack.readyState !== 'live') {
      setAudioLevel(0);
      setIsSpeaking(false);
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    let audioCtx: AudioContext;
    try {
      audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
    } catch {
      return;
    }

    let sourceNode: MediaStreamAudioSourceNode | null = null;
    let analyserNode: AnalyserNode | null = null;

    try {
      sourceNode = audioCtx.createMediaStreamSource(stream);
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.5;
      sourceNode.connect(analyserNode);
    } catch (e) {
      console.warn('AudioAnalyser setup failed:', e);
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let activeCount = 0;

    const checkAudio = () => {
      if (!analyserNode) return;
      analyserNode.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const normalized = Math.min(100, Math.round((average / 128) * 100));

      setAudioLevel(normalized);

      // Active speaker threshold
      if (normalized > 12) {
        activeCount++;
        if (activeCount >= 2) {
          setIsSpeaking(true);
        }
      } else {
        activeCount = 0;
        setIsSpeaking(false);
      }

      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };

    checkAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceNode) {
        sourceNode.disconnect();
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [stream, enabled]);

  return { audioLevel, isSpeaking };
}
