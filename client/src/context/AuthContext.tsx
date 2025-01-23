import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username: string, password: string) => {
    try {
      const response = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authFetch('/api/auth/logout', {
        method: 'POST'
      });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const authFetch = async (input: RequestInfo, init?: RequestInit) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = typeof input === 'string' ? `${apiBaseUrl}${input}` : input;
    
    const response = await fetch(url, {
      ...init,
      credentials: 'include'
    });

    if (response.status === 401) {
      setIsAuthenticated(false);
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}