import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthSession, logout as logoutRequest } from '../services/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getAuthSession()
      .then((result) => { if (active) setSession(result); })
      .catch((cause) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, []);

  async function signOut() {
    await logoutRequest();
    setSession((current) => current ? { ...current, authenticated: false, user: null } : current);
  }

  const value = useMemo(() => ({ session, error, signOut }), [session, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
