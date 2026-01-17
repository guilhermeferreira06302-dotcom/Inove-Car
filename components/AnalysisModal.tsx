
import React, { useState, useRef } from 'react';
import { analyzeCarCondition } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleService: (serviceName: string) => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, onScheduleService }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeCarCondition(image);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleClick = () => {
    if (result) {
      onScheduleService(result.recommendedService);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-900 dark:text-white font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <h3 className="text-slate-900 dark:text-white text-sm font-bold">Análise com IA</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-950 scrollbar-hide">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-slate-50 dark:bg-slate-900/30"
            >
              <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500 mb-2">add_a_photo</span>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium text-center">Envie uma foto para análise inteligente</p>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
          ) : (
            <div className={`relative rounded-xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-900 border-2 border-dashed transition-all shrink-0 ${result ? 'border-primary/20' : 'border-primary/60 shadow-[0_0_15px_rgba(19,127,236,0.1)]'}`}>
              <img src={image} alt="Veículo" className="w-full h-full object-cover" />
              
              {!loading && !result && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 dark:from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-3">
                  <button 
                    onClick={runAnalysis}
                    className="w-full h-10 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span className="text-xs">Analisar agora</span>
                  </button>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-3 border-primary/30 border-t-primary rounded-full" />
                  <p className="text-slate-900 dark:text-white font-bold text-[10px] tracking-widest uppercase">Escaneando...</p>
                </div>
              )}

              {!loading && !result && (
                 <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-black/80 transition-colors border border-white/10"
                 >
                   <span className="material-symbols-outlined text-[16px]">edit</span>
                 </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/10 dark:bg-red-900/20 border border-red-900/20 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-[11px] text-center">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Recommendation Card */}
              <div className="px-3 py-2.5 bg-primary/5 rounded-xl border-2 border-dashed border-primary/20 dark:border-primary/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-primary font-bold uppercase text-[8px] tracking-widest">Recomendação</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5 leading-tight">{result.recommendedService}</h4>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug font-medium">
                  {renderFormattedText(result.explanation)}
                </div>
              </div>

              {/* Issues Summary List */}
              <div className="space-y-1">
                <h5 className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-500 mb-0.5 px-1">Resumo das necessidades</h5>
                <ul className="space-y-1">
                  {result.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                      <span className="material-symbols-outlined text-primary text-[14px] shrink-0">check_circle</span>
                      <span className="leading-tight">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={handleScheduleClick}
                className="w-full h-12 bg-whatsapp text-white rounded-xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-whatsapp/20 active:scale-95 transition-all mt-1"
              >
                <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                Agendar Horário
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
