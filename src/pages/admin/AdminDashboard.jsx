import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Users, Loader2, Clock, TrendingUp, Award } from 'lucide-react';

export default function AdminDashboard() {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axiosClient.get('/admin/volunteers/all');
        setVolunteers(response.data.volunteers || []);
      } catch (error) {
        console.error("فشل جلب المتطوعين", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  // ترتيب جميع المتطوعين تنازلياً حسب الساعات
  const sortedVolunteers = [...volunteers].sort((a, b) => (b.total_hours || 0) - (a.total_hours || 0));
  
  // 1. تحديد سقف الرسم البياني (50 ساعة كحد أقصى)
  const MAX_HOURS_CHART = 50;
  
  // حساب إجمالي الساعات لجميع المتطوعين
  const totalHours = volunteers.reduce((sum, vol) => sum + (vol.total_hours || 0), 0);

  return (
    <div className="space-y-6">
      {/* الترحيب */}
      <div className="bg-gradient-to-l from-brand-900 to-brand-600 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
        <h1 className="text-xl lg:text-2xl font-bold mb-2">مرحباً مدير النظام 👋</h1>
        <p className="text-brand-100 opacity-90 text-sm lg:text-base">إليك نظرة سريعة على أداء جميع المتطوعين.</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">إجمالي المتطوعين</p>
            <h3 className="text-2xl font-bold text-gray-800">{volunteers.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">إجمالي ساعات التطوع</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalHours} <span className="text-sm font-normal text-gray-500">ساعة</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">متوسط الساعات للمتطوع</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {volunteers.length > 0 ? Math.round(totalHours / volunteers.length) : 0} 
              <span className="text-sm font-normal text-gray-500"> ساعة</span>
            </h3>
          </div>
        </div>
      </div>

      {/* الخط البياني */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-500" />
          ساعات التطوع لجميع المتطوعين (الهدف: 35 ساعة)
        </h3>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex items-end h-[300px] gap-3 min-w-max px-2">
            {sortedVolunteers.map((vol, index) => {
              // 2. حساب الارتفاع بناءً على سقف الـ 50 ساعة
              const heightPercentage = Math.min(((vol.total_hours || 0) / MAX_HOURS_CHART) * 100, 100);
              const barHeight = `${(heightPercentage / 100) * 220}px`;

              // 3. الشرط: إذا كانت الساعات 35 أو أكثر، يتغير اللون للأخضر
              const isGoalReached = (vol.total_hours || 0) >= 35;

              return (
                <div key={index} className="flex flex-col items-center w-16 shrink-0 group relative justify-end">
                  
                  {/* القيمة فوق العمود */}
                  <span className={`text-xs font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-white px-2 py-1 rounded shadow-md z-10 whitespace-nowrap ${isGoalReached ? 'text-green-600' : 'text-brand-700'}`}>
                    {vol.total_hours || 0} ساعة
                  </span>
                  
                  {/* العمود - نغير ألوانه حسب الشرط */}
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-300 shadow-sm ${
                      isGoalReached 
                        ? 'bg-gradient-to-t from-green-600 to-green-400 hover:from-green-500 hover:to-green-300' // لون أخضر
                        : 'bg-gradient-to-t from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300' // اللون العنابي الافتراضي
                    }`}
                    style={{ height: barHeight, minHeight: '4px' }} 
                  ></div>
                  
                  {/* اسم المتطوع */}
                  <span className={`text-[10px] mt-2 truncate w-full text-center font-medium ${isGoalReached ? 'text-green-700' : 'text-gray-600'}`} title={vol.name}>
                    {vol.name.split(' ')[0]} {/* عرض الاسم الأول فقط لعدم التزاحم */}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* وسيلة إيضاح (Legend) */}
        <div className="flex items-center justify-center gap-6 mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500"></div>
            <span className="text-xs text-gray-600">أقل من 35 ساعة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">35 ساعة فما فوق (تم تحقيق الهدف)</span>
          </div>
        </div>

      </div>
    </div>
  );
}