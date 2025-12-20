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
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      
      {/* Content */}
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-t-[2rem] p-8 shadow-2xl border-t border-white/10">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black mb-1">
              Visual Signal
            </h3>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {signal.label || "Information"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
          <p className="text-lg leading-relaxed font-medium">
            {signal.description || "No description provided."}
          </p>
        </div>

        <div className="mt-8">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
