
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

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_WIDTH) {
            width *= MAX_WIDTH / height;
            height = MAX_WIDTH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImage(compressed);
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
    setResult(null);
    try {
      const analysis = await analyzeCarCondition(image);
      setResult(analysis);
    } catch (err: any) {
      console.error("Erro no modal:", err);
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => (
      part.startsWith('**') && part.endsWith('**') 
        ? <strong key={i} className="text-slate-900 dark:text-white font-black">{part.slice(2, -2)}</strong> 
        : part
    ));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-slate-900 dark:text-white text-sm font-bold">Análise com IA</h3>
          <button disabled={loading} onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-950 scrollbar-hide">
          {!image ? (
            <div 
              onClick={() => !loading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-slate-50 dark:bg-slate-900/30"
            >
              <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">add_a_photo</span>
              <p className="text-slate-500 text-xs font-medium text-center">Envie uma foto para análise inteligente</p>
              <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-900 border-2 border-primary/20">
              <img src={image} alt="Veículo" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  <p className="text-primary font-black text-[10px] tracking-widest uppercase">Escaneando...</p>
                </div>
              )}
              {!loading && !result && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                  <button onClick={runAnalysis} className="w-full h-10 bg-primary text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Analisar agora
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-[11px] font-medium animate-in shake duration-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {error}
              </div>
              <button onClick={() => { setError(null); runAnalysis(); }} className="mt-2 font-bold underline block">Tentar novamente</button>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="px-3 py-2.5 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-primary font-bold uppercase text-[8px] tracking-widest">Recomendação</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{result.recommendedService}</h4>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {renderFormattedText(result.explanation)}
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="text-[9px] font-bold uppercase text-slate-400 px-1">Necessidades detectadas</h5>
                <ul className="space-y-1">
                  {result.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/40">
                      <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => onScheduleService(result.recommendedService)}
                className="w-full h-12 bg-whatsapp text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-whatsapp/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">calendar_month</span> Agendar Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
