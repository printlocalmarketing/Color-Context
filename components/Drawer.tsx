import React from 'react';
import { Signal, AppMode } from '../types';

interface DrawerProps {
  signal: Signal | null;
  mode: AppMode;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ signal, mode, onClose }) => {
  if (!signal) return null;

  // Determine if this is a "danger" sign based on the AI's risk assessment
  const isCritical = signal.riskLevel === 'critical' || signal.label.toLowerCase().includes('pink');

  return (
    <div className="fixed inset-0 z-[120] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      {/* Side Panel */}
      <div className={`
        relative w-full max-w-md h-full flex flex-col gap-6 p-8 shadow-2xl animate-in slide-in-from-right duration-500
        ${isCritical ? 'bg-[#0f0a0a] border-l-4 border-red-600' : 'bg-[#121212] border-l border-white/10'}
      `}>
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-[0.2em] 
            ${isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-black'}`}>
            {mode === 'cooking' ? 'Cooking Insight' : 'Shopping Signal'}
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 active:scale-90 transition-all"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Visual Sign Box */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-white/5 text-white/40 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">The Observation</span>
            {isCritical && (
              <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/30">
                Action Required
              </span>
            )}
          </div>
          <div className={`rounded-3xl p-8 border-4 ${isCritical ? 'bg-white border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'bg-white border-black'}`}>
            <p className="text-black italic font-black text-2xl tracking-tight leading-tight">
              "{signal.label}"
            </p>
          </div>
        </div>

        {/* What it Means Box */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
             <i className={`fa-solid ${isCritical ? 'fa-triangle-exclamation text-red-500' : 'fa-wand-magic-sparkles text-blue-400'}`}></i>
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">AI Translation</span>
          </div>
          <div className={`rounded-3xl p-8 border ${isCritical ? 'bg-red-950/20 border-red-500/20' : 'bg-zinc-900/80 border-white/5'}`}>
            <p className="text-white font-bold text-xl leading-relaxed">
              {signal.description}
            </p>
          </div>
        </div>

        {/* Action Recommendation for Testers */}
        {isCritical && (
          <div className="p-6 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-2xl flex gap-4 items-start">
             <i className="fa-solid fa-temperature-three-quarters text-yellow-500 mt-1"></i>
             <div className="space-y-1">
               <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Recommendation</p>
               <p className="text-white/80 text-xs font-bold leading-snug">Visual markers alone cannot confirm safety. Use a probe thermometer to verify internal temperature.</p>
             </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-auto bg-black/40 border border-white/5 rounded-3xl p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 opacity-60">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-[10px] text-white"></i>
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-white">Safety Protocol</span>
          </div>
          <p className="text-[12px] text-white/30 leading-relaxed font-bold uppercase tracking-tight">
            Color Context is a visual guide. Final safety decisions must be based on FDA-approved cooking methods and temperature verification.
          </p>
        </div>
      </div>
    </div>
  );
};
