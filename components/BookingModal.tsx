
import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  user: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service, user }) => {
  const [step, setStep] = useState<'datetime' | 'success'>('datetime');
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState('');

  const dates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dayNum: d.getDate(),
      fullDate: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      isoDate: d.toISOString().split('T')[0]
    };
  });

  const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // Atualiza slots ocupados ao mudar a data
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      bookingService.getOccupiedSlots(dates[selectedDateIdx].fullDate).then(slots => {
        setBusySlots(slots);
        setLoading(false);
      });
    }
  }, [selectedDateIdx, isOpen]);

  if (!isOpen || !service) return null;

  const handleConfirm = async () => {
    if (!selectedTime || !user) return;
    setLoading(true);
    
    const newProtocol = `INV-${Date.now().toString().slice(-6)}`;
    const success = await bookingService.createBooking({
      date: dates[selectedDateIdx].fullDate,
      time: selectedTime,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      serviceId: service.id,
      serviceName: service.name,
      protocol: newProtocol
    });

    if (success) {
      setProtocol(newProtocol);
      setStep('success');
      
      const msg = `🚗 *NOVO AGENDAMENTO*\n\n📄 *Protocolo:* ${newProtocol}\n👤 *Cliente:* ${user.firstName} ${user.lastName}\n📅 *Data:* ${dates[selectedDateIdx].fullDate}\n⏰ *Hora:* ${selectedTime}\n🛠️ *Serviço:* ${service.name}`;
      window.open(`https://api.whatsapp.com/send?phone=555192438084&text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      alert("Este horário acabou de ser preenchido. Por favor, escolha outro.");
    }
    setLoading(false);
  };

  const isPast = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date();
    const [day, month] = dates[selectedDateIdx].fullDate.split('/').map(Number);
    slotDate.setMonth(month - 1);
    slotDate.setDate(day);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < new Date();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="font-black text-lg dark:text-white">{step === 'datetime' ? 'Escolha o Horário' : 'Sucesso!'}</h3>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{service.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-6">
          {step === 'datetime' ? (
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map((date, i) => (
                  <button key={i} onClick={() => { setSelectedDateIdx(i); setSelectedTime(null); }} className={`flex flex-col items-center justify-center min-w-[54px] h-[74px] rounded-2xl border-2 transition-all ${selectedDateIdx === i ? 'bg-primary border-primary text-white shadow-lg' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                    <span className="text-[9px] uppercase font-bold">{date.dayName}</span>
                    <span className="text-xl font-black">{date.dayNum}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                {times.map((time) => {
                  const occupied = busySlots.includes(time) || isPast(time);
                  return (
                    <button key={time} disabled={occupied} onClick={() => setSelectedTime(time)} className={`py-3 rounded-xl font-bold text-xs border-2 transition-all ${occupied ? 'opacity-20 bg-slate-100 dark:bg-slate-800 cursor-not-allowed border-transparent' : selectedTime === time ? 'bg-primary/10 border-primary text-primary' : 'border-transparent bg-slate-50 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {occupied ? 'Indisponível' : time}
                    </button>
                  );
                })}
              </div>

              <button disabled={!selectedTime || loading} onClick={handleConfirm} className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-30 transition-all flex items-center justify-center">
                {loading ? <div className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Confirmar Agendamento'}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95">
              <div className="size-20 bg-whatsapp/10 text-whatsapp rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[40px]">check_circle</span>
              </div>
              <div>
                <h4 className="font-black text-xl dark:text-white">Agendado com Sucesso!</h4>
                <p className="text-slate-500 text-xs mt-1">Anote seu protocolo: <span className="font-black text-primary">{protocol}</span></p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-4">Iniciamos uma conversa no WhatsApp para confirmação final.</p>
              <button onClick={onClose} className="w-full h-14 bg-whatsapp text-white rounded-2xl font-black shadow-xl">Fechar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
