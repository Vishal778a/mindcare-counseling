import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

// Set YOUR Google email here to be recognized as admin
// Or set via environment variable VITE_ADMIN_EMAIL
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

// Session expires after 8 hours
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function saveSession(user) {
  const session = {
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  localStorage.setItem('mindcare_session', JSON.stringify(session));
}

function loadSession() {
  try {
    const raw = localStorage.getItem('mindcare_session');
    if (!raw) return null;

    const session = JSON.parse(raw);

    // Check expiry
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('mindcare_session');
      return null;
    }

    // Demo admin sessions should NOT persist across page loads
    // Only Google-authenticated admin sessions persist
    if (session.user?.role === 'admin' && !session.user?.googleId) {
      localStorage.removeItem('mindcare_session');
      return null;
    }

    return session.user;
  } catch {
    localStorage.removeItem('mindcare_session');
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('mindcare_session');
  // Also clear legacy key from previous versions
  localStorage.removeItem('mindcare_user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any legacy session from old format
    if (localStorage.getItem('mindcare_user')) {
      localStorage.removeItem('mindcare_user');
    }

    const storedUser = loadSession();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    const role = (ADMIN_EMAIL && userData.email === ADMIN_EMAIL) ? 'admin' : userData.role || 'patient';
    const fullUser = { ...userData, role };
    setUser(fullUser);
    saveSession(fullUser);
    return fullUser;
  }, []);

  // Google OAuth callback — decode the credential JWT
  const loginWithGoogle = useCallback((credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));

      const userData = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub,
        token: token,
      };

      const role = (ADMIN_EMAIL && payload.email === ADMIN_EMAIL) ? 'admin' : 'patient';
      const fullUser = { ...userData, role };

      setUser(fullUser);
      saveSession(fullUser);
      return fullUser;
    } catch (err) {
      console.error('Google login failed:', err);
      return null;
    }
  }, []);

  // Dev-only admin login — session is NOT persisted (memory only)
  const loginAsAdmin = useCallback(() => {
    const adminUser = {
      email: ADMIN_EMAIL || 'counsellor@mindcare.com',
      name: 'Dr. Sarah Mitchell',
      role: 'admin',
      picture: null,
      isDemo: true,
    };
    setUser(adminUser);
    // Intentionally NOT saving to localStorage — expires on page close/refresh
    return adminUser;
  }, []);

  // Demo patient login — persists (patients are less sensitive)
  const loginAsPatient = useCallback(() => {
    const patientUser = {
      email: 'patient@example.com',
      name: 'Alex Johnson',
      role: 'patient',
      picture: null,
      isDemo: true,
    };
    setUser(patientUser);
    saveSession(patientUser);
    return patientUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isPatient = user?.role === 'patient';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isPatient,
        isAuthenticated,
        login,
        loginWithGoogle,
        loginAsAdmin,
        loginAsPatient,
        logout,
        adminEmail: ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
