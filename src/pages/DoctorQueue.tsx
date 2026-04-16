import React, { useState, useEffect } from 'react';
import { translations, Language } from '../lib/i18n';
import { User } from '../App';
import { Check, Play, Clock } from 'lucide-react';

interface DoctorQueueProps {
  user: User;
}

export default function DoctorQueue({ user }: DoctorQueueProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [lang, setLang] = useState<Language>('ru');

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('doctor_lang') as Language;
    if (savedLang && (savedLang === 'ru' || savedLang === 'tj')) {
      setLang(savedLang);
    }
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    const res = await fetch('/api/queue');
    const data = await res.json();
    // Filter queue for this doctor only
    const myQueue = data.filter((q: any) => q.doctor_id === user.id);
    setQueue(myQueue);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/queue/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchQueue();
  };

  const toggleLang = () => {
    const newLang = lang === 'ru' ? 'tj' : 'ru';
    setLang(newLang);
    localStorage.setItem('doctor_lang', newLang);
  };

  const waitingPatients = queue.filter(q => q.status === 'waiting');
  const inProgressPatient = queue.find(q => q.status === 'in_progress');
  const donePatients = queue.filter(q => q.status === 'done');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.queue}</h1>
        <button 
          onClick={toggleLang}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          {lang === 'ru' ? 'Тоҷикӣ' : 'Русский'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Current Patient */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-xl border border-blue-100 overflow-hidden mb-8">
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <h2 className="text-lg font-bold text-blue-900">{t.currentPatient}</h2>
            </div>
            <div className="p-8 text-center">
              {inProgressPatient ? (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Талон #{String(inProgressPatient.id).padStart(3, '0')}</p>
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">{inProgressPatient.patient_name}</h3>
                  <p className="text-xl text-red-500 font-medium mb-8">{inProgressPatient.problem}</p>
                  <button 
                    onClick={() => updateStatus(inProgressPatient.id, 'done')}
                    className="bg-green-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-green-600 flex items-center justify-center mx-auto"
                  >
                    <Check className="w-6 h-6 mr-2" />
                    {t.finish}
                  </button>
                </div>
              ) : (
                <div className="py-12">
                  <p className="text-xl text-gray-500 mb-6">{t.noPatients}</p>
                  {waitingPatients.length > 0 && (
                    <button 
                      onClick={() => updateStatus(waitingPatients[0].id, 'in_progress')}
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-700 flex items-center justify-center mx-auto"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      {t.callNext}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Waiting List */}
        <div>
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{t.status.waiting}</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                {waitingPatients.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {waitingPatients.length === 0 ? (
                <p className="p-6 text-center text-gray-500">{t.noPatients}</p>
              ) : (
                waitingPatients.map(p => (
                  <div key={p.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{p.patient_name}</p>
                      <p className="text-sm text-gray-500">{p.problem}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{String(p.id).padStart(3, '0')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
