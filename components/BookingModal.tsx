
import React, { useState, useEffect } from 'react';
import { Service } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onConfirm: (date: string, time: string, name: string, phone: string) => Promise<string | undefined>;
  bookedSlots: string[];
  initialUser?: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service, onConfirm, bookedSlots, initialUser }) => {
  const [step, setStep] = useState<'datetime' | 'details' | 'success'>('datetime');
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState('');

  // Preenche o nome se o usuário estiver logado
  useEffect(() => {
    if (isOpen && initialUser) {
      setUserName(initialUser.displayName || '');
    }
  }, [isOpen, initialUser]);

  if (!isOpen || !service) return null;

  const handleClose = () => {
    setStep('datetime');
    setSelectedTime(null);
    setGeneratedProtocol('');
    setLoading(false);
    onClose();
  };

  const dates = [];
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    dates.push({
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dayNum: d.getDate(),
      fullDate: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    });
  }

  const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const isSlotBooked = (time: string) => {
    const slotId = `${dates[selectedDateIdx].fullDate}-${time}`;
    return bookedSlots.includes(slotId);
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    const protocol = await onConfirm(dates[selectedDateIdx].fullDate, selectedTime!, userName, userPhone);
    if (protocol) {
      setGeneratedProtocol(protocol);
      setStep('success');
    }
    setLoading(false);
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg">
              {step === 'datetime' && 'Escolha o Horário'}
              {step === 'details' && 'Confirme os Dados'}
              {step === 'success' && 'Agendado!'}
            </h3>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{service.name}</p>
          </div>
          <button onClick={handleClose} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-6">
          {step === 'datetime' && (
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map((date, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setSelectedDateIdx(i); setSelectedTime(null); }} 
                    className={`flex flex-col items-center justify-center min-w-[54px] h-[74px] rounded-2xl border-2 transition-all ${selectedDateIdx === i ? 'bg-primary border-primary text-white shadow-lg' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                  >
                    <span className="text-[9px] uppercase font-bold">{date.dayName}</span>
                    <span className="text-xl font-black">{date.dayNum}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {times.map((time) => {
                  const occupied = isSlotBooked(time);
                  return (
                    <button 
                      key={time} 
                      disabled={occupied}
                      onClick={() => setSelectedTime(time)} 
                      className={`py-3 rounded-xl font-bold text-xs border-2 transition-all ${
                        occupied ? 'opacity-20 bg-slate-100 dark:bg-slate-800 border-transparent cursor-not-allowed' :
                        selectedTime === time ? 'bg-primary/10 border-primary text-primary' : 'border-transparent bg-slate-50 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {occupied ? 'Ocupado' : time}
                    </button>
                  );
                })}
              </div>

              <button 
                disabled={!selectedTime} 
                onClick={() => setStep('details')} 
                className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-30 active:scale-95 transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  value={userName} 
                  onChange={e => setUserName(e.target.value)} 
                  placeholder="Seu nome" 
                  className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 text-sm font-medium outline-none border-2 border-transparent focus:border-primary dark:text-white transition-all" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <input 
                  value={userPhone} 
                  onChange={e => setUserPhone(formatPhone(e.target.value))} 
                  placeholder="(00) 00000-0000" 
                  className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 text-sm font-medium outline-none border-2 border-transparent focus:border-primary dark:text-white transition-all" 
                />
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={handleFinalConfirm} 
                  disabled={!userName || userPhone.length < 14 || loading} 
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center"
                >
                  {loading ? <div className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Confirmar e Gerar Protocolo'}
                </button>
                <button onClick={() => setStep('datetime')} className="w-full mt-4 text-slate-400 text-[10px] font-black uppercase tracking-widest text-center hover:text-primary transition-colors">Voltar</button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
              <div className="size-20 bg-whatsapp/10 text-whatsapp rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[40px]">check_circle</span>
              </div>
              <div>
                <h4 className="font-black text-xl mb-1">Tudo pronto!</h4>
                <p className="text-slate-500 text-xs">Seu protocolo foi gerado e salvo com sucesso.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter block mb-1">Número do Protocolo</span>
                <span className="text-xl font-mono font-black text-primary tracking-widest">{generatedProtocol}</span>
              </div>

              <p className="text-[10px] text-slate-400 px-4">
                Clique no botão abaixo para abrir o WhatsApp e finalizar a confirmação do seu horário.
              </p>

              <button 
                onClick={handleClose}
                className="w-full h-14 bg-whatsapp text-white rounded-2xl font-black shadow-lg shadow-whatsapp/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">send</span> Finalizar no WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
