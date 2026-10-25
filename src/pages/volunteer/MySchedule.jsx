import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { CalendarDays, Clock, Loader2, AlertCircle, User, CheckCircle2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'Sunday', label: 'الأحد' }, { id: 'Monday', label: 'الإثنين' },
  { id: 'Tuesday', label: 'الثلاثاء' }, { id: 'Wednesday', label: 'الأربعاء' },
  { id: 'Thursday', label: 'الخميس' }, { id: 'Friday', label: 'الجمعة' },
  { id: 'Saturday', label: 'السبت' },
];

export default function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // جلب الجدول من الباك إند
        const response = await axiosClient.get('/volunteer/schedule');
        
        // بناءً على صورة Postman، المصفوفة موجودة داخل response.data.schedule
        setSchedule(response.data.schedule || []);
      } catch (err) {
        console.error("خطأ في جلب الجدول:", err);
        setError('فشل جلب جدولك الأسبوعي.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (isLoading) return <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">جدولي الأسبوعي</h1>
        <p className="text-gray-500 text-sm mt-1">هنا تظهر جميع الأنشطة التي قمت بالانضمام إليها.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}

      {schedule.length === 0 && !error ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>ليس لديك أي أنشطة في جدولك حالياً. تصفح "الجلسات المتاحة" وانضم إلى نشاط.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            // تصفية الأنشطة حسب اليوم (لأن الباك إند يعيد البيانات كأنشطة وليس جلسات)
            // ملاحظة: إذا كان الباك إند يعيد day_of_week داخل النشاط، نستخدمه. وإلا سنعرضها كلها في عمود واحد.
            // هنا نفترض أن الباك إند يعيد day_of_week، إذا لم يكن كذلك، سنعرضها في عمود "الأحد" كحل مبدئي.
            
            // للحل: سنقوم بعرض جميع الأنشطة في عمود "جدولي" إذا لم يكن هناك يوم محدد.
            // لكن بما أن الباك إند لا يعيد day_of_week في الـ schedule، سنعرضها كقائمة واحدة.
            
            // سأقوم بعرضها كقائمة (وليس جدول أسبوعي) لأن الباك إند لا يوفر day_of_week في هذا الـ API.
            return null; // سنستخدم طريقة عرض مختلفة
          })}
          
          {/* عرض الأنشطة كقائمة (لأن الباك إند لا يوفر day_of_week في /schedule) */}
          <div className="col-span-1 md:col-span-7 space-y-4">
            {schedule.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    {item.pivot && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                          item.pivot.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          item.pivot.status === 'approved' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {item.pivot.status === 'pending' ? 'قيد الانتظار' : 
                           item.pivot.status === 'approved' ? 'تم القبول' : 'مرفوض'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-brand-500" />
                    <span>في جدولك</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}