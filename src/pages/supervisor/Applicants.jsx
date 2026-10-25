import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { UserCheck, UserX, Loader2, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { Card, PageLoader, Alert } from '../../components/ui';

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // جلب جميع الطلبات (ملاحظة: قد تحتاج لتعديل الـ API ليجلب كل الطلبات للمشرف)
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        // افترض أن هذا الـ API يجلب جميع المتقدمين للمشرف الحالي
        const response = await axiosClient.get('/supervisor/applicants'); 
        setApplicants(response.data);
      } catch (err) {
        setError('فشل جلب طلبات المتطوعين. تأكد من الصلاحيات.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
  }, []);

  const handleAction = async (id, action) => {
    setProcessingId(id);
    setError('');
    setSuccessMessage('');

    try {
      if (action === 'accept') {
        // افترض أن هناك API للقبول (أو نستخدم Assign Volunteers)
        await axiosClient.post(`/sessions/${id}/assign-volunteers`, { volunteer_ids: [id] });
        setSuccessMessage('تم قبول المتطوع بنجاح!');
      } else {
        // افترض أن هناك API للرفض
        await axiosClient.delete(`/applicants/${id}`);
        setSuccessMessage('تم رفض المتطوع.');
      }
      
      // إزالة المتطوع من القائمة بعد الإجراء
      setApplicants(applicants.filter(a => a.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تنفيذ العملية.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">طلبات المتطوعين</h1>
        <p className="text-gray-500 text-sm mt-1">راجع الطلبات المقدمة من المتطوعين للانضمام إلى الأنشطة.</p>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={successMessage} />

      {applicants.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد طلبات جديدة حالياً.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applicants.map((vol) => (
            <Card key={vol.id} className="p-5 flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
                  {vol.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{vol.name}</p>
                  <p className="text-xs text-gray-500" dir="ltr">{vol.email}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => handleAction(vol.id, 'accept')}
                  disabled={processingId === vol.id}
                  className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                >
                  {processingId === vol.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4" /> قبول</>}
                </button>
                <button 
                  onClick={() => handleAction(vol.id, 'reject')}
                  disabled={processingId === vol.id}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" /> رفض
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}