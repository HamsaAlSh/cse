import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Clock, Award, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

export default function VolunteerHours() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // جلب بيانات المستخدم (التي تحتوي على volunteer_stats)
        const response = await axiosClient.get('/user');
        setStats(response.data.user);
      } catch (err) {
        setError('فشل جلب إحصائيات الساعات.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>;

  const totalHours = stats?.total_hours || 0;
  const targetHours = stats?.target_hours || 35;
  const completionPercentage = stats?.completion_percentage || 0;
  const remainingHours = targetHours - totalHours;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ساعات التطوع</h1>
        <p className="text-gray-500 text-sm mt-1">إليك ملخص شامل لساعاتك وإنجازاتك.</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">الساعات المكتسبة</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalHours} <span className="text-sm font-normal text-gray-500">ساعة</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">الهدف المطلوب</p>
            <h3 className="text-2xl font-bold text-gray-800">{targetHours} <span className="text-sm font-normal text-gray-500">ساعة</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-gray-500 text-sm">نسبة الإنجاز</p>
            <h3 className="text-2xl font-bold text-gray-800">{completionPercentage}%</h3>
          </div>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">تقدمك نحو الهدف</h3>
          <span className="text-sm text-gray-500">{totalHours} من {targetHours} ساعة</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div 
            className="bg-brand-500 h-4 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-3 text-center">
          {remainingHours > 0 ? `متبقي لك ${remainingHours} ساعة للوصول إلى الهدف.` : '🎉 مبروك! لقد حققت هدفك.'}
        </p>
      </div>
    </div>
  );
}