import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axiosClient.get('/auth/me');
        if (res.data.status === 'success') {
          setUser(res.data.user);
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username, password) => {
    const res = await axiosClient.post('/auth/login', { username, password });
    if (res.data.status === 'success') {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, fetchUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
