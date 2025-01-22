import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const setAuthCookies = (accessToken: string, refreshToken: string) => {
    document.cookie = `accessToken=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900`; // 15 minutes
    document.cookie = `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`; // 7 days
  };

  const clearAuthCookies = () => {
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure';
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure';
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const login = async (accessToken: string, refreshToken: string) => {
    setAuthCookies(accessToken, refreshToken);
    setToken(accessToken);
  };

  const logout = async () => {
    clearAuthCookies();
    setToken(null);
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setAuthCookies(data.accessToken, data.refreshToken);
        setToken(data.accessToken);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getCookie('accessToken');
      if (accessToken) {
        setToken(accessToken);
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    const tokenRefreshInterval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000); // Refresh token every 14 minutes

    return () => clearInterval(tokenRefreshInterval);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}