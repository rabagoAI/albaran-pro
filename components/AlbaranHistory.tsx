
import React, { useState } from 'react';
import { Download, Trash2, Calendar, User, FileText, Search, Package } from 'lucide-react';
import { Albaran } from '../types';
import { generatePDF } from '../services/pdfService';

interface AlbaranHistoryProps {
  history: Albaran[];
  onDelete: (id: string) => void;
}

const AlbaranHistory: React.FC<AlbaranHistoryProps> = ({ history, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    const customerMatch = item.customer.name.toLowerCase().includes(term);
    const productMatch = item.items.some(product => 
      product.product.toLowerCase().includes(term)
    );
    const numberMatch = item.number.toLowerCase().includes(term);
    
    return customerMatch || productMatch || numberMatch;
  });

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 glass rounded-3xl">
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">No hay albaranes generados todavía</p>
        <p className="text-sm">Tus documentos aparecerán aquí una vez los guardes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Historial de Documentos</h2>
          <p className="text-slate-500 dark:text-slate-400">Busca por cliente, producto o número de albarán</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Filtrar por cliente, producto (ej: patatas), lote o Nº de albarán..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl glass border-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div key={item.id} className="glass p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group transition-all hover:bg-white dark:hover:bg-slate-900 border-l-4 border-transparent hover:border-indigo-500">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 mt-1 shrink-0">
                  <FileText size={24} />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{item.number}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold tracking-tighter">PDF Generado</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto md:ml-0">
                      <Calendar size={12} /> {item.date}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                    <User size={14} className="text-slate-400" /> {item.customer.name}
                  </div>

                  {/* Product List Summary */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.items.map((prod, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                        <Package size={10} />
                        {prod.product} {prod.netWeight ? `(${prod.netWeight})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                {!item.hidePrices && (
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{item.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</p>
                  </div>
                )}
                <div className="flex gap-2 ml-auto">
                  <button 
                    onClick={() => generatePDF(item)}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Re-descargar PDF"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Borrar del historial"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400 italic">
            No se encontraron albaranes que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbaranHistory;
