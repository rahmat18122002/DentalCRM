import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    todayRevenue: 0,
    monthRevenue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [apptsRes, patientsRes, financesRes] = await Promise.all([
        fetch(`/api/appointments?date=${today}`),
        fetch('/api/patients'),
        fetch('/api/finances/summary')
      ]);

      const appts = await apptsRes.json();
      const patients = await patientsRes.json();
      const finances = await financesRes.json();

      setStats({
        todayAppointments: appts.length,
        totalPatients: patients.length,
        todayRevenue: finances.today,
        monthRevenue: finances.month
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const statCards = [
    { name: 'Записи на сегодня', value: stats.todayAppointments, icon: Calendar, color: 'bg-blue-500' },
    { name: 'Всего пациентов', value: stats.totalPatients, icon: Users, color: 'bg-green-500' },
    { name: 'Выручка за сегодня', value: `${stats.todayRevenue} ₽`, icon: Activity, color: 'bg-purple-500' },
    { name: 'Выручка за месяц', value: `${stats.monthRevenue} ₽`, icon: DollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Обзор</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} text-white mr-4`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
