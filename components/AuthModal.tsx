
import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { firstName, lastName, phone: phone.replace(/\D/g, '') };
    localStorage.setItem('inove_car_user', JSON.stringify(userData));
    onSuccess(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
        <div className="text-center">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Identifique-se</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Para agendar seus serviços</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Nome" className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 text-sm font-bold border-2 border-transparent focus:border-primary outline-none transition-all dark:text-white" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <input required placeholder="Sobrenome" className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 text-sm font-bold border-2 border-transparent focus:border-primary outline-none transition-all dark:text-white" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <input required type="tel" placeholder="(00) 00000-0000" className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 text-sm font-bold border-2 border-transparent focus:border-primary outline-none transition-all dark:text-white" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} />
          
          <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">
            Continuar para Agendamento
          </button>
        </form>
        
        <button onClick={onClose} className="w-full text-[10px] font-black uppercase text-slate-400 text-center">Cancelar</button>
      </div>
    </div>
  );
};

export default AuthModal;
