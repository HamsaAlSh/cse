import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Search, Loader2, AlertCircle, Clock, X } from 'lucide-react';

export default function ManageVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [hoursInput, setHoursInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState({ type: '', text: '' });

  const fetchVolunteers = async () => {
    try {
      const response = await axiosClient.get('/admin/volunteers/all');
      // بناءً على صورة Postman، المصفوفة موجودة داخل response.data.volunteers
      const data = response.data.volunteers || [];
      setVolunteers(data);
      setFilteredVolunteers(data);
    } catch (err) {
      setError('حدث خطأ أثناء جلب بيانات المتطوعين.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchVolunteers(); }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredVolunteers(volunteers.filter((vol) => 
      vol.name.toLowerCase().includes(query) || vol.email.toLowerCase().includes(query)
    ));
  };

  const openHoursModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setHoursInput('');
    setModalMessage({ type: '', text: '' });
    setIsHoursModalOpen(true);
  };

  const handleUpdateHours = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalMessage({ type: '', text: '' });

    try {
      // بناءً على صورة Postman، نحتاج إرسال hours و action
      await axiosClient.patch(`/volunteers/${selectedVolunteer.id}/hours`, {
        hours: parseFloat(hoursInput),
        action: "add"
      });
      
      setModalMessage({ type: 'success', text: 'تم تحديث الساعات بنجاح!' });
      setTimeout(() => {
        setIsHoursModalOpen(false);
        fetchVolunteers(); // إعادة جلب البيانات
      }, 1500);
    } catch (err) {
      setModalMessage({ type: 'error', text: err.response?.data?.message || 'فشل تحديث الساعات.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle />{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المتطوعين</h1>
          <p className="text-gray-500 text-sm mt-1">إجمالي المسجلين: {volunteers.length} متطوع</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input type="text" placeholder="ابحث..." value={searchQuery} onChange={handleSearch} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-gray-600 text-sm">
                <th className="py-4 px-6 font-semibold">المتطوع</th>
                <th className="py-4 px-6 font-semibold">البريد</th>
                <th className="py-4 px-6 font-semibold">الساعات</th>
                <th className="py-4 px-6 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredVolunteers.map((vol) => (
                <tr key={vol.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">{vol.name.charAt(0)}</div>
                    <span className="font-medium text-gray-800">{vol.name}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600" dir="ltr">{vol.email}</td>
                  <td className="py-4 px-6">
                    {/* بناءً على صورة Postman، الساعات موجودة مباشرة في total_hours */}
                    <span className="font-bold text-brand-600">{vol.total_hours} ساعة</span>
                  </td>
                  <td className="py-4 px-6">
                    <button onClick={() => openHoursModal(vol)} className="text-brand-600 hover:text-brand-800 text-xs font-medium flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5" /> تعديل الساعات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isHoursModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button onClick={() => setIsHoursModalOpen(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تحديث ساعات التطوع</h3>
            <p className="text-sm text-gray-500 mb-6">المتطوع: <span className="font-bold text-brand-600">{selectedVolunteer?.name}</span></p>
            
            {modalMessage.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${modalMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{modalMessage.text}</div>
            )}

            <form onSubmit={handleUpdateHours}>
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد الساعات المضافة</label>
              <input type="number" step="0.5" min="0" required value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-6 text-left" dir="ltr" placeholder="0" />
              <button type="submit" disabled={isSubmitting} className="w-full bg-brand-500 text-white py-3 rounded-xl font-medium disabled:opacity-70 flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ التعديل'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}