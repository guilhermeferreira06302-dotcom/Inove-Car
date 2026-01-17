
import React, { useState } from 'react';
import { Service } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onConfirm: (date: string, time: string, name: string, phone: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service, onConfirm }) => {
  const [step, setStep] = useState<'datetime' | 'details'>('datetime');
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  if (!isOpen || !service) return null;

  // Reset state when closing/opening
  const handleClose = () => {
    setStep('datetime');
    setSelectedTime(null);
    setUserName('');
    setUserPhone('');
    onClose();
  };

  // Gerar os próximos 14 dias úteis/sábados a partir de AMANHÃ (pulando domingos)
  const getUpcomingDays = () => {
    const now = new Date();
    const days = [];
    let counter = 1;
    
    // Busca os próximos 14 dias válidos (não-domingos)
    while (days.length < 14) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + counter);
      
      // getDay() retorna 0 para Domingo
      if (d.getDay() !== 0) {
        days.push({
          dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
          dayNum: d.getDate(),
          fullDate: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        });
      }
      counter++;
    }
    
    return days;
  };

  const dates = getUpcomingDays();

  const times = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleNextStep = () => {
    if (selectedTime) {
      setStep('details');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (input.length > 11) return; // Limita a 11 dígitos (DDD + 9 números)

    let formatted = '';
    if (input.length > 0) {
      formatted = `(${input.substring(0, 2)}`;
      if (input.length > 2) {
        formatted += `) ${input.substring(2, 7)}`;
        if (input.length > 7) {
          formatted += `-${input.substring(7, 11)}`;
        }
      }
    }
    setUserPhone(formatted);
  };

  const handleFinalConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && userPhone) {
      onConfirm(dates[selectedDate].fullDate, selectedTime!, userName, userPhone);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-400 transition-colors">
        
        {/* Header */}
        <div className="px-5 py-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50">
          <div>
            <h3 className="text-slate-900 dark:text-white text-xl font-black tracking-tight leading-tight">
              {step === 'datetime' ? 'Agendar Horário' : 'Seus Dados'}
            </h3>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest leading-tight">{service.name}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="px-5 py-5 space-y-4 overflow-y-auto max-h-[75vh] scrollbar-hide">
          
          {step === 'datetime' ? (
            <>
              {/* Seleção de Data */}
              <div className="space-y-2">
                <h4 className="text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] px-0.5">Selecione o Dia</h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-0.5 px-0.5">
                  {dates.map((date, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      className={`flex flex-col items-center justify-center min-w-[48px] h-[64px] rounded-xl transition-all duration-300 border-2 ${
                        selectedDate === i 
                        ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-105' 
                        : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-[8px] font-black uppercase mb-0.5 ${selectedDate === i ? 'text-white/70' : ''}`}>{date.dayName}</span>
                      <span className={`text-base font-black ${selectedDate === i ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}>{date.dayNum}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Horário */}
              <div className="space-y-2">
                <h4 className="text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] px-0.5">Horários Disponíveis</h4>
                <div className="grid grid-cols-5 gap-2">
                  {times.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg font-bold text-[11px] transition-all duration-200 border ${
                        selectedTime === time 
                        ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary shadow-inner' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Próximo Passo */}
              <div className="pt-2">
                <button
                  disabled={!selectedTime}
                  onClick={handleNextStep}
                  className={`w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                    selectedTime 
                    ? 'bg-primary text-white shadow-primary/20 active:scale-95' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  Continuar
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleFinalConfirm} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {/* Resumo Seleção */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Data e Hora</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{dates[selectedDate].fullDate} às {selectedTime}</span>
                </div>
                <button type="button" onClick={() => setStep('datetime')} className="text-primary text-[10px] font-bold underline">Alterar</button>
              </div>

              {/* Campos do Formulário */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] px-0.5">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Como podemos te chamar?"
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] px-0.5">WhatsApp / Telefone</label>
                  <input
                    required
                    type="tel"
                    value={userPhone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div className="space-y-1 opacity-60">
                  <label className="text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] px-0.5">Serviço Selecionado</label>
                  <div className="w-full h-12 bg-slate-100 dark:bg-slate-800/30 border-2 border-transparent rounded-xl px-4 flex items-center text-sm font-bold text-slate-600 dark:text-slate-400">
                    {service.name}
                  </div>
                </div>
              </div>

              {/* Botão Finalizar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!userName || userPhone.length < 14}
                  className={`w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                    userName && userPhone.length >= 14
                    ? 'bg-whatsapp text-white shadow-whatsapp/20 active:scale-95' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                   <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.779-.879-2.053-.979-.275-.1-.475-.15-.675.15-.2.3-.775 1.05-.95 1.25-.175.2-.35.225-.651.075-.3-.15-1.266-.467-2.411-1.487-.893-.797-1.495-1.782-1.671-2.081-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.519-.174-.01-.374-.012-.574-.012-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.125 4.527.716.309 1.274.494 1.708.633.719.229 1.373.197 1.89.119.577-.087 1.779-.727 2.029-1.429.25-.701.25-1.301.175-1.429-.075-.125-.275-.2-.575-.35z"></path>
                  </svg>
                  Finalizar Agendamento
                </button>
                <p className="text-center text-slate-500 dark:text-slate-400 text-[8px] font-medium leading-tight mt-2">
                  Um atendente entrará em contato com você <br/> no número informado para confirmar.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
