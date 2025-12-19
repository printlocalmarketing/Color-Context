
import React from 'react';
import { Signal, AppMode } from '../types';

interface DrawerProps {
  signal: Signal | null;
  mode: AppMode;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ signal, mode, onClose }) => {
  const headerText = mode === 'shopping' ? 'Shopping Insight' : 'Cooking Insight';

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-500 ${signal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-96 glass-card z-50 
        transition-transform duration-500 transform ease-out
        ${signal ? 'translate-x-0' : 'translate-x-full'}
        p-6 sm:p-8 flex flex-col shadow-2xl dark:text-white text-gray-900
      `}>
        <div className="flex justify-between items-center mb-10">
          <div className="px-4 py-2 bg-white dark:bg-black border border-black dark:border-white rounded-lg">
            <span className="text-xs uppercase tracking-[0.3em] font-black text-black dark:text-white">{headerText}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all border-4 border-black bg-white text-black shadow-xl"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-xl font-black"></i>
          </button>
        </div>

        {signal && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700 flex-1 flex flex-col">
            <div className="space-y-4 overflow-y-auto pr-2">
              <section className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded">
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-black dark:text-white">The Visual Sign</h3>
                  </div>
                  {signal.riskLevel !== 'none' && (
                    <span className="text-[9px] uppercase tracking-widest font-black px-2 py-1 rounded bg-yellow-400 text-black border border-black">
                      Critical
                    </span>
                  )}
                </div>
                {/* Responsive high-contrast box: White in light mode, Black in dark mode */}
                <div className="p-5 bg-white dark:bg-black rounded-2xl border-4 border-black dark:border-white shadow-xl opacity-100">
                  <p className="text-black dark:text-white leading-relaxed font-black italic">
                    &ldquo;{signal.observation.replace(/^(The Visual Sign:?\s*|Observation:?\s*)/i, '')}&rdquo;
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <div className="mb-3 px-3 py-1 bg-black dark:bg-white border border-white/20 dark:border-black/20 rounded w-max">
                  <h3 className="text-[10px] uppercase tracking-widest font-black text-white dark:text-black">What It Means</h3>
                </div>
                {/* Responsive high-contrast box: Black in light mode, White in dark mode */}
                <div className="p-5 bg-black dark:bg-white rounded-2xl border-4 border-white/20 dark:border-black shadow-xl opacity-100">
                  <p className="text-lg text-white dark:text-black font-black leading-snug">
                    {signal.interpretation.replace(/^(What It Means:?\s*|Interpretation:?\s*|The Meaning:?\s*)/i, '')}
                  </p>
                </div>
              </section>
            </div>

            <div className="pt-6 mt-auto">
              <div className="p-5 rounded-2xl bg-black dark:bg-black border-2 border-white/20 space-y-3 opacity-100">
                <div className="flex items-center gap-2 text-white text-[10px]">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span className="uppercase tracking-[0.2em] font-black">Color Context's Note</span>
                </div>
                <p className="text-[11px] text-white/80 leading-normal font-bold">
                  Color Context is a visual guide. For final safety, please follow standard cooking instructions or food safety guidelines.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
