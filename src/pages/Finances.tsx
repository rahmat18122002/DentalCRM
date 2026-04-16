import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export default function Finances() {
  const [payments, setPayments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Наличные');
  const [patientDebt, setPatientDebt] = useState<number | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPatientDebt(patientId);
    } else {
      setPatientDebt(null);
    }
  }, [patientId]);

  const fetchPayments = async () => {
    const res = await fetch('/api/payments');
    const data = await res.json();
    setPayments(data);
  };

  const fetchPatients = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
  };

  const fetchPatientDebt = async (id: string) => {
    const res = await fetch(`/api/patients/${id}/balance`);
    const data = await res.json();
    setPatientDebt(data.debt);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patient_id: parseInt(patientId), 
        amount: parseFloat(amount), 
        method 
      })
    });
    
    setIsAdding(false);
    setPatientId('');
    setAmount('');
    fetchPayments();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Финансы</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Принять оплату
        </button>
      </div>

      {isAdding && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Новый платеж</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пациент</label>
              <select required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
                <option value="">Выберите...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {patientDebt !== null && (
                <p className={`text-xs mt-1 ${patientDebt > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                  Долг: {patientDebt} ₽
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сумма (₽)</label>
              <input required type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Способ оплаты</label>
              <select required value={method} onChange={e => setMethod(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
                <option value="Наличные">Наличные</option>
                <option value="Карта">Карта</option>
                <option value="Перевод">Перевод</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Отмена</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Провести платеж</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пациент</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Способ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.date).toLocaleString('ru-RU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.patient_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                  +{payment.amount} ₽
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Платежи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
