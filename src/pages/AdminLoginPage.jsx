import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AdminLoginPage() {
  const { loginWithGoogle, loginAsAdmin, isAuthenticated, isAdmin, adminEmail } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/dashboard', { replace: true });
    } else if (isAuthenticated && !isAdmin) {
      // If a patient somehow lands here, redirect them
      navigate('/patient/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Load Google Sign-In script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, []);

  function initializeGoogle() {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_blue',
        size: 'large',
        width: 360,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }

    setGoogleLoaded(true);
  }

  function handleGoogleResponse(response) {
    const user = loginWithGoogle(response);
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        setError(`Access denied. The email "${user.email}" is not registered as the admin account. Only the counsellor's Google account can access the admin panel.`);
        // Logout the non-admin user
        localStorage.removeItem('mindcare_user');
        setTimeout(() => window.location.reload(), 3000);
      }
    }
  }

  if (isAuthenticated) return null;

  return (
    <div className="login-page animate-fade-in">
      <div className="card card-glass login-card animate-scale-in" style={{ maxWidth: '460px' }}>
        {/* Admin badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--color-accent-secondary)',
          marginBottom: 'var(--space-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          🔒 Counsellor Access
        </div>

        <div className="login-icon" style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        }}>👩‍⚕️</div>

        <h1>Counsellor <span className="text-gradient">Portal</span></h1>
        <p style={{ marginBottom: 'var(--space-6)' }}>
          Sign in with your authorized Google account to access the admin dashboard.
        </p>

        {/* Error message */}
        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-danger)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
            textAlign: 'left',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Real Google Sign-In */}
        {GOOGLE_CLIENT_ID ? (
          <div>
            <div
              ref={googleBtnRef}
              id="admin-google-signin"
              style={{ display: 'flex', justifyContent: 'center' }}
            ></div>
            {adminEmail && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-3)',
              }}>
                🔐 Only <strong style={{ color: 'var(--color-accent-secondary)' }}>{adminEmail}</strong> has admin access
              </p>
            )}
          </div>
        ) : (
          <div>
            {/* No Google Client ID configured — show setup instructions */}
            <div style={{
              padding: 'var(--space-5)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-accent)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'left',
              marginBottom: 'var(--space-4)',
            }}>
              <p style={{
                fontWeight: 600,
                color: 'var(--color-accent-secondary)',
                marginBottom: 'var(--space-3)',
                fontSize: 'var(--text-sm)',
              }}>
                🔧 Google OAuth Not Configured
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                To enable secure admin login, you need to set up Google OAuth. Create a <code style={{
                  background: 'var(--color-bg-tertiary)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontSize: 'var(--text-xs)',
                }}>.env</code> file in your project root:
              </p>
              <pre style={{
                background: 'var(--color-bg-tertiary)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                marginTop: 'var(--space-3)',
                overflow: 'auto',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.8,
              }}>
{`VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
VITE_ADMIN_EMAIL=your-email@gmail.com`}
              </pre>

              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 'var(--space-3)', width: '100%' }}
                onClick={() => setShowSetup(!showSetup)}
              >
                {showSetup ? 'Hide' : 'Show'} Full Setup Guide
              </button>

              {showSetup && (
                <ol style={{
                  paddingLeft: 'var(--space-5)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-xs)',
                  lineHeight: 2,
                  marginTop: 'var(--space-3)',
                }}>
                  <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-secondary)' }}>Google Cloud Console</a></li>
                  <li>Create or select a project</li>
                  <li>Enable: <strong>Google Sheets API</strong>, <strong>Google Calendar API</strong></li>
                  <li>Go to <strong>APIs &amp; Services → OAuth consent screen</strong> → Configure</li>
                  <li>Go to <strong>Credentials → Create OAuth Client ID → Web application</strong></li>
                  <li>Add <code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 4px', borderRadius: '3px' }}>http://localhost:5173</code> to Authorized JavaScript Origins</li>
                  <li>For production, also add your Netlify URL</li>
                  <li>Copy the Client ID → paste in <code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 4px', borderRadius: '3px' }}>.env</code></li>
                  <li>Set your Google email as <code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 4px', borderRadius: '3px' }}>VITE_ADMIN_EMAIL</code></li>
                  <li>Restart the dev server</li>
                </ol>
              )}
            </div>

            {/* Temporary dev-only admin bypass — remove in production */}
            {import.meta.env.DEV && (
              <>
                <div className="login-divider" style={{ margin: 'var(--space-4) 0' }}>dev mode only</div>
                <button
                  className="btn btn-secondary"
                  onClick={() => { loginAsAdmin(); navigate('/dashboard'); }}
                  style={{ width: '100%', opacity: 0.7 }}
                  id="dev-admin-login"
                >
                  🛠️ Dev: Skip to Admin (removed in production)
                </button>
              </>
            )}
          </div>
        )}

        <div className="divider" style={{ margin: 'var(--space-6) 0 var(--space-3)' }}></div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
          This page is for the counsellor only.
          <br />
          Patients should use the{' '}
          <a href="/login" style={{ color: 'var(--color-accent-secondary)' }}>patient login page</a>.
        </p>
      </div>
    </div>
  );
}
