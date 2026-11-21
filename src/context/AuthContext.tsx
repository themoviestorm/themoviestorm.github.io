import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../api/types';
import { getUserProfile, loginUser, signupUser } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('moviestorm_access_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('moviestorm_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getUserProfile(token);
        setUser(profile);
        localStorage.setItem('moviestorm_user', JSON.stringify(profile));
      } catch {
        // If token expired, clear
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    setToken(res.accessToken);
    localStorage.setItem('moviestorm_access_token', res.accessToken);
    localStorage.setItem('moviestorm_refresh_token', res.refreshToken);
    const profile: UserProfile = {
      userId: res.userId,
      email: res.email,
      displayName: res.displayName,
      avatarUrl: res.avatarUrl,
      authProvider: 'LOCAL'
    };
    setUser(profile);
    localStorage.setItem('moviestorm_user', JSON.stringify(profile));
  };

  const signup = async (email: string, pass: string, name: string) => {
    const res = await signupUser(email, pass, name);
    setToken(res.accessToken);
    localStorage.setItem('moviestorm_access_token', res.accessToken);
    localStorage.setItem('moviestorm_refresh_token', res.refreshToken);
    const profile: UserProfile = {
      userId: res.userId,
      email: res.email,
      displayName: res.displayName,
      avatarUrl: res.avatarUrl,
      authProvider: 'LOCAL'
    };
    setUser(profile);
    localStorage.setItem('moviestorm_user', JSON.stringify(profile));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('moviestorm_access_token');
    localStorage.removeItem('moviestorm_refresh_token');
    localStorage.removeItem('moviestorm_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
