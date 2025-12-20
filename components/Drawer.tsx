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
      {/* Dark backdrop to focus the eye */}
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      
      {/* High-Contrast Content Box */}
      <div className="relative bg-white dark:bg-black rounded-t-[2.5rem] p-8 shadow-2xl border-t-8 border-black dark:border-white">
        <div className="w-16 h-2 bg-gray-300 dark:bg-zinc-800 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black dark:text-white">
              {signal.label || "SIGNAL DETECTED"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl font-black border-4 border-black dark:border-white active:scale-90 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* The Text Box: Pure White on Black (Dark Mode) or Pure Black on White (Light Mode) */}
        <div className="p-8 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border-4 border-black dark:border-white mb-8">
          <p className="text-2xl leading-tight font-black text-black dark:text-white">
            {signal.description}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-xl border-4 border-black dark:border-white active:scale-95 transition-all"
        >
          Dismiss Warning
        </button>
      </div>
    </div>
  );
};
