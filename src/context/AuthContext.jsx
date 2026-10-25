import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [isLoading, setIsLoading] = useState(true); // نبدأ بـ true حتى يتم التحقق

  // جلب بيانات المستخدم إذا كان التوكن موجوداً (عند فتح الصفحة أو الريفريش)
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axiosClient.get('/user');
          setUser(response.data.user);
        } catch (error) {
          // إذا كان التوكن غير صالح، قم بتسجيل الخروج
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false); // انتهينا من التحقق
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post('/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      throw error.response?.data?.message || 'حدث خطأ في تسجيل الدخول';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const response = await axiosClient.get('/user');
      setUser(response.data.user);
    } catch (error) {
      console.error('فشل جلب بيانات المستخدم', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, fetchUser }}>
      {!isLoading && children} {/* لا تعرض التطبيق حتى ينتهي التحقق */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};