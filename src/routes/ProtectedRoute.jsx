import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. إذا لم يكن هناك مستخدم مسجل دخول -> صفحة الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. إذا كان المستخدم مجبراً على تغيير كلمة المرور -> صفحة التغيير
  // (نستثني صفحة التغيير نفسها لتجنب حلقة لا نهائية)
  if (user.must_change_password === 1 && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // 3. إذا كان دور المستخدم غير مسموح له بالدخول -> صفحة غير مصرح
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; 
  }

  // 4. كل شيء سليم -> عرض الصفحة
  return <Outlet />;
};