import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // التحقق من التوكن وجلب بيانات المستخدم عند فتح التطبيق أو عمل Refresh
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
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  // دالة تسجيل الدخول
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post('/login', { email, password });
      
      // للتوضيح: طباعة الرد القادم من الباك إند في الـ Console
      console.log("الرد من الباك إند (Login Response):", response.data);

      // استخراج البيانات (تأكد من أسماء الحقول حسب الباك إند)
      const { access_token, user } = response.data;
      
      // التحقق من وجود التوكن والمستخدم
      if (!access_token || !user) {
        throw new Error('الرد من السيرفر لا يحتوي على توكن أو بيانات مستخدم.');
      }

      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      // طباعة الخطأ في الـ Console لمعرفة السبب
      console.error("خطأ في تسجيل الدخول:", error.response?.data || error.message);
      throw error.response?.data?.message || error.message || 'حدث خطأ في تسجيل الدخول';
    } finally {
      setIsLoading(false);
    }
  };

  // دالة تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login'; // إعادة توجيه إجبارية
  };

  // دالة جلب بيانات المستخدم (نحتاجها بعد تغيير كلمة المرور)
  const fetchUser = async () => {
    try {
      const response = await axiosClient.get('/user');
      setUser(response.data.user);
    } catch (error) {
      console.error('فشل جلب بيانات المستخدم', error);
    }
  };

  // عرض شاشة تحميل أثناء التحقق الأولي من التوكن
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