import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500 mb-8">عذراً، لا تملك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
        <Link to="/" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-8 rounded-xl transition-all">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}