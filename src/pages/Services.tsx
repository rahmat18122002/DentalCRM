import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await fetch(`/api/services/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price) })
      });
    } else {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price) })
      });
    }
    
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setPrice('');
    fetchServices();
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setName(service.name);
    setPrice(service.price.toString());
    setIsAdding(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Услуги и Цены</h1>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setName('');
            setPrice('');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить услугу
        </button>
      </div>

      {isAdding && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Редактирование услуги' : 'Новая услуга'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название услуги</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
              <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Отмена</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.price} ₽</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Изменить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
