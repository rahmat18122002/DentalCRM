import React, { useState, useEffect } from 'react';
import { translations, Language } from '../lib/i18n';
import { Activity, User, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';

export default function Kiosk() {
  const [lang, setLang] = useState<Language>('ru');
  const [step, setStep] = useState<'language' | 'doctor' | 'details' | 'ticket'>('language');
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [patientName, setPatientName] = useState('');
  const [problem, setProblem] = useState('');
  const [ticketId, setTicketId] = useState<number | null>(null);

  const t = translations[lang];

  useEffect(() => {
    // Load saved language
    const savedLang = localStorage.getItem('kiosk_lang') as Language;
    if (savedLang && (savedLang === 'ru' || savedLang === 'tj')) {
      setLang(savedLang);
    }
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    setDoctors(data);
  };

  const handleLanguageSelect = (l: Language) => {
    setLang(l);
    localStorage.setItem('kiosk_lang', l);
    setStep('doctor');
  };

  const handleDoctorSelect = (doc: any) => {
    setSelectedDoctor(doc);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !problem || !selectedDoctor) return;

    const res = await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_name: patientName,
        problem: problem,
        doctor_id: selectedDoctor.id
      })
    });
    const data = await res.json();
    setTicketId(data.id);
    setStep('ticket');
  };

  const resetKiosk = () => {
    setStep('language');
    setSelectedDoctor(null);
    setPatientName('');
    setProblem('');
    setTicketId(null);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <Activity className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">{t.welcome}</h1>
        </div>

        <div className="p-8">
          {step === 'language' && (
            <div className="space-y-6">
              <h2 className="text-2xl text-center font-medium text-gray-800 mb-8">{t.chooseLanguage}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => handleLanguageSelect('ru')}
                  className="py-12 px-6 text-3xl font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-md transition-transform transform hover:scale-105"
                >
                  Русский
                </button>
                <button 
                  onClick={() => handleLanguageSelect('tj')}
                  className="py-12 px-6 text-3xl font-bold text-white bg-green-500 hover:bg-green-600 rounded-2xl shadow-md transition-transform transform hover:scale-105"
                >
                  Тоҷикӣ
                </button>
              </div>
            </div>
          )}

          {step === 'doctor' && (
            <div className="space-y-6">
              <button onClick={() => setStep('language')} className="text-blue-600 font-medium mb-4">&larr; {t.back}</button>
              <h2 className="text-2xl text-center font-medium text-gray-800 mb-8">{t.chooseDoctor}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map(doc => (
                  <button 
                    key={doc.id}
                    onClick={() => handleDoctorSelect(doc)}
                    className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Stethoscope className="w-12 h-12 text-blue-500 mb-4" />
                    <span className="text-xl font-medium text-gray-800">{doc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <button onClick={() => setStep('doctor')} className="text-blue-600 font-medium mb-4">&larr; {t.back}</button>
              <h2 className="text-2xl text-center font-medium text-gray-800 mb-8">{t.enterName}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input 
                    type="text" 
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder={t.enterName}
                    className="w-full text-2xl p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-0"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-4">{t.chooseProblem}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(t.problems).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setProblem(value)}
                        className={`p-4 rounded-xl border-2 text-lg font-medium transition-colors ${
                          problem === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!patientName || !problem}
                  className="w-full py-4 text-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                  {t.send}
                </button>
              </form>
            </div>
          )}

          {step === 'ticket' && (
            <div className="text-center space-y-8 py-8">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.ticketCreated}</h2>
                <p className="text-xl text-gray-600">{t.pleaseWait}</p>
              </div>
              
              <div className="bg-gray-100 p-8 rounded-2xl inline-block min-w-[300px]">
                <p className="text-gray-500 text-lg mb-2">{t.yourNumber}</p>
                <p className="text-6xl font-black text-blue-600">
                  {ticketId ? String(ticketId).padStart(3, '0') : '---'}
                </p>
                <p className="text-xl font-medium text-gray-800 mt-4">{selectedDoctor?.name}</p>
              </div>

              <div className="pt-8">
                <button 
                  onClick={resetKiosk}
                  className="py-4 px-8 text-xl font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl"
                >
                  {t.newTicket}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
