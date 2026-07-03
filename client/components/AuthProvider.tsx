"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

const setCookie = (name: string, value: string, days = 30) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/; SameSite=Lax";
};

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || getCookie('token');
    const storedUser = localStorage.getItem('user') || getCookie('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Keep in sync
        localStorage.setItem('token', storedToken);
        localStorage.setItem('user', storedUser);
        setCookie('token', storedToken, 30);
        setCookie('user', storedUser, 30);
      } catch (e) {
        console.error("Error parsing user from auth storage", e);
      }
    }
  }, []);

  const login = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    const userStr = JSON.stringify(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', userStr);
    setCookie('token', newToken, 30);
    setCookie('user', userStr, 30);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('token');
    removeCookie('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
