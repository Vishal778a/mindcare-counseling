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

  const timerRef = useRef(null);

  // Simulate connection
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        // Request media access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        }).catch(() => {
          // Fallback: create a simulated canvas stream if no camera
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');

          // Draw a gradient background as placeholder
          const gradient = ctx.createLinearGradient(0, 0, 640, 480);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#a78bfa');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = 'white';
          ctx.font = '24px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('📷 Camera Preview', 320, 240);

          return canvas.captureStream(30);
        });

        if (!mounted) return;

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate peer connection delay
        setTimeout(() => {
          if (!mounted) return;
          setIsConnecting(false);
          setIsConnected(true);

          // Start duration timer
          timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        }, 2000);
      } catch (err) {
        console.error('Session init failed:', err);
        setIsConnecting(false);
      }
    }

    initSession();

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    navigate(-1);
  }, [localStream, navigate]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
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
          {/* Local Video (You) */}
          <div className="session-video-box">
            {isConnecting ? (
              <div className="text-center">
                <div className="spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
                <p style={{ color: 'var(--color-text-tertiary)' }}>Setting up camera...</p>
              </div>
            ) : (
              <>
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
              </>
            )}
            <div className="session-video-label">You</div>
          </div>

          {/* Remote Video (Other person) */}
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
