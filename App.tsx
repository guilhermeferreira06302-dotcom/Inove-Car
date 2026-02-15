
import React, { useState, useEffect } from 'react';
import { SERVICES, TRUST_BADGES } from './constants';
import { Service } from './types';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import OpeningHoursModal from './components/OpeningHoursModal';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const logoUrl = "https://i.postimg.cc/x1phGT2v/Chat-GPT-Image-15-de-jan-de-2026-07-06-57.png";
  const whatsappNumber = "555192438084";

  useEffect(() => {
    const savedUser = localStorage.getItem('inove_car_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsBookingOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('inove_car_user');
    setUser(null);
  };

  const handleLocationRedirect = () => {
    // Coordenadas: 29°24'51.4"S 52°03'00.4"W
    const mapsUrl = "https://www.google.com/maps?q=-29.414278,-52.050111";
    window.open(mapsUrl, '_blank');
  };

  // O botão flutuante aparece apenas se nenhum modal estiver aberto
  const isAnyModalOpen = isBookingOpen || isAuthOpen || isHoursOpen;

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto shadow-2xl bg-background-light dark:bg-background-dark overflow-x-hidden pb-12 transition-colors duration-300">
      
      <nav className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-primary size-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
          </button>
          <button onClick={() => setIsHoursOpen(true)} className="text-primary size-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">schedule</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="Logo" className="size-8 rounded-lg" />
          <h2 className="font-brand font-black uppercase text-lg tracking-tighter">Inove Car</h2>
        </div>
        <div>
          {user ? (
            <button onClick={handleLogout} className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg font-black border-2 border-white dark:border-slate-800" title="Clique para sair">
              {user.firstName.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="px-4 h-10 rounded-xl bg-primary text-white font-bold text-xs shadow-lg active:scale-95 transition-all">Entrar</button>
          )}
        </div>
      </nav>

      <header className="relative h-[540px] flex flex-col items-center justify-center text-center px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000" className="w-full h-full object-cover" alt="Fundo" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background-light dark:to-background-dark"></div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-white px-4 py-1.5 rounded-full backdrop-blur-sm border border-primary/30">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Estética Automotiva Premium</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
            O brilho que seu <br/> 
            <span className="text-primary">carro merece.</span>
          </h1>
          <p className="text-slate-300 text-sm font-medium max-w-[280px] mx-auto">
            Agende agora em segundos e garanta o melhor cuidado para seu veículo.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="h-14 px-10 bg-primary text-white rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all w-full"
            >
              <span className="material-symbols-outlined">calendar_month</span> Ver Horários e Agendar
            </button>
            <button 
              onClick={handleLocationRedirect}
              className="h-14 px-10 bg-white/10 text-white rounded-2xl font-black backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition-all w-full"
            >
              <span className="material-symbols-outlined">location_on</span> Localização
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-20 -mt-8 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
          {TRUST_BADGES.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">{badge.icon}</span>
              </div>
              <span className="text-[11px] font-bold dark:text-slate-300 leading-tight">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="services-section" className="px-6 py-12 space-y-8">
        <h2 className="text-2xl font-black tracking-tight">Nossos Serviços</h2>
        <div className="grid gap-4">
          {SERVICES.map((service) => (
            <div key={service.id} onClick={() => handleServiceClick(service)} className="p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex items-center gap-4 cursor-pointer hover:border-primary hover:shadow-lg transition-all group">
              <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[28px]">{service.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{service.name}</h3>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{service.description}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </div>
          ))}
        </div>
      </section>

      {/* Botão Flutuante do WhatsApp */}
      {!isAnyModalOpen && (
        <a 
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[100] size-14 bg-whatsapp text-white rounded-full shadow-2xl flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 hover:scale-110 active:scale-90 transition-all group"
          title="Fale conosco no WhatsApp"
        >
          <div className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-20 group-hover:hidden"></div>
          <span className="material-symbols-outlined text-[28px] relative z-10">chat</span>
        </a>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={setUser} />
      
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        service={selectedService} 
        user={user}
      />

      <OpeningHoursModal 
        isOpen={isHoursOpen}
        onClose={() => setIsHoursOpen(false)}
      />
    </div>
  );
};

export default App;
