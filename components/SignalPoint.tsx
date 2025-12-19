
import React from 'react';
import { Signal } from '../types';

interface SignalPointProps {
  signal: Signal;
  onClick: (signal: Signal) => void;
  isActive: boolean;
}

export const SignalPoint: React.FC<SignalPointProps> = ({ signal, onClick, isActive }) => {
  const isCritical = signal.riskLevel !== 'none';

  const renderIcon = () => {
    if (isCritical) {
      return (
        <div className="relative flex items-center justify-center translate-y-[-2px]">
          {/* Yellow Triangle with Thick Black Outline via layering */}
          <i className="fa-solid fa-triangle-exclamation text-black text-3xl"></i>
          <i className="fa-solid fa-triangle-exclamation text-yellow-400 text-[22px] absolute translate-y-[1px]"></i>
          {/* Black Exclamation Point */}
          <i className="fa-solid fa-exclamation text-black absolute text-[12px] font-black mt-2"></i>
        </div>
      );
    }
    // Standard marker: White circle with thick black outline
    return (
      <div className={`
        w-5 h-5 rounded-full bg-white border-[3px] border-black
        ${isActive ? 'scale-110' : 'scale-100'}
        transition-transform duration-300
      `} />
    );
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 z-10 group`}
      style={{ left: `${signal.x}%`, top: `${signal.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={() => onClick(signal)}
    >
      <div className={`
        relative w-10 h-10 flex items-center justify-center
        ${isActive ? 'scale-125' : 'scale-100'}
        hover:scale-125 transition-transform duration-300
      `}>
        {renderIcon()}
        
        {/* Pulsing ring for critical signs - using grayscale/shape to assist color */}
        {isCritical && (
          <div className="absolute inset-0 rounded-full border-2 border-black animate-ping opacity-20 pointer-events-none" />
        )}
        
        {/* Tooltip on hover */}
        {!isActive && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap text-white border-2 border-white/20 shadow-2xl z-20 font-bold uppercase tracking-widest">
            {isCritical ? 'Critical Warning' : 'View Signal'}
          </div>
        )}
      </div>
    </div>
  );
};
