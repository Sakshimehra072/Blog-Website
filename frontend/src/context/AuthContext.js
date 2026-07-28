'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerApi,
  loginApi,
  googleLoginApi,
  getMeApi,
  updateProfileApi
} from '../services/authService';

const AuthContext = createContext({
  user: null,
  token: null,
  isLoggedIn: false,
  loading: true,
  register: async () => { },
  login: async () => { },
  googleLogin: async () => { },
  updateProfile: async () => { },
  logout: () => { },
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('blogverse_token');
      const storedUser = localStorage.getItem('blogverse_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) { }
        }
        // Safely verify profile with backend without invalidating stored user session
        try {
          const res = await getMeApi(storedToken);
          if (res && res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('blogverse_user', JSON.stringify(res.user));
          }
        } catch (err) { }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const saveAuthSession = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('blogverse_token', authToken);
    localStorage.setItem('blogverse_user', JSON.stringify(userData));
  }; +

  const register = async (name, email, password) => {
    const res = await registerApi(name, email, password);
    if (res.success && res.token) {
      saveAuthSession(res.token, res.user);
    }
    return res;
  };

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    if (res.success && res.token) {
      saveAuthSession(res.token, res.user);
    }
    return res;
  };

  const googleLogin = async (googlePayload) => {
    const res = await googleLoginApi(googlePayload);
    if (res.success && res.token) {
      saveAuthSession(res.token, res.user);
    }
    return res;
  };

  const updateProfile = async (profileData) => {
    if (!token) return;
    const res = await updateProfileApi(token, profileData);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('blogverse_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('blogverse_token');
    localStorage.removeItem('blogverse_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!user,
      loading,
      register,
      login,
      googleLogin,
      updateProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
