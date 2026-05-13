import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('evalify_token'));
  const [loading, setLoading] = useState(true);

  // Initialize Auth state on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('evalify_token');
      if (storedToken) {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
          const { data } = await axios.get(`${baseUrl}/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(data);
          setToken(storedToken);
        } catch (err) {
          console.error("Session restore failed:", err);
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('evalify_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken) => {
    localStorage.setItem('evalify_token', newToken);
    setToken(newToken);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('evalify_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('evalify_token');
    if (!storedToken) return;
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const { data } = await axios.get(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setUser(data);
    } catch (err) {
      console.error("User refresh failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
