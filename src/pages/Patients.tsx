import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Activity } from 'lucide-react';
import TeethChart from '../components/TeethChart';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, dob })
    });
    setIsAdding(false);
    setName('');
    setPhone('');
    setDob('');
    fetchPatients();
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  if (selectedPatient) {
    return (
      <div>
        <button 
          onClick={() => setSelectedPatient(null)}
          className="mb-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Назад к списку
        </button>
        
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPatient.name}</h2>
          <div className="text-gray-600 flex space-x-4">
            <p>Телефон: {selectedPatient.phone}</p>
            <p>Дата рождения: {selectedPatient.dob}</p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Файлы пациента (Рентген, анализы)</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">Перетащите файлы сюда или нажмите для загрузки</p>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Выбрать файлы
            </button>
            <p className="text-xs text-gray-400 mt-2">Поддерживаются форматы: JPG, PNG, PDF (до 10 МБ)</p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Зубная формула и лечение
          </h3>
          <TeethChart patientId={selectedPatient.id} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Пациенты</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Новый пациент
        </button>
      </div>

      {isAdding && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Добавление пациента</h2>
          <form onSubmit={handleAddPatient} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
              <input required type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Отмена</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск по имени или телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ФИО</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата рождения</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dob}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => setSelectedPatient(patient)}
                    className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Карта
                  </button>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Пациенты не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
