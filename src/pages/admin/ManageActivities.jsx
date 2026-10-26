import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  Plus, CalendarDays, Clock, CheckCircle2, AlertCircle, 
  Loader2, BookOpen, UserCog, User, X, Edit, Save, FileText
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'Sunday', label: 'الأحد' }, { id: 'Monday', label: 'الإثنين' },
  { id: 'Tuesday', label: 'الثلاثاء' }, { id: 'Wednesday', label: 'الأربعاء' },
  { id: 'Thursday', label: 'الخميس' }, { id: 'Friday', label: 'الجمعة' },
  { id: 'Saturday', label: 'السبت' },
];

export default function ManageActivities() {
  const [formData, setFormData] = useState({
    title: '', description: '', selectedDays: [], time_slot: '', 
  });
  
  const [volunteers, setVolunteers] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // حالة نافذة التفاصيل
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // حالة نافذة التعديل
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', description: '', time_slot: '', day_of_week: '', supervisor_id: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchActivities = async () => {
    try {
      const response = await axiosClient.get('/volunteer/sessions'); 
      setActivities(response.data.sessions || []);
    } catch (error) {
      console.error("فشل جلب الجلسات", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await axiosClient.get('/admin/volunteers/all');
      setVolunteers(response.data.volunteers || []);
    } catch (error) {
      console.error("فشل جلب المتطوعين", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchVolunteers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleDay = (dayId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedDays.includes(dayId);
      return {
        ...prev,
        selectedDays: isSelected ? prev.selectedDays.filter((d) => d !== dayId) : [...prev.selectedDays, dayId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.selectedDays.length === 0) return setMessage({ type: 'error', text: 'الرجاء اختيار يوم.' });
    if (!formData.time_slot) return setMessage({ type: 'error', text: 'الرجاء إدخال الوقت.' });
    if (!selectedSupervisorId) return setMessage({ type: 'error', text: 'الرجاء اختيار مشرف.' });

    setIsLoading(true);
    try {
      const sessionsData = formData.selectedDays.map(day => ({
        day_of_week: day,
        time_slot: formData.time_slot
      }));

      const response = await axiosClient.post('/activities', {
        title: formData.title,
        description: formData.description,
        sessions: sessionsData,
      });

      const createdSessions = response.data.activity?.sessions || [];
      if (createdSessions.length > 0) {
        const sessionPromises = createdSessions.map(session => 
          axiosClient.patch(`/sessions/${session.id}/supervisor`, {
            supervisor_id: parseInt(selectedSupervisorId)
          })
        );
        await Promise.all(sessionPromises);
        setMessage({ type: 'success', text: 'تم إنشاء النشاط وتعيين المشرف بنجاح!' });
      } else {
        setMessage({ type: 'success', text: 'تم إنشاء النشاط بنجاح!' });
      }

      await fetchActivities();
      setFormData({ title: '', description: '', selectedDays: [], time_slot: '' });
      setSelectedSupervisorId('');

    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'حدث خطأ.' });
    } finally {
      setIsLoading(false);
    }
  };

  // فتح نافذة التعديل من داخل نافذة التفاصيل
  const handleEditClick = () => {
    setEditingActivity(selectedActivity);
    setEditFormData({
      title: selectedActivity.activity?.title || '',
      description: selectedActivity.activity?.description || '',
      time_slot: selectedActivity.time_slot || '',
      day_of_week: selectedActivity.day_of_week || '',
      supervisor_id: selectedActivity.supervisor_id || '',
    });
    setIsEditModalOpen(true);
  };

  // حفظ التعديل
  const handleUpdateActivity = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      // بناءً على Postman: PATCH /admin/activities/{id}
      await axiosClient.patch(`/admin/activities/${editingActivity.activity_id || editingActivity.id}`, {
        title: editFormData.title,
        description: editFormData.description,
        sessions: [{
          day_of_week: editFormData.day_of_week,
          time_slot: editFormData.time_slot,
          supervisor_id: parseInt(editFormData.supervisor_id)
        }]
      });
      
      setMessage({ type: 'success', text: 'تم تعديل النشاط بنجاح!' });
      setIsEditModalOpen(false);
      setSelectedActivity(null); // إغلاق نافذة التفاصيل أيضاً
      await fetchActivities();
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'فشل التعديل.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* نموذج إضافة النشاط */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl"><Plus className="w-6 h-6" /></div>
          <div><h2 className="text-xl font-bold text-gray-800">إضافة نشاط جديد</h2></div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم النشاط</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <input type="text" name="description" required value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button key={day.id} type="button" onClick={() => toggleDay(day.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${formData.selectedDays.includes(day.id) ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600'}`}>
                {day.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الوقت (مثال: 04:00 PM)</label>
            <input type="text" name="time_slot" required value={formData.time_slot} onChange={handleChange} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><UserCog className="w-4 h-4 text-brand-500" /> تعيين مشرف للنشاط</h3>
            <select 
              required
              value={selectedSupervisorId} 
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm"
            >
              <option value="">-- اختر مشرفاً --</option>
              {volunteers.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading} className="bg-brand-500 text-white font-medium py-3 px-8 rounded-xl disabled:opacity-70 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ النشاط'}
          </button>
        </form>
      </div>

      {/* الجدول الأسبوعي */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><CalendarDays className="w-6 h-6" /> البرنامج الأسبوعي</h2>
        
        {isFetching ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد أنشطة مضافة في الباك إند بعد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayActivities = activities.filter(act => act.day_of_week === day.id);
              
              return (
                <div key={day.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 min-h-[150px]">
                  <h3 className="font-bold text-gray-800 text-center pb-3 border-b border-gray-200 mb-3 text-sm">{day.label}</h3>
                  
                  <div className="space-y-3">
                    {dayActivities.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-4">لا يوجد</p>
                    ) : (
                      dayActivities.map((act, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedActivity(act)}
                          className="bg-white p-3 rounded-lg border border-brand-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:shadow-md hover:border-brand-300 transition-all group relative"
                        >
                          <p className="font-bold text-brand-700 text-sm leading-tight pr-6">
                            {act.activity?.title || 'بدون اسم'}
                          </p>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-700 bg-gray-100 p-1.5 rounded-md w-full justify-center font-medium" dir="ltr">
                            <Clock className="w-3 h-3 text-gray-500" /> 
                            <span>{act.time_slot}</span>
                          </div>

                          {act.supervisor && (
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 border-t border-gray-100 pt-2">
                              <User className="w-3 h-3 shrink-0" /> 
                              <span className="leading-tight">{act.supervisor.name}</span>
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

      {/* نافذة تفاصيل النشاط (Modal) */}
      {selectedActivity && !isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedActivity(null)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 border-b border-gray-100 pb-4">
              <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{selectedActivity.activity?.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{DAYS_OF_WEEK.find(d => d.id === selectedActivity.day_of_week)?.label} | {selectedActivity.time_slot}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">الوصف</h4>
                  <p className="text-sm text-gray-600">{selectedActivity.activity?.description || 'لا يوجد وصف.'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">المشرف</h4>
                  <p className="text-sm text-gray-600">{selectedActivity.supervisor?.name || 'لم يتم تعيين مشرف بعد.'}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleEditClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" /> تعديل النشاط
            </button>
          </div>
        </div>
      )}

      {/* نافذة تعديل النشاط (Modal) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">تعديل النشاط</h3>

            <form onSubmit={handleUpdateActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم النشاط</label>
                <input type="text" required value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <input type="text" required value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
                <input type="text" required value={editFormData.time_slot} onChange={(e) => setEditFormData({...editFormData, time_slot: e.target.value})} dir="ltr" className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
              </div>
              
              <button type="submit" disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium disabled:opacity-70 flex justify-center items-center gap-2 mt-4">
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> حفظ التعديلات</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}