import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  CalendarDays, Clock, Loader2, AlertCircle, CheckCircle2, 
  User, X, FileText, UserPlus 
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'Sunday', label: 'الأحد' }, { id: 'Monday', label: 'الإثنين' },
  { id: 'Tuesday', label: 'الثلاثاء' }, { id: 'Wednesday', label: 'الأربعاء' },
  { id: 'Thursday', label: 'الخميس' }, { id: 'Friday', label: 'الجمعة' },
  { id: 'Saturday', label: 'السبت' },
];

export default function AvailableSessions() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // حالة النافذة المنبثقة (Modal)
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axiosClient.get('/volunteer/sessions');
        setSessions(response.data.sessions || []);
      } catch (err) {
        setError('فشل جلب الجلسات المتاحة.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleApply = async (sessionId) => {
    setApplyingId(sessionId);
    setError('');
    setSuccessMessage('');
    try {
      await axiosClient.post(`/volunteer/sessions/${sessionId}/apply`);
      setSuccessMessage('تم تقديم طلبك بنجاح! بانتظار موافقة المشرف.');
      setTimeout(() => setSelectedSession(null), 2000); // إغلاق النافذة بعد النجاح
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تقديم الطلب.');
    } finally {
      setApplyingId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">الجلسات المتاحة</h1>
        <p className="text-gray-500 text-sm mt-1">تصفح البرنامج الأسبوعي واضغط على أي جلسة لرؤية التفاصيل.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}
      {successMessage && <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{successMessage}</div>}

      {/* الجدول الأسبوعي */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const daySessions = sessions.filter(s => s.day_of_week === day.id);
          return (
            <div key={day.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 min-h-[150px]">
              <h3 className="font-bold text-gray-800 text-center pb-3 border-b border-gray-200 mb-3 text-sm">{day.label}</h3>
              <div className="space-y-2">
                {daySessions.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-4">لا يوجد</p>
                ) : (
                  daySessions.map((session) => (
                    <div 
                      key={session.id} 
                      onClick={() => setSelectedSession(session)} // فتح النافذة عند الضغط
                      className="bg-white p-3 rounded-lg border border-brand-100 shadow-sm cursor-pointer hover:shadow-md hover:border-brand-300 transition-all group"
                    >
                      <p className="font-semibold text-brand-700 text-sm truncate">{session.activity?.title}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 bg-gray-100 p-1 rounded w-fit" dir="ltr">
                        <Clock className="w-3 h-3" /> {session.time_slot}
                      </div>
                      <div className="mt-2 text-xs text-brand-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        عرض التفاصيل &larr;
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= النافذة المنبثقة (Modal) ================= */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedSession(null)} 
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* رأس النافذة */}
            <div className="text-center mb-6 border-b border-gray-100 pb-4">
              <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{selectedSession.activity?.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{DAYS_OF_WEEK.find(d => d.id === selectedSession.day_of_week)?.label} | {selectedSession.time_slot}</p>
            </div>

            {/* تفاصيل النشاط */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">الوصف</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedSession.activity?.description || 'لا يوجد وصف.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">المشرف</h4>
                  <p className="text-sm text-gray-600">
                    {selectedSession.supervisor?.name || 'لم يتم تعيين مشرف بعد.'}
                  </p>
                  {selectedSession.supervisor?.phone && (
                    <p className="text-xs text-gray-500 mt-1" dir="ltr">{selectedSession.supervisor.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* رسائل الخطأ والنجاح داخل النافذة */}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mt-4 text-sm">{error}</div>}
            {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-lg mt-4 text-sm">{successMessage}</div>}

            {/* زر التقديم */}
            <div className="mt-8">
              <button 
                onClick={() => handleApply(selectedSession.id)} 
                disabled={applyingId === selectedSession.id}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {applyingId === selectedSession.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <><UserPlus className="w-5 h-5" /> تقديم طلب للانضمام</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}