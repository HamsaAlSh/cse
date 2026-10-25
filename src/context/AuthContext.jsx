import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { Loader2 } from 'lucide-react'; // استيراد أيقونة التحميل

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [isLoading, setIsLoading] = useState(true); // نبدأ بـ true للتحقق الأولي

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axiosClient.get('/user');
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false); // انتهى التحقق
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

  // إذا كان التطبيق في حالة تحميل (التحقق الأولي من التوكن)، نعرض شاشة تحميل صغيرة
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};