import React from 'react';
import { ThemeMode } from '../types';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void; // Added for liability tracking
  theme: ThemeMode;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose, onAgree, theme }) => {
  const standards = [
    { item: 'Poultry', temp: '165°F', note: 'Chicken, Turkey, Duck' },
    { item: 'Ground Meats', temp: '160°F', note: 'Beef, Pork, Lamb' },
    { item: 'Steaks / Roasts', temp: '145°F', note: 'Beef, Lamb + 3 min rest' },
    { item: 'Fish / Seafood', temp: '145°F', note: 'Finfish' },
  ];

  const currentMode = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  const isDark = currentMode === 'dark';

  const handleAgree = () => {
    if (onAgree) onAgree();
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg z-[70] 
        transition-all duration-500 transform
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        p-8 flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[2.5rem]
        border-4 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}
      `}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <i className={`fa-solid fa-shield-halved text-2xl ${isDark ? 'text-white' : 'text-black'}`}></i>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Safety Standards</h2>
          </div>
          <button 
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all border-2 ${isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}
          >
            <i className="fa-solid fa-xmark text-lg font-black"></i>
          </button>
        </div>

        {/* AI & LIABILITY WARNING - NEW SECTION */}
        <div className={`mb-6 p-5 border-2 rounded-2xl ${isDark ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-yellow-600/30 bg-yellow-50/50'}`}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-yellow-600 italic underline">⚠️ AI Disclosure & Liability</h3>
          <p className="text-[11px] font-bold leading-relaxed uppercase opacity-80">
            This app uses <span className="underline italic">Artificial Intelligence</span> to analyze visual signals. AI is subject to errors and "coordinate drift" where markers land off-target. This is a <span className="underline italic">visual aid only</span> and not a safety guarantee. You are responsible for your own food safety.
          </p>
        </div>

        <div className={`overflow-hidden rounded-2xl border-4 ${isDark ? 'border-white bg-black' : 'border-black bg-white'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.2em] ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <th className="px-6 py-3 font-black">Item</th>
                <th className="px-6 py-3 font-black text-right">Min Temp</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/20' : 'divide-black/20'}`}>
              {standards.map((s, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">
                    <div className="font-black text-base uppercase tracking-tight leading-none">{s.item}</div>
                    <div className={`text-[9px] uppercase tracking-widest mt-1 opacity-60`}>{s.note}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-xl font-mono text-right">{s.temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MANDATORY ACTION BUTTON */}
        <button
          onClick={handleAgree}
          className={`mt-8 py-4 font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all active:scale-95 border-4
            ${isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-black hover:bg-zinc-800'}`}
        >
          I Understand & Agree
        </button>
      </div>
    </>
  );
};
