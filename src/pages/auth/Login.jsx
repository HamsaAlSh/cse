import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, 
  HeartHandshake // أيقونة التطوع والتعاون
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
        const user = result.user;
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface font-sans" dir="rtl">
      
      {/* ========== القسم الأيسر: الأنيميشن (ألوان بنية وبرتقالية) ========== */}
      {/* غيرنا التدرج اللوني ليكون بني -> برتقالي ترابي */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#3d0b17] via-[#8b4513] to-[#d97706] p-8 min-h-[350px] lg:min-h-screen">
        
        {/* دوائر خلفية متحركة بلون برتقالي شفاف */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#d97706]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* المحتوى */}
        <div className="relative z-10 text-center">
          
          {/* الأيقونة الجديدة (الأيدي المتعاونة) */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <HeartHandshake className="w-24 h-24 text-white drop-shadow-2xl animate-pulse" strokeWidth={1.5} />
              <div className="absolute inset-0 w-24 h-24 border-2 border-white rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* النص الرئيسي */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-wide drop-shadow-lg">
            <span className="block animate-[fadeInUp_1s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.2s' }}>
              CSE
            </span>
            <span className="block text-2xl lg:text-4xl text-orange-200 mt-2 animate-[fadeInUp_1s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.6s' }}>
              Little Syria Volunteers
            </span>
          </h1>

          <p className="text-orange-100/90 text-lg lg:text-xl max-w-md mx-auto mt-6 animate-[fadeInUp_1s_ease-out_forwards] opacity-0" style={{ animationDelay: '1s' }}>
            معاً نصنع فرقاً .. لنبني مجتمعاً أكثر وعياً وتفاعلاً
          </p>
        </div>
      </div>

      {/* ========== القسم الأيمن: الفورم ========== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500">الرجاء إدخال بياناتك للمتابعة</p>
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
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition-all text-left shadow-sm"
                  dir="ltr"
                  placeholder="admin@gmail.com"
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
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition-all text-left shadow-sm"
                  dir="ltr"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-[#d97706] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-[#8b4513] hover:bg-[#a0522d] active:scale-[0.98] text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[#8b4513]/30 hover:shadow-[#8b4513]/50 flex items-center justify-center gap-2 disabled:opacity-70 mt-8 group">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>دخول</span>
                  <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}