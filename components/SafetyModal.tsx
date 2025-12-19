
import React from 'react';
import { ThemeMode } from '../types';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose, theme }) => {
  const standards = [
    { item: 'Poultry', temp: '165°F', note: 'Chicken, Turkey, Duck' },
    { item: 'Ground Meats', temp: '160°F', note: 'Beef, Pork, Lamb' },
    { item: 'Steaks / Roasts', temp: '145°F', note: 'Beef, Lamb + 3 min rest' },
    { item: 'Fish / Seafood', temp: '145°F', note: 'Finfish' },
  ];

  // Resolve system theme if necessary
  const currentMode = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  const isDark = currentMode === 'dark';

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg z-[70] 
        transition-all duration-500 transform
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        p-8 flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[2.5rem]
        border-4 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}
      `}>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <i className={`fa-solid fa-temperature-half text-2xl ${isDark ? 'text-white' : 'text-black'}`}></i>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Safety Standards</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all border-4 border-black bg-white text-black shadow-xl"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-xl font-black"></i>
          </button>
        </div>

        <div className={`overflow-hidden rounded-2xl border-4 ${isDark ? 'border-white bg-black' : 'border-black bg-white'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <th className="px-6 py-4 font-black">Item</th>
                <th className="px-6 py-4 font-black">Min Internal Temp</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/20' : 'divide-black/20'}`}>
              {standards.map((s, idx) => (
                <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                  <td className="px-6 py-5">
                    <div className={`font-black text-lg uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{s.item}</div>
                    <div className={`text-[10px] uppercase tracking-widest mt-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>{s.note}</div>
                  </td>
                  <td className={`font-black text-2xl font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                    {s.temp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`mt-10 p-4 border-2 rounded-xl ${isDark ? 'border-white/20' : 'border-black/20'}`}>
          <p className={`text-[11px] font-black leading-relaxed text-center uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-black'}`}>
            Source: FDA Food Safety Guidelines
          </p>
        </div>
      </div>
    </>
  );
};
