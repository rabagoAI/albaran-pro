
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, FileText, Sparkles, PlusCircle, Settings2, Eye, EyeOff } from 'lucide-react';
import { Customer, AlbaranItem, CompanyHeader, Albaran } from '../types';
import { generatePDF } from '../services/pdfService';
import { GoogleGenAI } from '@google/genai';

interface NewAlbaranProps {
  customers: Customer[];
  header: CompanyHeader;
  onSave: (albaran: Albaran) => void;
}

const NewAlbaran: React.FC<NewAlbaranProps> = ({ customers, header, onSave }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [items, setItems] = useState<AlbaranItem[]>([
    { id: '1', product: '', netWeight: '', lot: '', quantity: 1, price: 0, total: 0, customFields: {} }
  ]);
  const [notes, setNotes] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [hidePrices, setHidePrices] = useState(false);
  const [extraColumns, setExtraColumns] = useState<string[]>([]);
  const [showColumnManager, setShowColumnManager] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxRate = 0.21;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxRate, taxAmount, total };
  }, [items]);

  const handleAddItem = () => {
    const newItem: AlbaranItem = { 
      id: Date.now().toString(), 
      product: '', 
      netWeight: '', 
      lot: '', 
      quantity: 1, 
      price: 0, 
      total: 0,
      customFields: extraColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof AlbaranItem | string, value: any, isCustom = false) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (isCustom) {
          return { ...item, customFields: { ...item.customFields, [field]: value } };
        }
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.total = (updated.quantity || 0) * (updated.price || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleAddExtraColumn = () => {
    const colName = prompt('Nombre de la nueva columna:');
    if (colName && !extraColumns.includes(colName)) {
      setExtraColumns([...extraColumns, colName]);
      setItems(items.map(item => ({
        ...item,
        customFields: { ...item.customFields, [colName]: '' }
      })));
    }
  };

  const handleRemoveExtraColumn = (colName: string) => {
    setExtraColumns(extraColumns.filter(c => c !== colName));
    setItems(items.map(item => {
      const { [colName]: _, ...rest } = item.customFields || {};
      return { ...item, customFields: rest };
    }));
  };

  const handleSuggestNotes = async () => {
    if (!selectedCustomer) return;
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Escribe una breve nota profesional de agradecimiento personalizada para un albarán. El cliente es ${selectedCustomer.name}. Los productos son: ${items.map(i => i.product).join(', ')}. Limítate a 2 frases en español.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setNotes(response.text?.trim() || '');
    } catch (error) {
      console.error('Error with AI:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    if (!selectedCustomerId || items.some(i => !i.product)) {
      alert('Por favor, selecciona un cliente y completa los nombres de producto.');
      return;
    }

    const albaran: Albaran = {
      id: Date.now().toString(),
      number: `ALB-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      header,
      customer: selectedCustomer!,
      items,
      ...totals,
      notes,
      hidePrices,
      extraColumnNames: extraColumns
    };

    onSave(albaran);
    generatePDF(albaran);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo Albarán</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Personaliza columnas y detalles del envío</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setHidePrices(!hidePrices)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all border ${
              hidePrices 
                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' 
                : 'bg-white border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 shadow-sm'
            }`}
          >
            {hidePrices ? <EyeOff size={18} /> : <Eye size={18} />}
            {hidePrices ? 'Precios Ocultos' : 'Precios Visibles'}
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Save size={18} />
            Generar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emisor */}
        <div className="glass p-6 rounded-2xl border-l-4 border-indigo-500 relative overflow-hidden">
          <h3 className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
            <FileText size={16} /> Emisor
          </h3>
          <div className="flex items-start gap-4">
            {header.logo && (
              <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                <img src={header.logo} alt="Logo empresa" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div className="space-y-1 text-sm">
              <p className="font-extrabold text-lg text-slate-900 dark:text-white">{header.name}</p>
              <p className="text-slate-700 dark:text-slate-400 font-medium">{header.address}</p>
              <p className="text-slate-700 dark:text-slate-400 font-medium">NIF: {header.taxId}</p>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="glass p-6 rounded-2xl border-l-4 border-emerald-500">
          <h3 className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
            <PlusCircle size={16} /> Destinatario
          </h3>
          <select 
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">-- Seleccionar un cliente --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          {selectedCustomer && (
            <div className="space-y-1 text-sm animate-in fade-in duration-300">
              <p className="font-extrabold text-slate-900 dark:text-white">{selectedCustomer.name}</p>
              <p className="text-slate-700 dark:text-slate-400 font-medium">{selectedCustomer.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Artículos */}
      <div className="glass overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Detalle del Albarán</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowColumnManager(!showColumnManager)}
              className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Settings2 size={14} /> Gestionar Columnas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th className="p-4 font-bold text-xs uppercase text-slate-700 dark:text-slate-400">Producto</th>
                <th className="p-4 font-bold text-xs uppercase text-slate-700 dark:text-slate-400 w-32">Peso Neto</th>
                <th className="p-4 font-bold text-xs uppercase text-slate-700 dark:text-slate-400 w-32">Lote</th>
                {extraColumns.map(col => (
                  <th key={col} className="p-4 font-bold text-xs uppercase text-slate-700 dark:text-slate-400">{col}</th>
                ))}
                <th className="p-4 font-bold text-xs uppercase text-slate-700 dark:text-slate-400 w-20 text-center">Cant.</th>
                {!hidePrices && (
                  <>
                    <th className="p-4 font-bold text-xs uppercase text-slate-700 dark:text-slate-400 w-28">Precio (€)</th>
                    <th className="p-4 font-bold text-xs uppercase text-slate-700 dark:text-slate-400 w-28">Total (€)</th>
                  </>
                )}
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-2">
                    <input 
                      type="text" 
                      placeholder="Nombre producto..."
                      className="w-full p-2 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 border-none outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900 dark:text-white"
                      value={item.product}
                      onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      className="w-full p-2 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 border-none outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200"
                      value={item.netWeight}
                      onChange={(e) => handleItemChange(item.id, 'netWeight', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      className="w-full p-2 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 border-none outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200"
                      value={item.lot}
                      onChange={(e) => handleItemChange(item.id, 'lot', e.target.value)}
                    />
                  </td>
                  {extraColumns.map(col => (
                    <td key={col} className="p-2">
                      <input 
                        type="text" 
                        className="w-full p-2 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 border-none outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200"
                        value={item.customFields?.[col] || ''}
                        onChange={(e) => handleItemChange(item.id, col, e.target.value, true)}
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <input 
                      type="number" 
                      className="w-full p-2 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 border-none outline-none focus:ring-1 focus:ring-indigo-500 text-center font-bold text-slate-900 dark:text-white"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  {!hidePrices && (
                    <>
                      <td className="p-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full p-2 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 border-none outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-900 dark:text-white"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-4 font-extrabold text-slate-900 dark:text-slate-300 whitespace-nowrap">
                        {item.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </td>
                    </>
                  )}
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/20">
          <button 
            onClick={handleAddItem}
            className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold hover:underline"
          >
            <Plus size={18} /> Añadir línea
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-500">Notas Adicionales</h4>
            <button 
              onClick={handleSuggestNotes}
              disabled={isGeneratingAI || !selectedCustomer}
              className="text-xs font-bold flex items-center gap-1 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} /> {isGeneratingAI ? '...' : 'Sugerir con IA'}
            </button>
          </div>
          <textarea 
            className="w-full h-24 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm font-medium text-slate-900 dark:text-white"
            placeholder="Comentarios sobre el transporte, horario de entrega..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <div className={`glass p-6 rounded-2xl space-y-3 transition-opacity duration-300 ${hidePrices ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="flex justify-between text-slate-700 dark:text-slate-400 font-bold">
            <span>Subtotal:</span>
            <span>{totals.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-400 font-bold">
            <span>IVA (21%):</span>
            <span>{totals.taxAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="pt-3 border-t border-slate-300 dark:border-slate-700 flex justify-between font-black text-2xl text-indigo-700 dark:text-indigo-400">
            <span>Total:</span>
            <span>{totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAlbaran;
