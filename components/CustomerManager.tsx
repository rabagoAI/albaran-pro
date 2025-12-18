
import React, { useState } from 'react';
// Added Users to the imported icons
import { Plus, Search, Trash2, Edit2, UserPlus, Mail, Phone, MapPin, Users } from 'lucide-react';
import { Customer } from '../types';

interface CustomerManagerProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, setCustomers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.taxId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      name: formData.get('name') as string,
      taxId: formData.get('taxId') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? customerData : c));
    } else {
      setCustomers([...customers, customerData]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Base de Clientes</h2>
          <p className="text-slate-500 dark:text-slate-400">Administra tus contactos y destinatarios</p>
        </div>
        <button 
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
        >
          <UserPlus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o NIF..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl glass border-none focus:ring-2 focus:ring-indigo-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="glass p-6 rounded-2xl hover:shadow-lg transition-all group border-transparent hover:border-indigo-500/30">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Users size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">{customer.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{customer.taxId}</p>
            
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={14} /> <span>{customer.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} /> <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} /> <span>{customer.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6">{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre de Empresa / Autónomo</label>
                <input name="name" required defaultValue={editingCustomer?.name} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">NIF / CIF</label>
                <input name="taxId" required defaultValue={editingCustomer?.taxId} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dirección Completa</label>
                <input name="address" required defaultValue={editingCustomer?.address} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input name="email" type="email" required defaultValue={editingCustomer?.email} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                  <input name="phone" required defaultValue={editingCustomer?.phone} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
