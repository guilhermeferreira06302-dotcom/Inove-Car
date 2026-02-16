import React, { useState, useEffect, useMemo } from 'react';
import { Service } from '../types';
import { bookingService, Slot } from '../services/bookingService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  user: any;
}

const FIXED_HOURS = [
  "08:00", "09:00", "10:00", "11:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service, user }) => {
  const [step, setStep] = useState<'datetime' | 'success'>('datetime');
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [apiSlots, setApiSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewMode, setViewMode] = useState<'months' | 'days'>('days');
  const [currentYear] = useState(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());

  // ✅ Timer para atualizar o status "ENCERRADO" em tempo real
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (isOpen) {
      const id = window.setInterval(() => setNowTick(Date.now()), 60 * 1000);
      return () => window.clearInterval(id);
    }
  }, [isOpen]);

  // ✅ Verifica se o horário já passou (com margem de 20 min) apenas se for hoje
  const isPast = (selectedIsoDate: string, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date(nowTick);
    const slotDate = new Date();
    const [y, m, d] = selectedIsoDate.split("-").map(Number);
    
    slotDate.setFullYear(y, m - 1, d);
    slotDate.setHours(hours, minutes, 0, 0);

    const isToday =
      slotDate.getFullYear() === now.getFullYear() &&
      slotDate.getMonth() === now.getMonth() &&
      slotDate.getDate() === now.getDate();

    if (!isToday) {
      // Se não for hoje, mas for data passada (proteção extra)
      if (slotDate < now) {
        now.setHours(0,0,0,0);
        const dayOnlySlot = new Date(slotDate);
        dayOnlySlot.setHours(0,0,0,0);
        return dayOnlySlot < now;
      }
      return false;
    }

    // Bloqueia 20 min antes do horário
    return now.getTime() > slotDate.getTime() - 20 * 60 * 1000;
  };

  const dates = useMemo(() => {
    const availableDates = [];
    const date = new Date(currentYear, activeMonth, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (date.getMonth() === activeMonth) {
      const day = date.getDay();
      const isSaturday = day === 6;
      
      // Para fins de teste/produção, podemos incluir hoje se o usuário desejar, 
      // mas mantemos a regra de negócio original: Sábados.
      if (isSaturday) {
        if (date >= today) {
          availableDates.push({
            dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', ''),
            dayNum: date.getDate(),
            monthName: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
            fullDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            isoDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          });
        }
      }
      date.setDate(date.getDate() + 1);
    }
    return availableDates;
  }, [activeMonth, currentYear]);

  useEffect(() => {
    if (isOpen && dates.length > 0) {
      if (selectedDateIdx >= dates.length) {
        setSelectedDateIdx(0);
      }
      loadSlots();
    } else if (!isOpen) {
      setStep('datetime');
      setSelectedTime(null);
      setErrorMsg('');
      setSelectedDateIdx(0);
      setShowDatePicker(false);
      setViewMode('days');
      setActiveMonth(new Date().getMonth());
    }
  }, [selectedDateIdx, isOpen, activeMonth, dates.length]);

  const loadSlots = async () => {
    if (!dates[selectedDateIdx]) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const slots = await bookingService.getSlots(dates[selectedDateIdx].isoDate);
      setApiSlots(slots);
    } catch (err) {
      setErrorMsg('Não foi possível carregar os horários.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTime || !user || !service || !dates[selectedDateIdx]) return;
    setLoading(true);
    setErrorMsg('');
    
    const result = await bookingService.createBooking({
      date: dates[selectedDateIdx].isoDate,
      time: selectedTime,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      serviceId: service.id,
      serviceName: service.name
    });

    if (result.success) {
      setProtocol(result.protocol || '');
      setStep('success');
      
      const msg = `🚗 *NOVO AGENDAMENTO INOVE CAR*\n\n📄 *Protocolo:* ${result.protocol}\n👤 *Cliente:* ${user.firstName} ${user.lastName}\n📅 *Data:* ${dates[selectedDateIdx].fullDate}\n⏰ *Hora:* ${selectedTime}\n🛠️ *Serviço:* ${service.name}`;
      window.open(`https://api.whatsapp.com/send?phone=555192438084&text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      setErrorMsg(result.error || "Erro ao realizar agendamento.");
    }
    setLoading(false);
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-[28px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="font-black text-base dark:text-white">
              {step === 'datetime' ? 'Agendar Horário' : 'Confirmado!'}
            </h3>
            <p className="text-primary text-[9px] font-bold uppercase tracking-widest">{service.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-5">
          {step === 'datetime' ? (
            <div className="space-y-4">
              
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    if (!showDatePicker) setViewMode('days');
                  }}
                  className="w-full h-14 bg-slate-100/30 dark:bg-slate-800/50 rounded-2xl px-4 flex items-center justify-between border-2 border-transparent hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase text-slate-400 leading-none tracking-tighter">DATA SELECIONADA</p>
                      <p className="text-sm font-black dark:text-white leading-tight">
                        {dates[selectedDateIdx] 
                          ? `${dates[selectedDateIdx].dayName}. ${dates[selectedDateIdx].dayNum} de ${dates[selectedDateIdx].monthName}.`
                          : 'Escolha uma data'}
                      </p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {showDatePicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                      <button 
                        onClick={() => setViewMode(viewMode === 'days' ? 'months' : 'days')}
                        className="text-[10px] font-black uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-primary/20 transition-all"
                      >
                        {viewMode === 'days' ? MONTHS[activeMonth] : 'Voltar'}
                        <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                      </button>
                      <span className="text-[10px] font-black text-slate-400">{currentYear}</span>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 bg-white dark:bg-slate-900">
                      {viewMode === 'months' ? (
                        <div className="grid grid-cols-3 gap-2 p-4">
                          {MONTHS.map((month, idx) => {
                            const isPastMonth = idx < new Date().getMonth() && currentYear === new Date().getFullYear();
                            return (
                              <button 
                                key={month}
                                disabled={isPastMonth}
                                onClick={() => {
                                  setActiveMonth(idx);
                                  setViewMode('days');
                                }}
                                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${idx === activeMonth ? 'bg-primary text-white shadow-lg' : isPastMonth ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                              >
                                {month.substring(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {dates.length > 0 ? dates.map((date, i) => (
                            <button 
                              key={i} 
                              onClick={() => { setSelectedDateIdx(i); setSelectedTime(null); setShowDatePicker(false); }}
                              className={`w-full px-4 py-4 rounded-2xl flex items-center justify-between transition-all group ${selectedDateIdx === i ? 'bg-primary text-white shadow-xl translate-x-1' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}
                            >
                              <div className="flex items-center gap-6">
                                <span className={`text-[11px] font-black uppercase w-8 tracking-tighter ${selectedDateIdx === i ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
                                  {date.dayName}
                                </span>
                                <span className="text-sm font-black">
                                  {date.dayNum} {date.monthName}.
                                </span>
                              </div>
                              {selectedDateIdx === i && <span className="material-symbols-outlined text-lg">check_circle</span>}
                            </button>
                          )) : (
                            <div className="p-8 text-center space-y-2">
                              <span className="material-symbols-outlined text-slate-300 text-3xl">event_busy</span>
                              <p className="text-[10px] font-black uppercase text-slate-400">Sem horários para este mês</p>
                              <button 
                                onClick={() => setViewMode('months')}
                                className="text-[9px] font-black text-primary underline"
                              >
                                Selecionar outro mês
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative pt-2">
                {loading && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                    <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  {FIXED_HOURS.map((hour) => {
                    const apiSlot = apiSlots.find(s => s.time === hour);
                    const selectedIsoDate = dates[selectedDateIdx]?.isoDate;
                    const past = selectedIsoDate ? isPast(selectedIsoDate, hour) : false;
                    const isOccupied = apiSlot?.status === 'ocupado' || past;
                    const isSelected = selectedTime === hour;

                    return (
                      <button 
                        key={hour} 
                        disabled={isOccupied || loading || !dates[selectedDateIdx]} 
                        onClick={() => setSelectedTime(hour)} 
                        className={`h-16 rounded-2xl font-black text-xs border-2 transition-all flex flex-col items-center justify-center gap-0.5
                          ${isOccupied 
                            ? 'opacity-20 bg-slate-100 dark:bg-slate-800 cursor-not-allowed border-transparent text-slate-400' 
                            : isSelected 
                              ? 'bg-primary border-primary text-white shadow-xl scale-[1.05] z-10 ring-4 ring-primary/20' 
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                          }
                        `}
                      >
                        <span className="text-sm">{past ? "ENCERRADO" : hour}</span>
                        {!isOccupied && !isSelected && <span className="text-[7px] uppercase tracking-widest font-black opacity-40">Livre</span>}
                        {isSelected && <span className="text-[7px] uppercase tracking-widest font-black">Selecionado</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <button 
                disabled={!selectedTime || loading || !dates[selectedDateIdx]} 
                onClick={handleConfirm} 
                className="w-full h-16 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 text-sm mt-4 hover:brightness-110 active:scale-95"
              >
                {loading ? <div className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full" /> : <><span className="material-symbols-outlined text-lg">verified</span> Confirmar Agendamento</>}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-500">
              <div className="size-16 bg-whatsapp/10 text-whatsapp rounded-full flex items-center justify-center mx-auto ring-4 ring-whatsapp/5">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <div>
                <h4 className="font-black text-lg dark:text-white">Reservado!</h4>
                <p className="text-slate-500 text-[11px] mt-1">Protocolo: <span className="font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md select-all">{protocol}</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Enviamos os detalhes para o seu WhatsApp. <br/>Aguardamos você!
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="w-full h-12 bg-whatsapp text-white rounded-[16px] font-black shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm"
              >
                Tudo Certo!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;