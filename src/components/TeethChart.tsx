import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface TeethChartProps {
  patientId: number;
}

// FDI World Dental Federation notation
const TOP_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const BOTTOM_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export default function TeethChart({ patientId }: TeethChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Form state
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTreatments();
    fetchServices();
  }, [patientId]);

  const fetchTreatments = async () => {
    const res = await fetch(`/api/patients/${patientId}/treatments`);
    const data = await res.json();
    setTreatments(data);
  };

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  };

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTooth || !serviceId) return;

    await fetch('/api/treatments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        tooth_number: selectedTooth,
        service_id: parseInt(serviceId),
        notes
      })
    });

    setServiceId('');
    setNotes('');
    setSelectedTooth(null);
    fetchTreatments();
  };

  const getToothStatus = (toothNum: number) => {
    const toothTreatments = treatments.filter(t => t.tooth_number === toothNum);
    if (toothTreatments.length === 0) return 'healthy';
    // Simple logic: if there's any treatment, mark it
    return 'treated'; 
  };

  const renderTooth = (num: number) => {
    const status = getToothStatus(num);
    const isSelected = selectedTooth === num;
    
    return (
      <button
        key={num}
        onClick={() => setSelectedTooth(num)}
        className={cn(
          "flex flex-col items-center p-2 rounded-lg transition-all border-2",
          isSelected ? "border-blue-500 bg-blue-50" : "border-transparent hover:bg-gray-50",
        )}
      >
        <div className={cn(
          "w-8 h-10 rounded-t-md rounded-b-sm border-2 mb-1",
          status === 'healthy' ? "bg-white border-gray-300" : "bg-blue-100 border-blue-400"
        )} />
        <span className="text-xs font-bold text-gray-600">{num}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Chart */}
      <div className="flex-1">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex justify-center gap-1 mb-8">
            {TOP_TEETH.map(renderTooth)}
          </div>
          <div className="flex justify-center gap-1">
            {BOTTOM_TEETH.map(renderTooth)}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {selectedTooth ? (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-4">Добавить лечение (Зуб {selectedTooth})</h4>
            <form onSubmit={handleAddTreatment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Услуга</label>
                <select 
                  required
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full border-blue-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                >
                  <option value="">Выберите услугу...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.price}₽</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Заметки / Диагноз</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border-blue-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedTooth(null)} className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100">
                  Отмена
                </button>
                <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
            Выберите зуб на схеме для добавления лечения
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex-1">
          <div className="p-3 bg-gray-50 border-b border-gray-200 font-medium text-sm text-gray-700">
            История лечения
          </div>
          <div className="p-0 max-h-96 overflow-y-auto">
            {treatments.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">Нет записей</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {treatments.map(t => (
                  <li key={t.id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-blue-600 text-sm">Зуб {t.tooth_number}</span>
                      <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{t.service_name}</div>
                    {t.notes && <div className="text-xs text-gray-500 mt-1">{t.notes}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
