import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  // 1. جلب بيانات المستخدم من الـ Context
  const { user } = useAuth();

  // 2. إذا لم يكن هناك مستخدم مسجل دخول -> توجيه لصفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. إذا كان المستخدم مجبراً على تغيير كلمة المرور -> توجيه لصفحة تغيير كلمة المرور
  // (نستثني صفحة التغيير نفسها لتجنب حلقة لا نهائية)
  if (user.must_change_password === 1 && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // 4. إذا كان دور المستخدم غير مسموح له بالدخول لهذه الصفحة -> توجيه لصفحة "غير مصرح"
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; 
  }

  // 5. كل شيء سليم -> عرض الصفحة المطلوبة (من خلال Outlet)
  return <Outlet />;
};