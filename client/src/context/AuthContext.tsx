import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
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

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
         console.log(response)
        throw new Error('Login failed');
      }

      const { accessToken } = await response.json();
      setToken(accessToken);
      setAuthCookies(accessToken, '');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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

  const authFetch = async (input: RequestInfo, init?: RequestInit) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = typeof input === 'string' ? `${apiBaseUrl}${input}` : input;
    
    console.log('Making request to:', url);
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(url, {
      ...init,
      headers,
      credentials: 'include'
    });
    console.log('Response status:', response.status);
    return response;
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, refreshToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}