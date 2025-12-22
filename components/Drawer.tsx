import React from 'react';
import { Signal, AppMode } from '../types';

interface DrawerProps {
  signal: Signal | null;
  mode: AppMode;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ signal, mode, onClose }) => {
  if (!signal) return null;

  // Identify protein type to show the right icon
  const getProteinInfo = () => {
    const text = (signal.label + signal.description).toLowerCase();
    if (text.includes('beef') || text.includes('steak') || text.includes('cow')) 
      return { icon: 'fa-cow', label: 'Beef Analysis' };
    if (text.includes('fish') || text.includes('salmon') || text.includes('seafood')) 
      return { icon: 'fa-fish', label: 'Fish Analysis' };
    if (text.includes('poultry') || text.includes('chicken') || text.includes('turkey')) 
      return { icon: 'fa-kiwi-bird', label: 'Poultry Analysis' };
    
    return { icon: 'fa-magnifying-glass', label: 'Visual Analysis' };
  };

  const protein = getProteinInfo();
  const isCritical = signal.riskLevel === 'critical';

  return (
    <div className="fixed inset-0 z-[120] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Side Panel */}
      <div className={`
        relative w-full max-w-md h-full flex flex-col gap-6 p-8 shadow-2xl animate-in slide-in-from-right duration-500
        ${isCritical ? 'bg-[#0f0a0a] border-l-4 border-red-600' : 'bg-[#121212] border-l border-white/10'}
      `}>
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-[0.2em] 
            ${isCritical ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>
            <i className={`fa-solid ${protein.icon}`}></i>
            {protein.label}
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Visual Sign Box */}
        <div className="flex flex-col gap-3">
          <span className="bg-white/5 text-white/40 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 w-fit">The Observation</span>
          <div className={`rounded-3xl p-8 border-4 ${isCritical ? 'bg-white border-red-600' : 'bg-white border-black'}`}>
            <p className="text-black italic font-black text-2xl tracking-tight leading-tight">
              "{signal.label}"
            </p>
          </div>
        </div>

        {/* AI Translation Box */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">AI Translation</span>
          <div className={`rounded-3xl p-6 border ${isCritical ? 'bg-red-950/20 border-red-500/20' : 'bg-zinc-900/80 border-white/5'}`}>
            <p className="text-white font-bold text-lg leading-relaxed">
              {signal.description}
            </p>
          </div>
        </div>

        {/* Share Button (For Testing Feedback) */}
        <button
          onClick={() => {
            const summary = `Color Context Report\nProtein: ${protein.label}\nSignal: ${signal.label}\n${signal.description}`;
            if (navigator.share) {
              navigator.share({ title: 'Color Context Report', text: summary });
            } else {
              navigator.clipboard.writeText(summary);
              alert('Report copied to clipboard!');
            }
          }}
          className="mt-4 w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-share-nodes"></i>
          Share This Report
        </button>

        {/* Recommendation Box */}
        {isCritical && (
          <div className="p-5 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-2xl flex gap-4">
             <i className="fa-solid fa-temperature-three-quarters text-yellow-500 mt-1"></i>
             <p className="text-white/80 text-[11px] font-bold leading-snug">Visual markers alone cannot confirm safety. Use a probe thermometer to verify internal temperature.</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-auto bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Safety Protocol</span>
          <p className="text-[11px] text-white/20 leading-relaxed font-bold uppercase">
            Color Context is a visual guide. Final safety decisions must be based on FDA-approved methods.
          </p>
        </div>
      </div>
    </div>
  );
};
