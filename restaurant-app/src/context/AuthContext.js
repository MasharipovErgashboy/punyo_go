import React, { createContext, useContext, useEffect, useState } from 'react';
import { Partner, saveAuth, loadAuth, clearAuth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const a = await loadAuth();
      if (a) setAuth(a);
      setReady(true);
    })();
  }, []);

  const login = async (username, password) => {
    const data = await Partner.login(username, password);
    await saveAuth(data);
    setAuth(data);
    return data;
  };

  const logout = async () => {
    await clearAuth();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
