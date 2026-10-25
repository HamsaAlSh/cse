import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // حالة إظهار/إخفاء كلمة المرور
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, fetchUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
    }

    setIsLoading(true);
    try {
      await axiosClient.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      await fetchUser();
      
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'supervisor') navigate('/supervisor/dashboard');
      else navigate('/volunteer/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">تغيير كلمة المرور</h2>
          <p className="text-gray-500 text-sm mt-2">لأسباب أمنية، يجب عليك تغيير كلمة المرور قبل المتابعة.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* كلمة المرور الحالية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"} 
                required 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-left" 
                dir="ltr"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* كلمة المرور الجديدة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"} 
                required 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-left" 
                dir="ltr"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* تأكيد كلمة المرور الجديدة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"} 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-left" 
                dir="ltr"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-70 mt-6">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><span>حفظ التغييرات</span><ArrowLeft className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <button onClick={logout} className="w-full text-center text-gray-500 text-sm mt-6 hover:text-gray-800 transition-colors">
          العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );
}