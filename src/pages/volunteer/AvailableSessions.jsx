import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  CalendarDays, Clock, Loader2, AlertCircle, CheckCircle2, 
  User, X, FileText, UserPlus, UserCheck 
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
  const [applicants, setApplicants] = useState([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

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

  // دالة جلب المتقدمين (مفصولة حتى نستطيع إعادة استدعائها بعد القبول)
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
      await fetchApplicants(session.id); // جلب المتقدمين
    }
  };

  const handleApply = async (sessionId) => {
    setApplyingId(sessionId);
    setError('');
    setSuccessMessage('');
    try {
      await axiosClient.post(`/volunteer/sessions/${sessionId}/apply`);
      setSuccessMessage('تم تقديم طلبك بنجاح! بانتظار موافقة المشرف.');
      setTimeout(() => setSelectedSession(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تقديم الطلب.');
    } finally {
      setApplyingId(null);
    }
  };

  const handleAssign = async (volunteerId) => {
    setAssigningId(volunteerId);
    setError('');
    setSuccessMessage('');
    try {
      await axiosClient.post(`/sessions/${selectedSession.id}/assign-volunteers`, {
        volunteer_ids: [volunteerId]
      });
      setSuccessMessage('تم قبول المتطوع بنجاح!');
      
      // *** الحل: إعادة جلب قائمة المتقدمين من الباك إند بدلاً من التعديل المحلي فقط ***
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
      {/* ... (باقي الكود كما هو) ... */}
      
      {/* داخل الـ Modal: */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* ... (الترويسة والتفاصيل) ... */}

            {/* إذا كان المستخدم هو المشرف، تظهر قائمة المتقدمين */}
            {selectedSession.supervisor_id === user.id ? (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-500" /> المتقدمون للجلسة
                </h4>
                {isLoadingApplicants ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
                ) : applicants.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">لا يوجد متطوعون متقدمون حالياً (أو تم قبولهم جميعاً).</p>
                ) : (
                  <div className="space-y-2">
                    {applicants.map((vol) => (
                      <div key={vol.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold">{vol.name.charAt(0)}</div>
                          <p className="text-sm font-medium">{vol.name}</p>
                        </div>
                        <button 
                          onClick={() => handleAssign(vol.id)} 
                          disabled={assigningId === vol.id}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 px-4 rounded-md disabled:opacity-50"
                        >
                          {assigningId === vol.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'قبول'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // زر التقديم للمتطوع العادي
              <div className="mt-4">
                {/* ... */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}