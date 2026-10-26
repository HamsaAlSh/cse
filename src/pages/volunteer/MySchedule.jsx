import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { CalendarDays, Clock, Loader2, AlertCircle } from 'lucide-react';

export default function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axiosClient.get('/volunteer/schedule');
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
      <h1 className="text-2xl font-bold text-gray-800">جدولي الأسبوعي</h1>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}

      {schedule.length === 0 ? (
        <p className="text-center py-12 text-gray-500">لا توجد أنشطة في جدولك.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schedule.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm">
              <h3 className="font-bold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
              {item.pivot && (
                <div className="mt-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    item.pivot.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    item.pivot.status === 'assigned' ? 'bg-green-50 text-green-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {item.pivot.status === 'pending' ? 'قيد الانتظار' : 
                     item.pivot.status === 'assigned' ? 'مقبول' : 'مرفوض'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}