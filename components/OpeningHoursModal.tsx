
import React from 'react';

interface OpeningHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpeningHoursModal: React.FC<OpeningHoursModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:rotate-90 transition-transform"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className="text-center">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">schedule</span>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">Funcionamento</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Horários da Unidade</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-primary/20 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-400">Segunda a Sexta</span>
              <span className="text-xs font-black uppercase text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Fechado</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-primary tracking-wider">Sábado</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">08:00 — 17:00</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-primary/20 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-400">Domingo</span>
              <span className="text-xs font-black uppercase text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Fechado</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all mt-4"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default OpeningHoursModal;
