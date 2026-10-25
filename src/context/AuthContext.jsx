import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

// 1. إنشاء الـ Context
const AuthContext = createContext();

// 2. مزود الحالة (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [isLoading, setIsLoading] = useState(false);

  // جلب بيانات المستخدم إذا كان التوكن موجوداً عند فتح التطبيق
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axiosClient.get('/user');
          setUser(response.data.user);
        } catch (error) {
          // إذا كان التوكن غير صالح، قم بتسجيل الخروج
          logout();
        }
      }
    };
    fetchUser();
  }, [token]);

  // دالة تسجيل الدخول (مربوطة بـ axios)
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

  // دالة تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  // دالة تحديث بيانات المستخدم
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
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook لاستخدام الـ Context بسهولة
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};