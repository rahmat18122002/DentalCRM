import React, { useState, useEffect } from 'react';
import { translations, Language } from '../lib/i18n';

export default function QueueDisplay() {
  const [queue, setQueue] = useState<any[]>([]);
  const [lang, setLang] = useState<Language>('ru');

  const t = translations[lang];

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(() => {
      fetchQueue();
      // Toggle language every 10 seconds for the display
      setLang(prev => prev === 'ru' ? 'tj' : 'ru');
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    const res = await fetch('/api/queue');
    const data = await res.json();
    setQueue(data);
  };

  const inProgress = queue.filter(q => q.status === 'in_progress');
  const waiting = queue.filter(q => q.status === 'waiting').slice(0, 8); // Show top 8 waiting

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-blue-400">Dental Clinic</h1>
        <div className="text-2xl font-medium text-gray-400">
          {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* In Progress (Now Serving) */}
        <div>
          <h2 className="text-3xl font-bold text-green-400 mb-8 uppercase tracking-wider">
            {t.status.in_progress}
          </h2>
          <div className="space-y-6">
            {inProgress.length === 0 ? (
              <div className="bg-gray-800 rounded-2xl p-8 text-center text-gray-500 text-2xl">
                {t.noPatients}
              </div>
            ) : (
              inProgress.map(p => (
                <div key={p.id} className="bg-gray-800 rounded-2xl p-6 border-l-8 border-green-500 flex justify-between items-center shadow-2xl transform transition-all">
                  <div>
                    <p className="text-5xl font-black text-white mb-2">
                      #{String(p.id).padStart(3, '0')}
                    </p>
                    <p className="text-2xl text-gray-300">{p.patient_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-gray-400 mb-1">{t.doctor}</p>
                    <p className="text-3xl font-bold text-blue-400">{p.doctor_name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Waiting */}
        <div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-8 uppercase tracking-wider">
            {t.status.waiting}
          </h2>
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 text-xl">
                <tr>
                  <th className="p-6 font-medium">Талон</th>
                  <th className="p-6 font-medium">{t.patient}</th>
                  <th className="p-6 font-medium">{t.doctor}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-2xl">
                {waiting.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                      {t.noPatients}
                    </td>
                  </tr>
                ) : (
                  waiting.map(p => (
                    <tr key={p.id}>
                      <td className="p-6 font-bold text-yellow-400">
                        #{String(p.id).padStart(3, '0')}
                      </td>
                      <td className="p-6 text-white">{p.patient_name}</td>
                      <td className="p-6 text-gray-400">{p.doctor_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
