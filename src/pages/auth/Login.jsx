import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// تأكد من استيراد صورتك من مجلد assets
import loginBgImage from '../../assets/login-bg.jpg'; 

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const { user } = result;
        if (user.must_change_password === 1) navigate('/change-password');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'supervisor') navigate('/supervisor/dashboard');
        else navigate('/volunteer/dashboard');
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface font-sans" dir="rtl">
      
      {/* ========== القسم الأيمن: الفورم (تسجيل الدخول) ========== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500">الرجاء إدخال بياناتك للمتابعة إلى حسابك</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-left shadow-sm"
                  dir="ltr"
                  placeholder="example@email.com"
                />
                <Mail className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-left shadow-sm"
                  dir="ltr"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-brand-500 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* زر الدخول مع حركة (Hover) */}
            <button type="submit" disabled={isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 flex items-center justify-center gap-2 disabled:opacity-70 mt-8 group">
              {isLoading ? 'جاري الدخول...' : (
                <>
                  <span>دخول</span>
                  {/* أيقونة السهم تتحرك قليلاً لليسار عند مرور الماوس */}
                  <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* ========== القسم الأيسر: صورة البراندنج (على اليسار في RTL) ========== */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        {/* الصورة تأخذ كامل المساحة بدون حواف */}
        <img 
          src={loginBgImage} 
          alt="Volunteer Background" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* طبقة شفافة خفيفة جداً فوق الصورة فقط لزيادة وضوح النص إذا لزم */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* النصوص فوق الصورة */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12">
          <div className="relative mb-6">
            <svg className="w-16 h-16 text-brand-500 animate-pulse drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight drop-shadow-md">
            مرحباً بك في منصة<br/>إدارة المتطوعين
          </h1>
          <p className="text-white/90 text-lg drop-shadow-md">
            معاً نصنع فرقاً .. لنبني مجتمعاً أكثر وعياً وتفاعلاً
          </p>
        </div>
      </div>

    </div>
  );
}