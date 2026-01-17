
import React, { useState, useEffect } from 'react';
import { SERVICES, TRUST_BADGES } from './constants';
import { Service } from './types';
import AnalysisModal from './components/AnalysisModal';
import BookingModal from './components/BookingModal';

const App: React.FC = () => {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const phoneNumber = '555192438084';
  const logoUrl = "https://i.postimg.cc/x1phGT2v/Chat-GPT-Image-15-de-jan-de-2026-07-06-57.png";
  const instagramUrl = "https://www.instagram.com/inove.car_/following/"; // URL atualizada conforme solicitação

  // Sincroniza o estado do tema com a classe no HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleScheduleFromAnalysis = (serviceName: string) => {
    // Tenta encontrar o serviço pelo nome retornado pela IA
    const service = SERVICES.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase())) || SERVICES[0];
    setSelectedService(service);
    setIsAnalysisOpen(false);
    setIsBookingOpen(true);
  };

  const handleGeneralWhatsApp = () => {
    const message = "Olá! Gostaria de tirar algumas dúvidas sobre os serviços da Inove Car.";
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const scrollToServices = () => {
    document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const scrollToLocation = () => {
    document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const confirmBooking = (date: string, time: string, name: string, phone: string) => {
    if (!selectedService) return;
    
    // Organiza a mensagem na ordem: Nome, WhatsApp, Data, Hora e Serviço
    const message = `Olá! Gostaria de solicitar um agendamento:\n\n*Cliente:* ${name}\n*WhatsApp:* ${phone}\n*Data:* ${date}\n*Hora:* ${time}\n*Serviço:* ${selectedService.name}\n\nPor favor, confirme se este horário está disponível.`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsBookingOpen(false);
  };

  const businessHours = [
    { day: 'Segunda-feira', hours: '08:00 - 18:00' },
    { day: 'Terça-feira', hours: '08:00 - 18:00' },
    { day: 'Quarta-feira', hours: '08:00 - 18:00' },
    { day: 'Quinta-feira', hours: '08:00 - 18:00' },
    { day: 'Sexta-feira', hours: '08:00 - 18:00' },
    { day: 'Sábado', hours: '08:00 - 12:00' },
    { day: 'Domingo', hours: 'Fechado', closed: true },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto shadow-2xl bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="relative w-[300px] h-full bg-background-light dark:bg-background-dark shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900/40">
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Menu</h3>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-between p-5 overflow-hidden">
              <div className="space-y-6">
                {/* Horários */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                    <h4 className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Horários de Funcionamento</h4>
                  </div>
                  <div className="space-y-2.5">
                    {businessHours.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.day}</span>
                        <span className={`text-xs font-black ${item.closed ? 'text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md' : 'text-slate-900 dark:text-slate-200'}`}>
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links de Atalho */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Navegação</h4>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={scrollToServices}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98] font-bold text-sm shadow-sm"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
                      Ver Serviços
                    </button>
                    <button 
                      onClick={scrollToLocation}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98] font-bold text-sm shadow-sm"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                      Nossa Localização
                    </button>
                    <button 
                      onClick={() => { window.open(instagramUrl, '_blank'); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98] font-bold text-sm shadow-sm"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">photo_camera</span>
                      Instagram
                    </button>
                    <button 
                      onClick={() => { handleGeneralWhatsApp(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98] font-bold text-sm shadow-sm"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">chat</span>
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800/60 opacity-60">
                <div className="flex items-center gap-2">
                  <img src={logoUrl} alt="Logo" className="size-6 rounded-md object-cover shadow-sm" />
                  <span className="font-brand font-black text-[10px] uppercase tracking-widest">Inove Car</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TopAppBar */}
      <nav className="sticky top-0 z-50 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={toggleTheme}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 active:scale-90 transition-all duration-200"
          aria-label="Alternar tema"
        >
          <span className="material-symbols-outlined text-[24px]">
            {isDarkMode ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        
        <div className="flex items-center justify-center gap-2.5 flex-1">
          <img src={logoUrl} alt="Logo" className="size-10 rounded-xl object-cover shadow-lg shadow-primary/25 shrink-0" />
          <h2 className="text-slate-900 dark:text-white text-xl font-brand font-black leading-tight tracking-tighter uppercase transition-colors duration-300">
            Inove Car
          </h2>
        </div>

        <div className="flex w-10 items-center justify-end">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-transparent text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        </div>
      </nav>

      {/* HeroSection */}
      <div className="relative">
        <div className="flex min-h-[400px] flex-col gap-4 bg-cover bg-center bg-no-repeat items-center justify-center pt-12 pb-3 px-6 text-center" 
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5) 0%, ${isDarkMode ? 'rgba(13, 18, 26, 0.98)' : 'rgba(246, 247, 248, 0.98)'} 100%), url("https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop")`
          }}>
          <div className="mt-auto space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
              <span className="text-primary font-bold text-[10px] uppercase tracking-widest">Tecnologia IA</span>
            </div>
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-[1.1] tracking-tight transition-colors duration-300">
              O <span className="text-primary">Brilho</span> que Seu <br/>
              <span className="text-primary">Veículo Merece.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-normal leading-relaxed max-w-[300px] mx-auto transition-colors duration-300">
              Nossa IA analisa a condição exata do seu veículo para recomendar o tratamento perfeito.
            </p>
          </div>
          
          <div className="flex flex-col w-full gap-3 mt-1">
            <button 
              onClick={scrollToLocation}
              className="flex w-full h-14 items-center justify-center gap-2 overflow-hidden rounded-xl bg-white dark:bg-white text-background-dark text-base font-black leading-normal tracking-wide shadow-xl active:scale-[0.97] hover:bg-slate-100 transition-all duration-200 border border-slate-200"
            >
              <span className="material-symbols-outlined">location_on</span>
              Localização
            </button>
            <button 
              onClick={scrollToServices}
              className="flex w-full h-14 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 active:scale-[0.97] hover:brightness-110 transition-all duration-200"
            >
              <span className="material-symbols-outlined">expand_more</span>
              Ver nossos serviços
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges - Movido para antes dos serviços */}
      <section className="bg-slate-100 dark:bg-slate-900/50 pt-4 pb-4 px-4 transition-colors duration-300">
        <h2 className="text-center text-slate-900 dark:text-white text-[22px] font-black leading-tight tracking-tight mb-6 transition-colors">O Padrão Inove Car</h2>
        <div className="grid grid-cols-2 gap-4">
          {TRUST_BADGES.map((badge, idx) => (
            <div key={idx} className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:border-primary/20 transition-all duration-300 active:scale-95">
              <span className="material-symbols-outlined text-primary mb-3 text-[36px] transition-transform duration-300 group-hover:scale-110">{badge.icon}</span>
              <span className="text-slate-900 dark:text-white text-sm font-bold tracking-tight transition-colors">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="px-4 pt-4 pb-6 scroll-mt-24">
        <div className="mb-5">
          <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight transition-colors duration-300">Nossos Serviços</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Escolha o serviço e agende seu horário.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {SERVICES.map((service) => (
            <div 
              key={service.id} 
              onClick={() => handleServiceClick(service)}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                <span className="material-symbols-outlined text-[28px]">{service.icon}</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">{service.name}</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-snug mt-1">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location Section */}
      <section id="location-section" className="m-4 mt-8 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-black/5 transition-colors duration-300 scroll-mt-24">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 relative overflow-hidden group">
          <img src="https://i.postimg.cc/tTzRrjTS/inovacar-forquetinha.png" alt="Localização" className="w-full h-full object-cover opacity-80 grayscale-[0.2] transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/40"></div>
              <div className="relative bg-primary text-white p-3 rounded-full shadow-2xl border-4 border-white dark:border-slate-900 transition-transform group-hover:scale-125 duration-300">
                <span className="material-symbols-outlined text-[24px]">location_on</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-slate-900 dark:text-white text-xl font-black transition-colors">I love Forquetinha</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">Forquetinha - RS, 95937-000</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Forquetinha+RS', '_blank')}
              className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 active:scale-[0.96] hover:brightness-110 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-sm">directions</span>
              Ver no Mapa
            </button>
            <button 
              onClick={handleGeneralWhatsApp}
              className="px-4 bg-whatsapp text-white rounded-xl flex items-center justify-center active:scale-[0.96] hover:brightness-110 transition-all duration-200 shadow-lg shadow-whatsapp/10"
              aria-label="Contato via WhatsApp"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.779-.879-2.053-.979-.275-.1-.475-.15-.675.15-.2.3-.775 1.05-.95 1.25-.175.2-.35.225-.651.075-.3-.15-1.266-.467-2.411-1.487-.893-.797-1.495-1.782-1.671-2.081-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.519-.174-.01-.374-.012-.574-.012-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.125 4.527.716.309 1.274.494 1.708.633.719.229 1.373.197 1.89.119.577-.087 1.779-.727 2.029-1.429.25-.701.25-1.301.175-1.429-.075-.125-.275-.2-.575-.35z"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-2.5 opacity-50 text-slate-900 dark:text-white hover:opacity-100 transition-opacity duration-300 cursor-default">
          <img src={logoUrl} alt="Logo" className="size-6 rounded-md object-cover shadow-sm" />
          <span className="font-brand font-black text-lg">Inove Car</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed transition-colors">
          &copy; 2025 Inove Car Detailing. Todos os direitos reservados. <br/>
          Cuidado premium para máquinas exclusivas.
        </p>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/80 dark:via-background-dark/80 to-transparent z-[60]">
        <button 
          onClick={() => setIsAnalysisOpen(true)}
          className="w-full h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-black text-lg active:scale-[0.97] hover:brightness-110 transition-all duration-200 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
          <span className="material-symbols-outlined text-2xl relative group-hover:animate-bounce">auto_awesome</span>
          <span className="relative">Analisar meu Veículo</span>
        </button>
      </div>

      {/* Modals */}
      <AnalysisModal 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)} 
        onScheduleService={handleScheduleFromAnalysis}
      />
      
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedService}
        onConfirm={confirmBooking}
      />
    </div>
  );
};

export default App;
