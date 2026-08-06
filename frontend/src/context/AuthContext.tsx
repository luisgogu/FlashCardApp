import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  is_admin?: boolean;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('flashcardapp_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto fetch user profile if token exists
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('flashcardapp_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          // Token invalid/expired
          localStorage.removeItem('flashcardapp_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error auto-authenticating:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      let errorMsg = 'Error al iniciar sesión';
      if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMsg = data.detail.map((d: any) => typeof d === 'string' ? d : d.msg || JSON.stringify(d)).join(', ');
      } else if (data?.detail && typeof data.detail === 'object') {
        errorMsg = JSON.stringify(data.detail);
      } else if (data?.message && typeof data.message === 'string') {
        errorMsg = data.message;
      }
      throw new Error(errorMsg);
    }

    if (!data?.access_token || !data?.user) {
      throw new Error('Respuesta del servidor no válida');
    }

    localStorage.setItem('flashcardapp_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      let errorMsg = 'Error al registrar la cuenta';
      if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMsg = data.detail.map((d: any) => typeof d === 'string' ? d : d.msg || JSON.stringify(d)).join(', ');
      } else if (data?.detail && typeof data.detail === 'object') {
        errorMsg = JSON.stringify(data.detail);
      } else if (data?.message && typeof data.message === 'string') {
        errorMsg = data.message;
      }
      throw new Error(errorMsg);
    }

    if (!data?.access_token || !data?.user) {
      throw new Error('Respuesta de registro no válida');
    }

    localStorage.setItem('flashcardapp_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('flashcardapp_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
