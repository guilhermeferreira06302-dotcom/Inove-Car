
import React, { useState, useEffect } from 'react';
import { SERVICES, TRUST_BADGES } from './constants.tsx';
import { Service } from './types.ts';
import BookingModal from './components/BookingModal.tsx';
import AuthModal from './components/AuthModal.tsx';
import AnalysisModal from './components/AnalysisModal.tsx';
import { onAuthStateChanged, signOut, User } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from './services/firebase.ts';
import { addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  
  const phoneNumber = '555192438084';
  const logoUrl = "https://i.postimg.cc/x1phGT2v/Chat-GPT-Image-15-de-jan-de-2026-07-06-57.png";

  useEffect(() => {
    const unsubscribeAuth = auth ? onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) setIsAuthOpen(false);
    }) : () => {};

    let unsubscribeBookings = () => {};

    if (db) {
      const q = collection(db, "bookings");
      // Tratamento de erro robusto para o snapshot global
      unsubscribeBookings = onSnapshot(q, (snapshot) => {
        const slots = snapshot.docs.map(doc => doc.data().slotId);
        setBookedSlots(slots);
      }, (err) => {
        console.warn("⚠️ Firestore: Sem permissão para ler ocupação total. Verifique as Rules no console.", err.message);
      });
    }

    return () => {
      unsubscribeAuth();
      unsubscribeBookings();
    };
  }, []);

  useEffect(() => {
    if (db && user) {
      const qMy = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const unsub = onSnapshot(qMy, (snapshot) => {
        setMyBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => {
        console.warn("⚠️ Firestore: Erro ao carregar agendamentos do usuário.", err.message);
        // Tenta uma query mais simples se a composta falhar (falta de índice ou permissão)
        const qSimple = query(collection(db, "bookings"), where("userId", "==", user.uid));
        onSnapshot(qSimple, (s) => setMyBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
      });
      return () => unsub();
    } else {
      setMyBookings([]);
    }
  }, [user]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const generateProtocol = () => {
    const now = new Date();
    const datePart = now.getFullYear().toString().slice(-2) + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${datePart}-${randomPart}`;
  };

  const handleServiceClick = (service: Service) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const confirmBooking = async (date: string, time: string, name: string, phone: string) => {
    if (!selectedService || !user || !db) return;
    
    const slotId = `${date}-${time}`;
    const protocol = generateProtocol();

    try {
      await addDoc(collection(db, "bookings"), {
        slotId,
        protocolo: protocol,
        date,
        time,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        userId: user.uid,
        userName: user.displayName || name,
        clientPhone: phone || user.phoneNumber,
        userEmail: user.email,
        createdAt: serverTimestamp()
      });

      const message = `🚗 *NOVO AGENDAMENTO - INOVE CAR*\n\n📄 *Protocolo:* ${protocol}\n👤 *Cliente:* ${name || user.displayName}\n📅 *Data:* ${date}\n⏰ *Hora:* ${time}\n🛠️ *Serviço:* ${selectedService.name}\n\n_Favor confirmar este horário._`;
      window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
      
      return protocol;
    } catch (err: any) {
      console.error("Erro no Firebase:", err);
      alert("Erro de permissão no Firestore. Verifique se as Regras (Rules) foram publicadas no console.");
      return undefined;
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto shadow-2xl bg-background-light dark:bg-background-dark overflow-x-hidden pb-12 transition-colors duration-300">
      
      <nav className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-primary size-10 flex items-center justify-center rounded-xl bg-primary/5">
          <span className="material-symbols-outlined">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
        </button>
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="Logo" className="size-8 rounded-lg" />
          <h2 className="font-brand font-black uppercase text-lg tracking-tighter">Inove Car</h2>
        </div>
        <div>
          {user ? (
            <button onClick={() => setIsMenuOpen(true)} className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden font-black border-2 border-white dark:border-slate-800">
              {user.displayName?.charAt(0).toUpperCase() || <span className="material-symbols-outlined text-sm">person</span>}
            </button>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="px-4 h-10 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all">Entrar</button>
          )}
        </div>
      </nav>

      <header className="relative h-[480px] flex flex-col items-center justify-center text-center px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000" className="w-full h-full object-cover" alt="Fundo" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background-light dark:to-background-dark"></div>
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
            Agende seu horário agora e garanta um serviço de excelência.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="h-14 px-10 bg-primary text-white rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all w-full"
            >
              <span className="material-symbols-outlined">calendar_month</span> Ver Horários
            </button>
            <button 
              onClick={() => setIsAnalysisOpen(true)} 
              className="h-14 px-10 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition-all w-full"
            >
              <span className="material-symbols-outlined">auto_awesome</span> Analisar com IA
            </button>
          </div>
        </div>
      </header>

      {/* Trust Badges */}
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

      {/* Services List */}
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

      {/* User Sidebar Menu */}
      {isMenuOpen && user && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-80 h-full bg-white dark:bg-slate-950 p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Minha Conta</h3>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                  {user.displayName?.charAt(0) || <span className="material-symbols-outlined">person</span>}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm truncate">{user.displayName || 'Usuário'}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{user.phoneNumber || user.email || 'Autenticado'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Meus Agendamentos</h5>
                {myBookings.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">event_busy</span>
                    <p className="text-xs text-slate-400 font-medium">Nenhum agendamento encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myBookings.map((bk) => (
                      <div key={bk.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">{bk.protocolo}</span>
                          <span className="text-[10px] font-bold text-slate-400">{bk.date} às {bk.time}</span>
                        </div>
                        <h6 className="font-bold text-xs mb-1">{bk.serviceName}</h6>
                        <p className="text-[10px] text-slate-500">Aguardando confirmação via WhatsApp</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <button onClick={handleLogout} className="w-full h-12 rounded-xl border-2 border-red-500/20 text-red-500 font-bold text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95">Sair da Conta</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        service={selectedService} 
        onConfirm={confirmBooking} 
        bookedSlots={bookedSlots} 
        initialUser={user}
      />
      <AnalysisModal 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)} 
        onScheduleService={(serviceName) => {
          const service = SERVICES.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase())) || SERVICES[0];
          setSelectedService(service);
          setIsAnalysisOpen(false);
          setIsBookingOpen(true);
        }}
      />
    </div>
  );
};

export default App;
