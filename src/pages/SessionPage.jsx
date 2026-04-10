import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Step 1: Get camera stream immediately
  useEffect(() => {
    let mounted = true;

    async function getCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        setLocalStream(stream);
        setCameraReady(true);
      } catch (err) {
        console.warn('Camera access denied or unavailable, using fallback:', err.message);

        if (!mounted) return;

        // Fallback: animated canvas stream
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        let hue = 0;
        function drawFrame() {
          if (!mounted) return;
          hue = (hue + 0.5) % 360;
          const gradient = ctx.createLinearGradient(0, 0, 640, 480);
          gradient.addColorStop(0, `hsl(${hue}, 60%, 30%)`);
          gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 60%, 20%)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = '600 22px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('📷 Camera Unavailable', 320, 230);
          ctx.font = '400 14px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillText('Grant camera permission to enable video', 320, 260);
          requestAnimationFrame(drawFrame);
        }
        drawFrame();

        const stream = canvas.captureStream(30);
        streamRef.current = stream;
        setLocalStream(stream);
        setCameraReady(true);
      }
    }

    getCamera();

    return () => {
      mounted = false;
    };
  }, []);

  // Step 2: Attach stream to video element whenever either changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      // Ensure playback starts
      localVideoRef.current.play().catch(() => {
        // Autoplay may be blocked, user interaction needed
      });
    }
  }, [localStream, cameraReady, isConnecting]);

  // Step 3: Simulate peer connection after camera is ready
  useEffect(() => {
    if (!cameraReady) return;

    const timeout = setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);

      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [cameraReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setLocalStream(null);
    navigate(-1);
  }, [navigate]);

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="session-page">
      {/* Session Header */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div className="flex gap-3" style={{ alignItems: 'center' }}>
          <img src="/favicon.svg" alt="MindCare" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            MindCare Session
          </span>
          {isConnected && (
            <span className="badge badge-active" style={{ animationName: 'pulse-glow' }}>
              ● Connected
            </span>
          )}
          {isConnecting && (
            <span className="badge badge-scheduled">
              Connecting...
            </span>
          )}
        </div>
        <div className="flex gap-4" style={{ alignItems: 'center' }}>
          {isConnected && (
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>
              {formatTime(callDuration)}
            </span>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="session-container">
        <div className="session-video-area">
          {/* Local Video (You) — ALWAYS rendered so ref is available */}
          <div className="session-video-box">
            {/* Video element is always in DOM, just hidden when camera off */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: videoEnabled ? 'block' : 'none',
              }}
            />

            {/* Camera off overlay */}
            {!videoEnabled && (
              <div className="flex-center flex-col gap-2" style={{ position: 'absolute', inset: 0 }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--color-accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}>
                  🧑
                </div>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>Camera off</p>
              </div>
            )}

            {/* Connecting spinner overlay */}
            {isConnecting && !cameraReady && (
              <div className="flex-center flex-col gap-2" style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-secondary)' }}>
                <div className="spinner"></div>
                <p style={{ color: 'var(--color-text-tertiary)' }}>Starting camera...</p>
              </div>
            )}

            <div className="session-video-label">
              You {!audioEnabled && '🔇'}
            </div>
          </div>

          {/* Remote Video (Counselor) */}
          <div className="session-video-box">
            {isConnected ? (
              <div className="flex-center flex-col gap-3" style={{ position: 'absolute', inset: 0 }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'var(--color-accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  boxShadow: 'var(--shadow-glow-lg)',
                }}>
                  👩‍⚕️
                </div>
                <h3 style={{ color: 'var(--color-text-primary)' }}>Dr. Sarah Mitchell</h3>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                  Connected • {formatTime(callDuration)}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
                <p style={{ color: 'var(--color-text-tertiary)' }}>Waiting for counselor...</p>
              </div>
            )}
            <div className="session-video-label">Counselor</div>
          </div>
        </div>

        {/* Controls */}
        <div className="session-controls">
          <button
            className={`session-control-btn ${!audioEnabled ? 'muted' : ''}`}
            onClick={toggleAudio}
            title={audioEnabled ? 'Mute' : 'Unmute'}
            id="toggle-audio"
          >
            {audioEnabled ? '🎤' : '🔇'}
          </button>
          <button
            className={`session-control-btn ${!videoEnabled ? 'muted' : ''}`}
            onClick={toggleVideo}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            id="toggle-video"
          >
            {videoEnabled ? '📹' : '📷'}
          </button>
          <button
            className="session-control-btn end-call"
            onClick={endCall}
            title="End call"
            id="end-call"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
