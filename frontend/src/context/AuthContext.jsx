import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ name: 'Guest User', email: 'guest@example.com' });
  const [token, setToken] = useState('guest-token');
  const [loading, setLoading] = useState(false);

  const login = (newToken) => {
    setToken(newToken || 'guest-token');
  };

  const logout = () => {
    // No-op for removed login
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

