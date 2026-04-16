import { useState, useEffect } from 'react';
import { 
  Users, Calendar as CalendarIcon, Activity, 
  DollarSign, Settings, LogOut, Menu, X, ListOrdered 
} from 'lucide-react';
import { cn } from './lib/utils';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Services from './pages/Services';
import Finances from './pages/Finances';
import Login from './pages/Login';
import DoctorQueue from './pages/DoctorQueue';

export type User = {
  id: number;
  username: string;
  role: string;
  name: string;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('clinic_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('clinic_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('clinic_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const allNavItems = [
    { id: 'dashboard', label: 'Главная', icon: Activity, roles: ['admin', 'doctor', 'receptionist'] },
    { id: 'queue', label: 'Живая очередь', icon: ListOrdered, roles: ['admin', 'doctor'] },
    { id: 'appointments', label: 'Расписание', icon: CalendarIcon, roles: ['admin', 'doctor', 'receptionist'] },
    { id: 'patients', label: 'Пациенты', icon: Users, roles: ['admin', 'doctor', 'receptionist'] },
    { id: 'finances', label: 'Финансы', icon: DollarSign, roles: ['admin', 'receptionist'] },
    { id: 'services', label: 'Услуги и Цены', icon: Settings, roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'queue': return <DoctorQueue user={user} />;
      case 'patients': return <Patients />;
      case 'appointments': return <Appointments user={user} />;
      case 'services': return <Services />;
      case 'finances': return <Finances />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-md shadow-sm text-gray-600"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Activity className="w-8 h-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">DentalCRM</span>
          </div>
          
          <div className="px-4 py-6">
            <div className="mb-6 px-4">
              <p className="text-sm font-medium text-gray-500">Пользователь</p>
              <p className="text-base font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      activeTab === item.id 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mr-3", activeTab === item.id ? "text-blue-700" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
