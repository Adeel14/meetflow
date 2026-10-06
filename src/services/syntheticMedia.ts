/**
 * Synthetic fallback media stream generator.
 * Used when physical webcam or microphone is not available or blocked in iframe sandbox.
 * Creates an animated canvas video stream and Web Audio synthetic track.
 */

export function createSyntheticStream(name: string = 'User'): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  let frame = 0;
  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

  const draw = () => {
    if (!ctx) return;
    frame++;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle moving wave
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = colors[i % colors.length] + '40';
      const offset = (frame * 0.02) + i * 2;
      for (let x = 0; x < canvas.width; x += 10) {
        const y = canvas.height / 2 + Math.sin(x * 0.01 + offset) * 35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Centered avatar circle
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 15;
    const radius = 55;

    // Glowing outer ring
    const ringRadius = radius + Math.sin(frame * 0.05) * 4;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#6366f180';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Circle fill
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#312e81';
    ctx.fill();

    // Initials
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'MF';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, cx, cy);

    // Label
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(name, cx, cy + radius + 32);

    requestAnimationFrame(draw);
  };

  draw();

  const videoStream = canvas.captureStream(25);
  const videoTrack = videoStream.getVideoTracks()[0];

  // Create silent/subtle synthetic audio
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  let audioTrack: MediaStreamTrack;

  if (AudioContextClass) {
    try {
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.0001; // virtually silent
      osc.connect(gain);
      const dest = audioCtx.createMediaStreamDestination();
      gain.connect(dest);
      osc.start();
      audioTrack = dest.stream.getAudioTracks()[0];
    } catch {
      audioTrack = createMutedAudioTrack();
    }
  } else {
    audioTrack = createMutedAudioTrack();
  }

  const combinedStream = new MediaStream();
  if (videoTrack) combinedStream.addTrack(videoTrack);
  if (audioTrack) combinedStream.addTrack(audioTrack);

  return combinedStream;
}

function createMutedAudioTrack(): MediaStreamTrack {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (AudioContextClass) {
    const ctx = new AudioContextClass();
    const dest = ctx.createMediaStreamDestination();
    return dest.stream.getAudioTracks()[0];
  }
  return null as any;
}
