
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
    <div className="relative min-h-screen w-full bg-background-light dark:bg-background-dark overflow-x-hidden pb-12 transition-colors duration-300">
      
      {/* Navbar Responsiva */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-primary size-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
            </button>
            <button onClick={() => setIsHoursOpen(true)} className="text-primary size-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">schedule</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <img src={logoUrl} alt="Logo" className="size-8 md:size-10 rounded-lg shadow-sm" />
            <h2 className="font-brand font-black uppercase text-lg md:text-xl tracking-tighter">Inove Car</h2>
          </div>

          <div>
            {user ? (
              <button onClick={handleLogout} className="size-10 md:size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg font-black border-2 border-white dark:border-slate-800 hover:scale-105 transition-transform" title="Clique para sair">
                {user.firstName.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="px-4 md:px-8 h-10 md:h-12 rounded-xl bg-primary text-white font-bold text-xs md:text-sm shadow-lg active:scale-95 transition-all">Entrar</button>
            )}
          </div>
        </div>
      </nav>

      {/* Header Responsivo */}
      <header className="relative h-[540px] md:h-[650px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000" className="w-full h-full object-cover" alt="Fundo" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background-light dark:to-background-dark"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-white px-4 py-1.5 rounded-full backdrop-blur-sm border border-primary/30">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest">Estética Automotiva Premium</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
            O brilho que seu <br className="hidden md:block"/> 
            <span className="text-primary">carro merece.</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-lg font-medium max-w-[280px] md:max-w-[500px] mx-auto leading-relaxed">
            Agende agora em segundos e garanta o melhor cuidado para seu veículo.
          </p>
          <div className="pt-4 flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="h-14 md:h-16 px-10 bg-primary text-white rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto"
            >
              <span className="material-symbols-outlined">calendar_month</span> Ver Horários e Agendar
            </button>
            <button 
              onClick={handleLocationRedirect}
              className="h-14 md:h-16 px-10 bg-white/10 text-white rounded-2xl font-black backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition-all w-full md:w-auto"
            >
              <span className="material-symbols-outlined">location_on</span> Localização
            </button>
          </div>
        </div>
      </header>

      {/* Trust Badges - Grid Adaptável */}
      <section className="relative z-20 -mt-8 md:-mt-12 px-4 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {TRUST_BADGES.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-3 md:gap-4">
              <div className="size-10 md:size-14 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] md:text-[28px]">{badge.icon}</span>
              </div>
              <span className="text-[11px] md:text-sm font-bold dark:text-slate-300 leading-tight uppercase md:tracking-tight">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Serviços Section - Grid Adaptável */}
      <section id="services-section" className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-8 md:space-y-12">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-5xl font-black tracking-tight">Nossos Serviços</h2>
          <p className="text-slate-500 mt-2 font-medium text-sm md:text-lg">Cuidado especializado e resultados impecáveis para seu veículo.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {SERVICES.map((service) => (
            <div key={service.id} onClick={() => handleServiceClick(service)} className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex items-center md:items-start md:flex-col gap-4 md:gap-6 cursor-pointer hover:border-primary hover:shadow-xl transition-all group">
              <div className="size-14 md:size-20 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors shadow-inner">
                <span className="material-symbols-outlined text-[28px] md:text-[40px]">{service.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold md:font-black text-sm md:text-xl group-hover:text-primary transition-colors">{service.name}</h3>
                <p className="text-[11px] md:text-sm text-slate-500 leading-snug md:leading-relaxed mt-0.5 md:mt-2">{service.description}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 md:hidden">chevron_right</span>
              <div className="hidden md:flex mt-auto pt-4 w-full border-t border-slate-100 dark:border-slate-800 items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Agendar</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Responsivo */}
      <footer className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
        <div className="flex items-center gap-2 grayscale">
          <img src={logoUrl} alt="Logo" className="size-6 rounded" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Inove Car © 2024</span>
        </div>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
           <span>Qualidade Premium</span>
           <span>Atendimento VIP</span>
           <span>Garibaldi / RS</span>
        </div>
      </footer>

      {/* Botão Flutuante do WhatsApp */}
      {!isAnyModalOpen && (
        <a 
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] size-14 md:size-18 bg-whatsapp text-white rounded-full shadow-2xl flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 hover:scale-110 active:scale-90 transition-all group"
          title="Fale conosco no WhatsApp"
        >
          <div className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-20 group-hover:hidden"></div>
          <span className="material-symbols-outlined text-[28px] md:text-[36px] relative z-10">chat</span>
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
