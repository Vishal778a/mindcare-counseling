import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

// Demo data for the counsellor (admin)
const ADMIN_EMAIL = 'counsellor@mindcare.com';

// Mock users database
const MOCK_USERS = {
  'counsellor@mindcare.com': {
    email: 'counsellor@mindcare.com',
    name: 'Dr. Sarah Mitchell',
    role: 'admin',
    picture: null,
  },
  'patient@example.com': {
    email: 'patient@example.com',
    name: 'Alex Johnson',
    role: 'patient',
    picture: null,
  },
};

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
    // Determine role based on email
    const role = userData.email === ADMIN_EMAIL ? 'admin' : 'patient';
    const fullUser = {
      ...userData,
      role,
    };
    setUser(fullUser);
    localStorage.setItem('mindcare_user', JSON.stringify(fullUser));
    return fullUser;
  }, []);

  const loginAsAdmin = useCallback(() => {
    const adminUser = MOCK_USERS['counsellor@mindcare.com'];
    setUser(adminUser);
    localStorage.setItem('mindcare_user', JSON.stringify(adminUser));
    return adminUser;
  }, []);

  const loginAsPatient = useCallback(() => {
    const patientUser = MOCK_USERS['patient@example.com'];
    setUser(patientUser);
    localStorage.setItem('mindcare_user', JSON.stringify(patientUser));
    return patientUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mindcare_user');
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
        loginAsAdmin,
        loginAsPatient,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
