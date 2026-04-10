import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Set your Google OAuth Client ID here or in .env as VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const { loginWithGoogle, loginAsAdmin, loginAsPatient, isAuthenticated, isAdmin, adminEmail } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/dashboard' : '/patient/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Load Google Sign-In script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // Check if script already loaded
    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogle();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed — script persists
    };
  }, []);

  function initializeGoogle() {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
    });

    // Render the Google button
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_blue',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }

    setGoogleLoaded(true);
  }

  function handleGoogleResponse(response) {
    const user = loginWithGoogle(response);
    if (user) {
      navigate(user.role === 'admin' ? '/dashboard' : '/patient/dashboard');
    }
  }

  const handleAdminLogin = () => {
    loginAsAdmin();
    navigate('/dashboard');
  };

  const handlePatientLogin = () => {
    loginAsPatient();
    navigate('/patient/dashboard');
  };

  if (isAuthenticated) return null;

  return (
    <div className="login-page animate-fade-in">
      <div className="card card-glass login-card animate-scale-in">
        <div className="login-icon">🧠</div>
        <h1>Welcome to <span className="text-gradient">MindCare</span></h1>
        <p>Sign in to access your account and manage your mental health journey.</p>

        {/* Real Google Sign-In Button */}
        {GOOGLE_CLIENT_ID ? (
          <div>
            <div
              ref={googleBtnRef}
              id="google-signin-btn"
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}
            ></div>
            {adminEmail && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>
                🔒 Admin account: {adminEmail}
              </p>
            )}
          </div>
        ) : (
          <div>
            <button
              className="google-btn"
              onClick={() => setShowSetup(!showSetup)}
              id="google-login-btn"
              style={{ marginBottom: 'var(--space-2)' }}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {showSetup && (
              <div className="card animate-fade-in" style={{
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--text-xs)',
                textAlign: 'left',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-accent)',
              }}>
                <p style={{ fontWeight: 600, color: 'var(--color-accent-secondary)', marginBottom: 'var(--space-2)' }}>
                  🔧 Setup Google Sign-In
                </p>
                <ol style={{ paddingLeft: 'var(--space-4)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                  <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer">Google Cloud Console</a></li>
                  <li>Create a new project (or select existing)</li>
                  <li>Go to <strong>APIs &amp; Services → Credentials</strong></li>
                  <li>Click <strong>Create Credentials → OAuth Client ID</strong></li>
                  <li>Choose <strong>Web application</strong></li>
                  <li>Add <code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 4px', borderRadius: '3px' }}>http://localhost:5173</code> to Authorized JavaScript Origins</li>
                  <li>Copy the <strong>Client ID</strong></li>
                  <li>Create a <code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 4px', borderRadius: '3px' }}>.env</code> file in project root with:
                    <pre style={{
                      background: 'var(--color-bg-tertiary)',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: 'var(--space-1)',
                      overflow: 'auto',
                    }}>
{`VITE_GOOGLE_CLIENT_ID=your-client-id-here
VITE_ADMIN_EMAIL=your-email@gmail.com`}
                    </pre>
                  </li>
                  <li>Restart the dev server</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="login-divider">or try demo modes</div>

        {/* Demo Login Buttons */}
        <div className="flex-col gap-3">
          <button
            className="btn btn-primary"
            onClick={handleAdminLogin}
            style={{ width: '100%' }}
            id="demo-admin-login"
          >
            👩‍⚕️ Login as Counsellor (Admin Demo)
          </button>
          <button
            className="btn btn-outline"
            onClick={handlePatientLogin}
            style={{ width: '100%' }}
            id="demo-patient-login"
          >
            🧑 Login as Patient (Demo)
          </button>
        </div>

        <p style={{
          marginTop: 'var(--space-6)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
        }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />Your data is encrypted and confidential.
        </p>
      </div>
    </div>
  );
}
