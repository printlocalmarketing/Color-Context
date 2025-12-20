import React from 'react';
import { Signal, AppMode } from '../types';

interface DrawerProps {
  signal: Signal | null;
  mode: AppMode;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ signal, onClose }) => {
  if (!signal) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Side Panel (AI Studio Style) */}
      <div className="relative w-full max-w-md h-full bg-[#121212] border-l border-white/10 p-8 flex flex-col gap-6 animate-in slide-in-from-right duration-500">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="bg-white text-black px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest">
            Cooking Insight
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10">
            ✕
          </button>
        </div>

        {/* Visual Sign Box */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">The Visual Sign</span>
            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">Critical</span>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <p className="text-black italic font-medium text-lg">
              "{signal.label}"
            </p>
          </div>
        </div>

        {/* What it Means Box */}
        <div className="flex flex-col gap-2">
          <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10 w-fit">What it Means</span>
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
            <p className="text-white font-bold text-lg leading-relaxed">
              {signal.description}
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-auto bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 opacity-60">
            <i className="fa-solid fa-shield-halved text-xs text-white"></i>
            <span className="text-[10px] uppercase font-black tracking-widest text-white">Color Context's Note</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium">
            Color Context is a visual guide. For final safety, please follow standard cooking instructions or food safety guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
