
import React, { useState, useEffect } from 'react';
import { 
  FilePlus, 
  History, 
  Users, 
  Settings, 
  Moon, 
  Sun, 
  Package,
  Menu,
  X
} from 'lucide-react';
import { ViewType, Customer, Albaran, CompanyHeader } from './types';
import NewAlbaran from './components/NewAlbaran';
import AlbaranHistory from './components/AlbaranHistory';
import CustomerManager from './components/CustomerManager';
import SettingsPanel from './components/SettingsPanel';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('new');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Cliente de Prueba SL', address: 'Calle Mayor 1, Madrid', taxId: 'B12345678', email: 'info@cliente.com', phone: '912345678' }
    ];
  });

  const [history, setHistory] = useState<Albaran[]>(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });

  const [companyHeader, setCompanyHeader] = useState<CompanyHeader>(() => {
    const saved = localStorage.getItem('companyHeader');
    return saved ? JSON.parse(saved) : {
      name: 'Mi Empresa SL',
      address: 'Polígono Industrial Las Mercedes, Nave 4',
      taxId: 'A87654321',
      phone: '912344556',
      email: 'facturacion@miempresa.com'
    };
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 transition-colors duration-300';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-900 transition-colors duration-300';
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('companyHeader', JSON.stringify(companyHeader));
  }, [companyHeader]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderView = () => {
    switch (activeView) {
      case 'new':
        return (
          <NewAlbaran 
            customers={customers} 
            header={companyHeader} 
            onSave={(albaran) => {
              setHistory([albaran, ...history]);
              setActiveView('history');
            }} 
          />
        );
      case 'history':
        return <AlbaranHistory history={history} onDelete={(id) => setHistory(history.filter(h => h.id !== id))} />;
      case 'customers':
        return <CustomerManager customers={customers} setCustomers={setCustomers} />;
      case 'settings':
        return <SettingsPanel header={companyHeader} setHeader={setCompanyHeader} />;
      default:
        return <NewAlbaran customers={customers} header={companyHeader} onSave={(a) => setHistory([a, ...history])} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Package size={24} />
            </div>
            {isSidebarOpen && <h1 className="font-extrabold text-xl tracking-tighter">Albarán<span className="text-indigo-600">Pro</span></h1>}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<FilePlus size={20} />} 
            label="Nuevo Albarán" 
            active={activeView === 'new'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('new')} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Historial" 
            active={activeView === 'history'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('history')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Clientes" 
            active={activeView === 'customers'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('customers')} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Configuración" 
            active={activeView === 'settings'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('settings')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm md:shadow-none"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            {isSidebarOpen && <span className="text-sm font-semibold">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </button>
          <button 
            onClick={toggleSidebar}
            className="mt-2 flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span className="text-sm font-semibold">Colapsar menú</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 border ${
      active 
        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-400 font-bold shadow-sm' 
        : 'text-slate-600 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    } ${collapsed ? 'justify-center' : ''}`}
    title={collapsed ? label : undefined}
  >
    <span className={`${active ? 'scale-110' : ''} transition-transform shrink-0`}>{icon}</span>
    {!collapsed && <span className="text-sm">{label}</span>}
  </button>
);

export default App;