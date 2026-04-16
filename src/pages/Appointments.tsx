import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '../App';

interface AppointmentsProps {
  user: User;
}

export default function Appointments({ user }: AppointmentsProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    notes: ''
  });

  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${min}`;
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, [currentDate]);

  const fetchAppointments = async () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const res = await fetch(`/api/appointments?date=${dateStr}`);
    const data = await res.json();
    setAppointments(data);
  };

  const fetchDoctors = async () => {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    setDoctors(data);
    if (data.length > 0 && !formData.doctor_id) {
      setFormData(prev => ({ ...prev, doctor_id: data[0].id.toString() }));
    }
  };

  const fetchPatients = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Ошибка при добавлении записи');
        return;
      }
      
      setIsAdding(false);
      fetchAppointments();
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  const changeStatus = async (id: number, status: string) => {
    await fetch(`/api/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchAppointments();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Новая запись
        </button>
      </div>

      {isAdding && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Добавление записи</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пациент</label>
              <select required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
                <option value="">Выберите...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Врач</label>
              <select required value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время</label>
              <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="lg:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div className="lg:col-span-5 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Отмена</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:bg-gray-200 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {format(currentDate, 'EEEE, d MMMM yyyy', { locale: ru })}
          </h2>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-gray-200 rounded-full">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {timeSlots.map(time => {
            const slotAppointments = appointments.filter(a => a.time === time);
            
            return (
              <div key={time} className="flex border-b border-gray-50 hover:bg-gray-50">
                <div className="w-24 py-4 px-6 text-sm font-medium text-gray-500 border-r border-gray-100">
                  {time}
                </div>
                <div className="flex-1 p-2 flex flex-wrap gap-2">
                  {slotAppointments.map(apt => (
                    <div key={apt.id} className={`p-3 rounded-lg border text-sm w-full max-w-md ${
                      apt.status === 'completed' ? 'bg-green-50 border-green-200' :
                      apt.status === 'cancelled' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900">{apt.patient_name}</span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {apt.doctor_name}
                        </span>
                      </div>
                      {apt.notes && <p className="text-xs text-gray-600 mb-2">{apt.notes}</p>}
                      
                      <div className="flex gap-2 mt-2">
                        {apt.status === 'scheduled' && (
                          <>
                            <button onClick={() => changeStatus(apt.id, 'completed')} className="text-xs text-green-700 hover:underline">Завершить</button>
                            <button onClick={() => changeStatus(apt.id, 'cancelled')} className="text-xs text-red-700 hover:underline">Отменить</button>
                          </>
                        )}
                        {apt.status !== 'scheduled' && (
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {apt.status === 'completed' ? 'Завершено' : 'Отменено'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
