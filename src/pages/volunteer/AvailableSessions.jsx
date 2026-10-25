import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  CalendarDays, Clock, Loader2, AlertCircle, CheckCircle2, 
  User, X, FileText, UserPlus, UserCheck, Phone, Hourglass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DAYS_OF_WEEK = [
  { id: 'Sunday', label: 'الأحد' }, { id: 'Monday', label: 'الإثنين' },
  { id: 'Tuesday', label: 'الثلاثاء' }, { id: 'Wednesday', label: 'الأربعاء' },
  { id: 'Thursday', label: 'الخميس' }, { id: 'Friday', label: 'الجمعة' },
  { id: 'Saturday', label: 'السبت' },
];

export default function AvailableSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedSession, setSelectedSession] = useState(null);
  
  // قائمة المتقدمين (للمشرف)
  const [applicants, setApplicants] = useState([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  // جلب الجلسات
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

  useEffect(() => {
    fetchSessions();
  }, []);

  // جلب المتقدمين (للمشرف)
  const fetchApplicants = async (sessionId) => {
    setIsLoadingApplicants(true);
    try {
      const response = await axiosClient.get(`/supervisor/sessions/${sessionId}/applicants`);
      setApplicants(response.data.volunteers || []);
    } catch (err) {
      console.error("فشل جلب المتقدمين", err);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleOpenSession = async (session) => {
    setSelectedSession(session);
    setApplicants([]);
    setError('');
    setSuccessMessage('');

    if (session.supervisor_id === user.id) {
      await fetchApplicants(session.id);
    }
  };

  // دالة تقديم الطلب (للمتطوع)
  const handleApply = async (sessionId) => {
    setApplyingId(sessionId);
    setError('');
    setSuccessMessage('');
    try {
      await axiosClient.post(`/volunteer/sessions/${sessionId}/apply`);
      setSuccessMessage('تم تقديم طلبك بنجاح! بانتظار موافقة المشرف.');
      
      // إعادة جلب الجلسات لتحديث الحالة إلى pending
      await fetchSessions();
      
      const updatedSession = sessions.find(s => s.id === sessionId);
      if (updatedSession) setSelectedSession(updatedSession);

    } catch (err) {
      setError(err.response?.data?.message || 'فشل تقديم الطلب.');
    } finally {
      setApplyingId(null);
    }
  };

  // دالة قبول المتطوع (للمشرف)
  const handleAssign = async (volunteerId) => {
    setAssigningId(volunteerId);
    setError('');
    setSuccessMessage('');
    try {
      // إرسال طلب القبول باستخدام الـ API الموجود في Postman
      await axiosClient.post(`/sessions/${selectedSession.id}/assign-volunteers`, {
        volunteer_ids: [volunteerId]
      });
      
      setSuccessMessage('تم قبول المتطوع بنجاح!');
      
      // إعادة جلب قائمة المتقدمين من الباك إند لتحديث القائمة
      await fetchApplicants(selectedSession.id); 
      
    } catch (err) {
      setError(err.response?.data?.message || 'فشل قبول المتطوع.');
    } finally {
      setAssigningId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">الجلسات المتاحة</h1>
        <p className="text-gray-500 text-sm mt-1">تصفح البرنامج الأسبوعي، وقدم طلباً للانضمام، أو قم بإدارة المتقدمين (إذا كنت مشرفاً).</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}
      {successMessage && <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{successMessage}</div>}

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
                  daySessions.map((session) => {
                    // حالة الطلب من الباك إند (pivot.status)
                    const status = session.pivot?.status;
                    
                    return (
                      <div 
                        key={session.id} 
                        onClick={() => handleOpenSession(session)}
                        className="bg-white p-3 rounded-lg border border-brand-100 shadow-sm cursor-pointer hover:shadow-md hover:border-brand-300 transition-all group relative overflow-hidden"
                      >
                        {/* شارة الحالة */}
                        {status === 'pending' && (
                          <div className="absolute top-0 left-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
                            قيد الانتظار
                          </div>
                        )}
                        {status === 'assigned' && (
                          <div className="absolute top-0 left-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
                            مقبول
                          </div>
                        )}

                        <p className="font-semibold text-brand-700 text-sm truncate mt-1">{session.activity?.title}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 bg-gray-100 p-1 rounded w-fit" dir="ltr">
                          <Clock className="w-3 h-3" /> {session.time_slot}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* النافذة المنبثقة */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedSession(null)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedSession.activity?.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {DAYS_OF_WEEK.find(d => d.id === selectedSession.day_of_week)?.label} | {selectedSession.time_slot}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">الوصف</h4>
                  <p className="text-sm text-gray-600">{selectedSession.activity?.description || 'لا يوجد وصف.'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">المشرف</h4>
                  <p className="text-sm text-gray-600">{selectedSession.supervisor?.name || 'لم يتم تعيين مشرف بعد.'}</p>
                </div>
              </div>
            </div>

            {/* واجهة المتطوع */}
            {selectedSession.supervisor_id !== user.id && (
              <div className="mt-4">
                {selectedSession.pivot?.status === 'pending' ? (
                  <div className="bg-amber-50 text-amber-700 border border-amber-200 p-4 rounded-xl flex items-center justify-center gap-2 font-medium">
                    <Hourglass className="w-5 h-5 animate-pulse" />
                    طلبك قيد الانتظار. بانتظار موافقة المشرف.
                  </div>
                ) : selectedSession.pivot?.status === 'assigned' ? (
                  <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center justify-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    تم قبولك في هذه الجلسة!
                  </div>
                ) : (
                  <button 
                    onClick={() => handleApply(selectedSession.id)} 
                    disabled={applyingId === selectedSession.id}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {applyingId === selectedSession.id ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <><UserPlus className="w-5 h-5" /> تقديم طلب للانضمام</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* واجهة المشرف */}
            {selectedSession.supervisor_id === user.id && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-500" /> المتقدمون للجلسة
                </h4>
                {isLoadingApplicants ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
                ) : applicants.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">لا يوجد متطوعون متقدمون حالياً.</p>
                ) : (
                  <div className="space-y-2">
                    {applicants.map((vol) => (
                      <div key={vol.id} className="flex flex-col p-3 bg-gray-50 rounded-lg gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold">{vol.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{vol.name}</p>
                              <p className="text-xs text-gray-500" dir="ltr">{vol.phone || 'رقم غير متوفر'}</p>
                            </div>
                          </div>
                          
                          {/* زر القبول (يظهر فقط إذا كانت الحالة pending) */}
                          {vol.pivot?.status === 'pending' ? (
                            <button 
                              onClick={() => handleAssign(vol.id)} 
                              disabled={assigningId === vol.id}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 px-4 rounded-md disabled:opacity-50"
                            >
                              {assigningId === vol.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'قبول'}
                            </button>
                          ) : (
                            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">مقبول</span>
                          )}
                        </div>
                        {/* عرض ساعات المتطوع */}
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>الساعات: {vol.total_hours || 0}</span>
                          {vol.pivot?.status && <span>الحالة: {vol.pivot.status === 'pending' ? 'قيد الانتظار' : 'مقبول'}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}