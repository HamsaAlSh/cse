import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarDays, Clock, ClipboardList, 
  UserCheck, X, Lock, Eye, EyeOff, Loader2, Mail, Phone, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  
  // حالة النافذة المنبثقة
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // لحفظ بيانات المستخدم القادمة من الـ API
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  
  // حالة تغيير كلمة المرور
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const menuItems = {
    admin: [
      { title: 'لوحة التحكم', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { title: 'إدارة المتطوعين', path: '/admin/volunteers', icon: <Users className="w-5 h-5" /> },
      { title: 'إدارة الأنشطة', path: '/admin/activities', icon: <CalendarDays className="w-5 h-5" /> },
    ],
    supervisor: [
      { title: 'لوحة الإشراف', path: '/supervisor/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { title: 'طلبات المتطوعين', path: '/supervisor/applicants', icon: <UserCheck className="w-5 h-5" /> },
      { title: 'جدولي الأسبوعي', path: '/supervisor/schedule', icon: <Clock className="w-5 h-5" /> },
    ],
    volunteer: [
      { title: 'لوحتي', path: '/volunteer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { title: 'الجلسات المتاحة', path: '/volunteer/sessions', icon: <CalendarDays className="w-5 h-5" /> },
      { title: 'جدولي', path: '/volunteer/my-schedule', icon: <Clock className="w-5 h-5" /> },
      { title: 'ساعات التطوع', path: '/volunteer/hours', icon: <ClipboardList className="w-5 h-5" /> },
    ],
  };

  const currentMenu = menuItems[user?.role] || [];

  // دالة فتح النافذة وجلب بيانات المستخدم من الـ API
  const handleOpenProfile = async () => {
    setIsProfileModalOpen(true);
    setIsFetchingUser(true);
    setPasswordMessage({ type: '', text: '' });
    setPasswords({ current: '', new: '', confirm: '' });

    try {
      // استدعاء API بناءً على الصورة
      const response = await axiosClient.get('/user');
      setUserInfo(response.data.user); // البيانات موجودة داخل response.data.user
    } catch (error) {
      console.error("فشل جلب بيانات المستخدم", error);
      setUserInfo(user); // إذا فشل، نستخدم البيانات المخزنة كاحتياط
    } finally {
      setIsFetchingUser(false);
    }
  };

  // دالة تغيير كلمة المرور
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwords.new !== passwords.confirm) {
      return setPasswordMessage({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
    }

    setIsChangingPassword(true);
    try {
      await axiosClient.post('/change-password', {
        current_password: passwords.current,
        new_password: passwords.new,
        new_password_confirmation: passwords.confirm,
      });
      
      setPasswordMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح!' });
      setPasswords({ current: '', new: '', confirm: '' });
      
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 2000);

    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'فشل تغيير كلمة المرور.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      {/* خلفية سوداء شفافة للموبايل */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* الشريط الجانبي */}
      <aside 
        className={`fixed top-0 right-0 h-screen w-72 bg-white border-l border-gray-200 z-50 flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* الشعار */}
        <div className="h-20 flex items-center justify-between border-b border-gray-100 px-6">
          <h1 className="text-2xl font-bold text-brand-900">CSE Unit</h1>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* قائمة التبويبات */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {currentMenu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => { if(window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* قسم معلومات المستخدم - قابل للضغط */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleOpenProfile}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors text-right"
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="text-sm overflow-hidden">
              <p className="font-bold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'مدير النظام' : user?.role === 'supervisor' ? 'مشرف' : 'متطوع'}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* ================= نافذة الملف الشخصي وتغيير كلمة المرور ================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsProfileModalOpen(false)} 
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {isFetchingUser ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : (
              <>
                {/* معلومات المستخدم */}
                <div className="text-center mb-6 border-b border-gray-100 pb-4">
                  <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                    {userInfo?.name?.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{userInfo?.name}</h3>
                  
                  {/* عرض معلومات إضافية من الـ API */}
                  <div className="mt-3 space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl text-right">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-500" /> {userInfo?.email}</p>
                    {userInfo?.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-500" /> <span dir="ltr">{userInfo.phone}</span></p>}
                    <p className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-500" /> 
                      الدور: <span className="font-bold text-brand-700">
                        {userInfo?.role === 'admin' ? 'مدير النظام' : userInfo?.role === 'supervisor' ? 'مشرف' : 'متطوع'}
                      </span>
                    </p>
                    {userInfo?.preferred_help && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        <strong>المساعدة المفضلة:</strong> {userInfo.preferred_help}
                      </p>
                    )}
                  </div>
                </div>

                {/* نموذج تغيير كلمة المرور */}
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-500" /> تغيير كلمة المرور
                </h4>

                {passwordMessage.text && (
                  <div className={`p-3 rounded-lg mb-4 text-xs ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    placeholder="كلمة المرور الحالية" 
                    required 
                    value={passwords.current} 
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-left" 
                    dir="ltr"
                  />
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    placeholder="كلمة المرور الجديدة" 
                    required 
                    value={passwords.new} 
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-left" 
                    dir="ltr"
                  />
                  <div className="relative">
                    <input 
                      type={showPasswords ? "text" : "password"} 
                      placeholder="تأكيد كلمة المرور الجديدة" 
                      required 
                      value={passwords.confirm} 
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-left" 
                      dir="ltr"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
                  >
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ كلمة المرور'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}