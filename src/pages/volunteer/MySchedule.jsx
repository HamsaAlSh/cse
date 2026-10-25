import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { CalendarDays, Clock, Loader2, AlertCircle, User } from 'lucide-react';

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
        // بناءً على الـ Postman، المصفوفة موجودة داخل response.data.schedule
        setSchedule(response.data.schedule || []);
      } catch (err) {
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
        <p className="text-gray-500 text-sm mt-1">هنا تظهر جميع الجلسات التي تم قبولك فيها.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}

      {schedule.length === 0 && !error ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>ليس لديك أي جلسات في جدولك حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            // تصفية الجلسات حسب اليوم
            const daySessions = schedule.filter(s => s.day_of_week === day.id);
            
            return (
              <div key={day.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 min-h-[150px]">
                <h3 className="font-bold text-gray-800 text-center pb-3 border-b border-gray-200 mb-3 text-sm">{day.label}</h3>
                <div className="space-y-2">
                  {daySessions.length === 0 ? (
                    <p className="text-xs text-center text-gray-400 py-4">لا يوجد</p>
                  ) : (
                    daySessions.map((session, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-brand-100 shadow-sm">
                        <p className="font-bold text-brand-700 text-sm leading-tight">{session.activity?.title}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 bg-gray-100 p-1.5 rounded-md w-fit" dir="ltr">
                          <Clock className="w-3 h-3" /> {session.time_slot}
                        </div>
                        {session.supervisor && (
                          <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-500 border-t border-gray-100 pt-2">
                            <User className="w-3 h-3 shrink-0" /> 
                            <span className="leading-tight">{session.supervisor.name}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}