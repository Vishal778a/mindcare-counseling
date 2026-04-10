import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

// Set YOUR Google email here to be recognized as admin
// Or set via environment variable VITE_ADMIN_EMAIL
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem('mindcare_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('mindcare_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    // Determine role: if email matches admin email → admin, otherwise patient
    const role = (ADMIN_EMAIL && userData.email === ADMIN_EMAIL) ? 'admin' : userData.role || 'patient';
    const fullUser = {
      ...userData,
      role,
    };
    setUser(fullUser);
    localStorage.setItem('mindcare_user', JSON.stringify(fullUser));
    return fullUser;
  }, []);

  // Google OAuth callback — decode the credential JWT
  const loginWithGoogle = useCallback((credentialResponse) => {
    try {
      // Decode the Google JWT token (base64 payload)
      const token = credentialResponse.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));

      const userData = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub,
        token: token,
      };

      // Check if this email is the admin
      const role = (ADMIN_EMAIL && payload.email === ADMIN_EMAIL) ? 'admin' : 'patient';
      const fullUser = { ...userData, role };

      setUser(fullUser);
      localStorage.setItem('mindcare_user', JSON.stringify(fullUser));
      return fullUser;
    } catch (err) {
      console.error('Google login failed:', err);
      return null;
    }
  }, []);

  const loginAsAdmin = useCallback(() => {
    const adminUser = {
      email: ADMIN_EMAIL || 'counsellor@mindcare.com',
      name: 'Dr. Sarah Mitchell',
      role: 'admin',
      picture: null,
    };
    setUser(adminUser);
    localStorage.setItem('mindcare_user', JSON.stringify(adminUser));
    return adminUser;
  }, []);

  const loginAsPatient = useCallback(() => {
    const patientUser = {
      email: 'patient@example.com',
      name: 'Alex Johnson',
      role: 'patient',
      picture: null,
    };
    setUser(patientUser);
    localStorage.setItem('mindcare_user', JSON.stringify(patientUser));
    return patientUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mindcare_user');
    // Also revoke Google session if using Google Sign-In
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
