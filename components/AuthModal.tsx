
import React, { useState, useEffect, useRef } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from '../services/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{code: string, message: string, detail: string} | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const recaptchaVerifierRef = useRef<any>(null);

  const setupRecaptcha = () => {
    if (!auth) return;
    const win = window as any;
    
    try {
      const containerId = 'recaptcha-container';
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';
      
      if (win.recaptchaVerifier) win.recaptchaVerifier.clear();

      win.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        'callback': () => console.log("reCAPTCHA Ativo")
      });
      
      recaptchaVerifierRef.current = win.recaptchaVerifier;
    } catch (err) {
      console.error("Erro reCAPTCHA:", err);
    }
  };

  useEffect(() => {
    if (isOpen) setTimeout(setupRecaptcha, 100);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
      // Limpeza padrão
      let digits = phone.replace(/\D/g, '');
      if (digits.startsWith('55') && digits.length > 10) digits = digits.substring(2);
      const finalPhone = `+55${digits}`;

      console.log("Tentando login com:", finalPhone);

      if (!recaptchaVerifierRef.current) setupRecaptcha();
      
      const confirmation = await signInWithPhoneNumber(auth, finalPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setStep('code');
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      
      let detail = "Ocorreu um erro desconhecido.";
      if (err.code === 'auth/internal-error') {
        detail = "O Google bloqueou a requisição. Isso acontece se o 'Identity Platform' não estiver ativo ou se o domínio não estiver autorizado.";
      } else if (err.code === 'auth/invalid-phone-number') {
        detail = "O formato do número não é aceito pelo Firebase.";
      }

      setError({
        code: err.code || 'unknown',
        message: err.message,
        detail
      });
      setupRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      if (name && result.user) await updateProfile(result.user, { displayName: name });
      onClose();
    } catch (err: any) {
      setError({ code: 'invalid-code', message: 'Código inválido.', detail: 'O código de 6 dígitos que você digitou está incorreto.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div id="recaptcha-container" className="hidden"></div>
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-[420px] rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh]">
        <div className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="text-center">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {step === 'phone' ? 'Identificação' : 'Validar Acesso'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {step === 'phone' ? 'Para agendar, precisamos do seu contato' : 'Digite o código de teste 123456'}
            </p>
          </div>

          {error && (
            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-3xl space-y-4 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-[10px] uppercase tracking-widest">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                Checklist de Correção
              </div>
              
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                  {error.detail}
                </p>
                
                <ul className="space-y-2">
                  {[
                    "Clique no botão 'Upgrade to Identity Platform' no console.",
                    "Verifique se o domínio do site está em 'Authorized Domains'.",
                    "Certifique-se de usar 'localhost' e não '127.0.0.1'.",
                    "Confirme se o número no console tem o mesmo formato (ex: +5521...)."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-[10px] text-slate-500 dark:text-slate-400 items-start">
                      <span className="size-1.5 rounded-full bg-amber-400 shrink-0 mt-1"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2 bg-black/5 dark:bg-black/20 rounded-xl font-mono text-[9px] text-slate-500 break-all">
                Error Log: {error.code}
              </div>

              <button 
                onClick={() => setError(null)}
                className="w-full py-2.5 bg-amber-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-amber-600/20"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seu Nome</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary rounded-xl px-4 text-sm font-medium outline-none transition-all dark:text-white" placeholder="Ex: João Silva" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">WhatsApp</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+55</span>
                  <input 
                    required 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 11);
                      let formatted = val;
                      if (val.length > 2) formatted = `(${val.substring(0, 2)}) ${val.substring(2)}`;
                      if (val.length > 7) formatted = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
                      setPhone(formatted);
                    }} 
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary rounded-xl pl-12 pr-4 text-sm font-bold outline-none transition-all dark:text-white tracking-wider" 
                    placeholder="(21) 98548-7257" 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || phone.length < 14} className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-3">
                {loading ? <div className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full" /> : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Entrar Agora
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="space-y-1 text-center">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Código de 6 dígitos</label>
                <input required type="text" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary rounded-2xl px-4 text-3xl font-black text-center outline-none transition-all dark:text-white tracking-[0.4em]" placeholder="000000" />
              </div>

              <button type="submit" disabled={loading || verificationCode.length < 6} className="w-full h-14 bg-whatsapp text-white rounded-2xl font-black shadow-lg shadow-whatsapp/20 active:scale-95 transition-all disabled:opacity-50 mt-2 flex items-center justify-center">
                {loading ? <div className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Confirmar e Acessar'}
              </button>
              
              <button type="button" onClick={() => setStep('phone')} className="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Voltar e corrigir número</button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
             <button onClick={onClose} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
