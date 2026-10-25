import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, Award } from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();

  // إحصائيات المتطوع (تأتي من الباك إند عبر user.volunteer_stats)
  const stats = user?.volunteer_stats || {
    total_hours: 0,
    target_hours: 35,
    completion_percentage: 0,
    remaining_hours: 35,
  };

  return (
    <div className="space-y-6">
      {/* الترحيب */}
      <div className="bg-gradient-to-l from-brand-900 to-brand-600 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
        <h1 className="text-xl lg:text-2xl font-bold mb-2">مرحباً بك، {user?.name} 👋</h1>
        <p className="text-brand-100 opacity-90 text-sm lg:text-base">لنصنع فرقاً معاً. إليك ملخص نشاطك التطوعي.</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">الساعات المكتسبة</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total_hours} <span className="text-sm font-normal text-gray-500">ساعة</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">الساعات المستهدفة</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.target_hours} <span className="text-sm font-normal text-gray-500">ساعة</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CalendarDays className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">نسبة الإنجاز</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.completion_percentage}%</h3>
          </div>
        </div>
      </div>

      {/* شريط تقدم */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-800">تقدمك نحو الهدف</h3>
          <span className="text-sm text-gray-500">{stats.total_hours} من {stats.target_hours} ساعة</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div 
            className="bg-brand-500 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${stats.completion_percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">متبقي لك {stats.remaining_hours} ساعة للوصول إلى الهدف.</p>
      </div>
    </div>
  );
}