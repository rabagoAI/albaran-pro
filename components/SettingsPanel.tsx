
import React, { useRef, useState } from 'react';
import { Save, Building2, MapPin, CreditCard, Phone, Mail, Database, RefreshCw, Upload, X, Image as ImageIcon } from 'lucide-react';
import { CompanyHeader } from '../types';

interface SettingsPanelProps {
  header: CompanyHeader;
  setHeader: React.Dispatch<React.SetStateAction<CompanyHeader>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ header, setHeader }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(header.logo);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage safety
        alert('El logo es demasiado grande. Por favor, sube una imagen de menos de 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setHeader({
      name: formData.get('name') as string,
      taxId: formData.get('taxId') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      logo: logoPreview
    });
    alert('Cabecera actualizada con éxito');
  };

  const loadSampleData = () => {
    if (confirm('¿Quieres cargar datos de prueba? Esto sobrescribirá tus clientes y el historial actual para facilitar el testeo.')) {
      const sampleCustomers = [
        { id: '1', name: 'Fruterías García SL', address: 'Mercamadrid, Nave 12, Madrid', taxId: 'B12345678', email: 'pedidos@garcia.com', phone: '912345678' },
        { id: '2', name: 'Restaurante El Gourmet', address: 'Calle Gran Vía 45, Madrid', taxId: 'A87654321', email: 'cocina@elgourmet.es', phone: '918765432' },
        { id: '3', name: 'Supermercados Express', address: 'Av. de la Constitución 12, Getafe', taxId: 'B44556677', email: 'recepcion@superexpress.com', phone: '913334455' }
      ];

      const sampleHistory = [
        {
          id: 'h1',
          number: 'ALB-2024-0001',
          date: '2024-03-10',
          header: header,
          customer: sampleCustomers[0],
          items: [
            { id: 'p1', product: 'Manzanas Golden', netWeight: '50kg', lot: 'L24-01', quantity: 2, price: 1.5, total: 3.0 }
          ],
          subtotal: 3.0,
          taxRate: 0.21,
          taxAmount: 0.63,
          total: 3.63,
          hidePrices: false
        },
        {
          id: 'h2',
          number: 'ALB-2024-0002',
          date: '2024-03-12',
          header: header,
          customer: sampleCustomers[1],
          items: [
            { id: 'p2', product: 'Patatas Kennebec', netWeight: '100kg', lot: 'L24-05', quantity: 4, price: 0.8, total: 3.2 },
            { id: 'p3', product: 'Cebollas Dulces', netWeight: '20kg', lot: 'L24-09', quantity: 2, price: 1.2, total: 2.4 }
          ],
          subtotal: 5.6,
          taxRate: 0.21,
          taxAmount: 1.18,
          total: 6.78,
          hidePrices: true
        }
      ];

      localStorage.setItem('customers', JSON.stringify(sampleCustomers));
      localStorage.setItem('history', JSON.stringify(sampleHistory));
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Configuración</h2>
          <p className="text-slate-500 dark:text-slate-400">Personaliza la cabecera y el logo de tu empresa</p>
        </div>
        <button 
          onClick={loadSampleData}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800 hover:scale-105 transition-all"
        >
          <Database size={14} />
          Cargar Datos de Prueba
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6 shadow-sm">
        {/* Logo Upload Section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <ImageIcon size={16} /> Logo / Banner de Empresa
          </label>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 group">
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  <button 
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <Upload size={24} />
                  <span className="text-[10px] mt-1 font-medium">Subir logo</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                {logoPreview ? 'Cambiar imagen' : 'Seleccionar archivo'}
              </button>
              <p className="text-[11px] text-slate-500">Recomendado: Imagen horizontal (banner) con fondo blanco o transparente. Máximo 1MB.</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Building2 size={16} /> Nombre de la Empresa
            </label>
            <input 
              name="name" 
              required 
              defaultValue={header.name} 
              placeholder="Ej: Logística Integral SL"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CreditCard size={16} /> NIF / CIF
            </label>
            <input 
              name="taxId" 
              required 
              defaultValue={header.taxId} 
              placeholder="Ej: B-12345678"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Phone size={16} /> Teléfono de contacto
            </label>
            <input 
              name="phone" 
              required 
              defaultValue={header.phone} 
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MapPin size={16} /> Dirección Fiscal
            </label>
            <input 
              name="address" 
              required 
              defaultValue={header.address} 
              placeholder="Calle, Número, CP, Ciudad, Provincia"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Mail size={16} /> Email de administración
            </label>
            <input 
              name="email" 
              type="email" 
              required 
              defaultValue={header.email} 
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
        >
          <Save size={20} />
          Guardar Cambios
        </button>
      </form>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
        <div className="text-amber-500 mt-1">
          <RefreshCw size={20} />
        </div>
        <div>
          <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">Nota importante</h4>
          <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
            Los datos de esta cabecera y el logo se guardan localmente. Si cambias de navegador o borras la caché, tendrás que volver a subirlos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
