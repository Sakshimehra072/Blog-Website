'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  sendOtpApi, 
  verifyOtpApi, 
  registerApi, 
  loginApi, 
  googleLoginApi, 
  getMeApi 
} from '../services/authService';

const AuthContext = createContext({
  user: null,
  token: null,
  isLoggedIn: false,
  loading: true,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  register: async () => {},
  login: async () => {},
  googleLogin: async () => {},
  logout: () => {},
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
          } catch (e) {}
        }
        // Verify token with backend
        try {
          const res = await getMeApi(storedToken);
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('blogverse_user', JSON.stringify(res.user));
          }
        } catch (err) {
          // Token expired
          logout();
        }
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
  };

  const sendOtp = async (phone_number) => {
    return await sendOtpApi(phone_number);
  };

  const verifyOtp = async (phone_number, otp_code) => {
    const res = await verifyOtpApi(phone_number, otp_code);
    if (res.success && res.token) {
      saveAuthSession(res.token, res.user);
    }
    return res;
  };

  const register = async (username, phone_number, password) => {
    const res = await registerApi(username, phone_number, password);
    if (res.success && res.token) {
      saveAuthSession(res.token, res.user);
    }
    return res;
  };

  const login = async (phone_number, password) => {
    const res = await loginApi(phone_number, password);
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
      sendOtp,
      verifyOtp,
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
