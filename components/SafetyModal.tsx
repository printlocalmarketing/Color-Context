import React from 'react';
import { ThemeMode } from '../types';

interface SafetyModalProps {
  isOpen: boolean;
  onAgree: () => void;
  theme: ThemeMode;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onAgree, theme }) => {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Background - Click to close removed for safety */}
      <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100]" />
      
      <div className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-lg z-[110] 
        p-8 flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[3rem]
        border-4 ${isDark ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}
      `}>
        <div className="flex items-center gap-4 mb-8">
          <i className="fa-solid fa-shield-halved text-2xl text-yellow-500"></i>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Safety Standards</h2>
        </div>

        <div className={`mb-6 p-5 border-2 rounded-2xl ${isDark ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-yellow-600/30 bg-yellow-50/50'}`}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-yellow-600 italic underline">⚠️ AI Disclosure & Liability</h3>
          <p className="text-[11px] font-bold leading-relaxed uppercase opacity-80">
            This app uses <span className="underline italic">Artificial Intelligence</span>. AI is subject to errors and "coordinate drift" where markers land off-target. This is a <span className="underline italic">visual aid only</span>. You are responsible for your own food safety.
          </p>
        </div>

        <div className={`overflow-hidden rounded-2xl border-4 ${isDark ? 'border-white bg-black' : 'border-black bg-white'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-right">Min Temp</th>
              </tr>
            </thead>
            <tbody className={`divide-y-4 ${isDark ? 'divide-white' : 'divide-black'}`}>
              {standards.map((s, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">
                    <div className="font-black text-base uppercase tracking-tight">{s.item}</div>
                    <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60 font-bold">{s.note}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-xl font-mono text-right">{s.temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onAgree}
          className={`mt-10 py-5 font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl transition-all active:scale-95 border-4
            ${isDark ? 'bg-white text-black border-white hover:bg-zinc-200 shadow-[0_10px_0_rgb(150,150,150)]' : 'bg-black text-white border-black hover:bg-zinc-800 shadow-[0_10px_0_rgb(50,50,50)]'}`}
        >
          I Understand & Agree
        </button>
      </div>
    </>
  );
};
