import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  CalendarDays, Clock, Loader2, AlertCircle, CheckCircle2, X, UserCheck, UserX 
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'sunday', label: 'الأحد' },
  { id: 'monday', label: 'الإثنين' },
  { id: 'tuesday', label: 'الثلاثاء' },
  { id: 'wednesday', label: 'الأربعاء' },
  { id: 'thursday', label: 'الخميس' },
  { id: 'friday', label: 'الجمعة' },
  { id: 'saturday', label: 'السبت' },
];

export default function SupervisorDashboard() {
  // 1. حالة الأنشطة الأسبوعية (يتم جلبها من الباك إند)
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activityError, setActivityError] = useState('');

  // 2. حالة المتقدمين للنشاط المختار (Modal)
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [applicantError, setApplicantError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 3. حالة القبول/الرفض
  const [processingVolunteerId, setProcessingVolunteerId] = useState(null);

  // جلب الأنشطة الأسبوعية عند فتح الصفحة
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // افترض أن هذا هو نفس الـ API الذي يجلب البرنامج الأسبوعي
        const response = await axiosClient.get('/activities'); 
        setActivities(response.data);
      } catch (err) {
        setActivityError('فشل جلب البرنامج الأسبوعي. تأكد من الاتصال بالباك إند.');
      } finally {
        setIsLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  // دالة فتح نافذة المتقدمين لنشاط معين
  const handleOpenApplicants = async (activity) => {
    setSelectedActivity(activity);
    setApplicants([]);
    setApplicantError('');
    setSuccessMessage('');
    setIsLoadingApplicants(true);

    try {
      // جلب المتقدمين لهذا النشاط (بناءً على الـ Postman)
      // ملاحظة: قد تحتاج لتعديل الرابط ليكون /sessions/{id}/applicants أو /activities/{id}/applicants
      const response = await axiosClient.get(`/supervisor/sessions/${activity.id}/applicants`);
      setApplicants(response.data); 
    } catch (err) {
      setApplicantError(err.response?.data?.message || 'فشل جلب المتقدمين لهذا النشاط.');
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  // دالة القبول أو الرفض
  const handleAction = async (volunteerId, action) => {
    setProcessingVolunteerId(volunteerId);
    setApplicantError('');
    setSuccessMessage('');

    try {
      // إذا كان قبول، نستخدم API التعيين (Assign)
      if (action === 'accept') {
        await axiosClient.post(`/sessions/${selectedActivity.id}/assign-volunteers`, {
          volunteer_ids: [volunteerId] // نرسل مصفوفة فيها المتطوع المختار
        });
        setSuccessMessage('تم قبول المتطوع بنجاح!');
      } 
      // إذا كان رفض (افترض أن هناك API للرفض، أو يمكن حذف المتطوع من الطلبات)
      else if (action === 'reject') {
        // ملاحظة: لا يوجد API للرفض في Postman، قد تحتاج لإضافته في الباك إند
        // هنا نستخدم DELETE كمثال (يجب تعديله حسب الباك إند)
        await axiosClient.delete(`/sessions/${selectedActivity.id}/applicants/${volunteerId}`);
        setSuccessMessage('تم رفض المتطوع.');
      }

      // تحديث القائمة محلياً (إزالة المتطوع من القائمة)
      setApplicants(applicants.filter(v => v.id !== volunteerId));

    } catch (err) {
      setApplicantError(err.response?.data?.message || 'فشل تنفيذ العملية. تحقق من الصلاحيات.');
    } finally {
      setProcessingVolunteerId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* الهيدر */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم المشرف</h1>
        <p className="text-gray-500 text-sm mt-1">إليك البرنامج الأسبوعي. اضغط على أي نشاط لمراجعة طلبات المتطوعين.</p>
      </div>

      {/* ================= الجدول الأسبوعي ================= */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-50 text-gray-600 rounded-xl"><CalendarDays className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-gray-800">البرنامج الأسبوعي</h2>
        </div>

        {isLoadingActivities ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
        ) : activityError ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{activityError}</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p>لا توجد أنشطة مضافة في البرنامج الأسبوعي بعد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              // فلترة الأنشطة الخاصة بهذا اليوم
              const dayActivities = activities.filter(act => act.selectedDays?.includes(day.id) || act.days?.includes(day.id));
              
              return (
                <div key={day.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 min-h-[150px]">
                  <h3 className="font-bold text-gray-800 text-center pb-3 border-b border-gray-200 mb-3 text-sm">{day.label}</h3>
                  <div className="space-y-2">
                    {dayActivities.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-4">لا يوجد</p>
                    ) : (
                      dayActivities.map((act) => (
                        <div 
                          key={act.id} 
                          onClick={() => handleOpenApplicants(act)}
                          className="bg-white p-3 rounded-lg border border-brand-100 shadow-sm hover:shadow-md hover:border-brand-300 cursor-pointer transition-all group"
                        >
                          <p className="font-semibold text-brand-700 text-sm truncate">{act.title}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{act.description}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 bg-gray-100 p-1 rounded w-fit" dir="ltr">
                            <Clock className="w-3 h-3" /> {act.start_time} - {act.end_time}
                          </div>
                          <div className="mt-2 text-xs text-brand-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            عرض المتقدمين &larr;
                          </div>
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

      {/* ================= نافذة المتقدمين (Modal) ================= */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedActivity(null)} 
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">إدارة المتقدمين</h3>
            <p className="text-sm text-gray-500 mb-6">
              للنشاط: <span className="font-bold text-brand-600">{selectedActivity.title}</span> 
              <span className="mx-2">|</span> 
              <span dir="ltr">{selectedActivity.start_time} - {selectedActivity.end_time}</span>
            </p>

            {applicantError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{applicantError}</div>}
            {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{successMessage}</div>}

            {isLoadingApplicants ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">لا يوجد متطوعون متقدمون لهذا النشاط حتى الآن.</div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {applicants.map((vol) => (
                  <div key={vol.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                        {vol.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{vol.name}</p>
                        <p className="text-xs text-gray-500" dir="ltr">{vol.email}</p>
                      </div>
                    </div>
                    
                    {/* أزرار القبول والرفض */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAction(vol.id, 'accept')}
                        disabled={processingVolunteerId === vol.id}
                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        title="قبول"
                      >
                        {processingVolunteerId === vol.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => handleAction(vol.id, 'reject')}
                        disabled={processingVolunteerId === vol.id}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        title="رفض"
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}