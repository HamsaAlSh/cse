import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react'; // تم حذف أيقونة البحث (Search)

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'لوحة التحكم';
    if (path.includes('volunteers')) return 'إدارة المتطوعين';
    if (path.includes('activities')) return 'إدارة الأنشطة';
    if (path.includes('sessions')) return 'الجلسات';
    if (path.includes('applicants')) return 'طلبات المتطوعين';
    if (path.includes('schedule')) return 'الجدول الأسبوعي';
    return 'الرئيسية';
  };

  return (
    <div className="min-h-screen bg-surface font-sans" dir="rtl">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="lg:mr-64 min-h-screen flex flex-col transition-all duration-300">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          
          {/* الجانب الأيمن من الهيدر (زر القائمة + عنوان الصفحة) */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-bold text-gray-800">{getPageTitle()}</h2>
          </div>

          {/* الجانب الأيسر من الهيدر (بيانات المستخدم فقط) */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'مدير النظام' : user?.role === 'supervisor' ? 'مشرف' : 'متطوع'}</p>
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm lg:text-lg">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}