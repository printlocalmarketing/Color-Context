import React, { useState, useRef, useEffect } from 'react';
import { analyzeImage } from './services/geminiService';
import { audioService } from './services/audioService';
import { Signal, AppMode, ThemeMode } from './types';
import { SignalPoint } from './components/SignalPoint';
import { Drawer } from './components/Drawer';
import { SafetyModal } from './components/SafetyModal';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [mode, setMode] = useState<AppMode>('shopping');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // NEW: Check for existing agreement on load
  useEffect(() => {
    const hasAgreed = localStorage.getItem('color-context-agreed');
    if (!hasAgreed) {
      setIsSafetyOpen(true);
    }
  }, []);

  // Handle agreement from modal
  const handleAgree = () => {
    localStorage.setItem('color-context-agreed', 'true');
    setIsSafetyOpen(false);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    audioService.playClick();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
      setSignals([]);
      setActiveSignal(null);
      setIsAnalyzing(true);
      setError(null);

      try {
        const response = await analyzeImage(base64, mode);
        setSignals(response.signals);
        audioService.playThrum();
      } catch (err: any) {
        setError(err.message || "Something went wrong reading the image.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const triggerUpload = () => {
    audioService.playClick();
    fileInputRef.current?.click();
  };

  const toggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    audioService.setEnabled(nextState);
    audioService.playClick();
  };

  const toggleMode = (newMode: AppMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    audioService.playClick();
    if (image) {
      const triggerAnalyze = async () => {
        setIsAnalyzing(true);
        setSignals([]);
        setActiveSignal(null);
        try {
          const response = await analyzeImage(image, newMode);
          setSignals(response.signals);
          audioService.playThrum();
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsAnalyzing(false);
        }
      };
      triggerAnalyze();
    }
  };

  const selectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
    audioService.playClick();
  };

  const selectSignal = (signal: Signal) => {
    setActiveSignal(signal);
    audioService.playPing();
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 pb-32 ${theme === 'light' ? 'bg-[#f5f5f5] text-gray-900' : 'bg-[#0a0a0a] text-white'}`}>
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${theme === 'light' ? 'bg-blue-200/20' : 'bg-blue-500/10'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] ${theme === 'light' ? 'bg-gray-300/20' : 'bg-white/5'}`} />
      </div>

      <header className="p-6 sm:p-10 flex flex-col sm:flex-row gap-6 justify-between items-center z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center border-2 border-white/20">
            <div className={`w-3 h-3 rounded-full animate-pulse ${theme === 'light' ? 'bg-blue-600' : 'bg-white'}`} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Color Context</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-black">SEE THE SIGNS OTHERS LOOK FOR</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button 
            onClick={() => { setIsSafetyOpen(true); audioService.playClick(); }}
            className="px-5 py-2.5 glass rounded-full text-[10px] uppercase tracking-widest font-black opacity-60 hover:opacity-100 transition-all flex items-center gap-2 border border-white/10"
          >
            <i className="fa-solid fa-shield-halved opacity-40"></i>
            Safety Standards
          </button>

          <div className="glass p-1.5 rounded-full flex gap-1 border border-white/10">
            <button 
              onClick={() => toggleMode('shopping')}
              className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-black transition-all ${mode === 'shopping' ? (theme === 'light' ? 'bg-black text-white' : 'bg-white text-black') : 'opacity-30 hover:opacity-100'}`}
            >
              Shopping
            </button>
            <button 
              onClick={() => toggleMode('cooking')}
              className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-black transition-all ${mode === 'cooking' ? (theme === 'light' ? 'bg-black text-white' : 'bg-white text-black') : 'opacity-30 hover:opacity-100'}`}
            >
              Cooking
            </button>
          </div>

          <div className="flex gap-2 items-center relative" ref={themeMenuRef}>
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`w-11 h-11 rounded-full glass flex items-center justify-center transition-all border border-white/10 ${isThemeMenuOpen ? 'opacity-100 bg-white/20' : 'opacity-60 hover:opacity-100'}`}
              title="Theme Settings"
            >
              <i className="fa-solid fa-gear"></i>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute top-full mt-3 right-0 bg-white dark:bg-black rounded-2xl p-2 flex flex-col gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-black/10 dark:border-white/20 animate-in fade-in zoom-in-95 duration-200 z-50 min-w-[140px]">
                <button onClick={() => selectTheme('light')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${theme === 'light' ? 'bg-black text-white opacity-100' : 'text-gray-600 hover:bg-gray-100 opacity-60'}`}>
                  <i className="fa-solid fa-sun w-4"></i> Light
                </button>
                <button onClick={() => selectTheme('dark')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${theme === 'dark' ? 'bg-white text-black opacity-100' : 'text-gray-400 hover:bg-white/5 opacity-60'}`}>
                  <i className="fa-solid fa-moon w-4"></i> Dark
                </button>
                <button onClick={() => selectTheme('system')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${theme === 'system' ? (theme === 'light' ? 'bg-black text-white' : 'bg-white text-black') : 'text-gray-400 hover:bg-white/5 opacity-60'}`}>
                  <i className="fa-solid fa-circle-half-stroke w-4"></i> System
                </button>
              </div>
            )}

            <button 
              onClick={toggleAudio}
              className={`w-11 h-11 rounded-full glass flex items-center justify-center transition-all border border-white/10 ${isAudioEnabled ? 'opacity-100 text-blue-500' : 'opacity-20'}`}
            >
              <i className={`fa-solid ${isAudioEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-6 max-w-5xl mx-auto w-full pt-4">
        {!image ? (
          <div className="w-full aspect-video flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto border-4 border-black shadow-2xl">
                <i className="fa-solid fa-camera text-2xl"></i>
              </div>
              <div className="space-y-2">
                <h2 className="opacity-40 font-black text-4xl tracking-tighter uppercase">What are we looking at?</h2>
                <p className="opacity-30 text-xs uppercase tracking-[0.5em] font-black">Take a photo to see the meaning.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full relative flex flex-col items-center gap-8">
            {/* DRIFT FIX: Changed to inline-block and block img */}
            <div className="relative inline-block glass rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] border-4 border-black animate-in fade-in zoom-in-95 duration-1000">
              <img 
                src={image} 
                className={`max-w-full h-auto block transition-all duration-1000 ${isAnalyzing ? 'blur-xl opacity-30 grayscale' : 'blur-0 opacity-100 grayscale-0'}`} 
                alt="Source" 
              />
              
              {!isAnalyzing && signals.map(sig => (
                <SignalPoint 
                  key={sig.id} 
                  signal={sig} 
                  isActive={activeSignal?.id === sig.id} 
                  onClick={selectSignal} 
                />
              ))}

              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className={`w-16 h-16 border-[6px] rounded-full animate-spin ${theme === 'light' ? 'border-gray-300 border-t-black' : 'border-white/10 border-t-white'}`} />
                  <div className="text-center">
                    <p className="text-2xl font-black uppercase tracking-widest mb-2">Analyzing signals...</p>
                    <p className="opacity-40 text-[11px] uppercase tracking-[0.3em] font-black">Scanning for visual identifiers</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="w-full p-5 rounded-2xl bg-black border-2 border-red-500 text-red-500 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-bottom-2">
                <i className="fa-solid fa-circle-exclamation text-xl"></i>
                <p className="uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className={`transition-opacity duration-1000 ${isAnalyzing ? 'opacity-0' : 'opacity-100'}`}>
              <p className="opacity-40 text-xs tracking-[0.4em] uppercase font-black bg-black/5 px-6 py-2 rounded-full">
                {signals.length > 0 ? "Tap markers for high-contrast translation" : "Translating scene..."}
              </p>
            </div>
          </div>
        )}
      </main>

      <div className={`fixed bottom-0 left-0 right-0 p-8 z-40 pt-16 ${theme === 'light' ? 'bg-gradient-to-t from-white via-white/90 to-transparent' : 'bg-gradient-to-t from-black via-black/90 to-transparent'}`}>
        <div className="max-w-md mx-auto">
          <button 
            onClick={triggerUpload}
            className={`w-full h-20 rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all duration-300 border-4 border-black ${theme === 'light' ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            <i className="fa-solid fa-camera text-2xl"></i>
            <span className="text-sm uppercase tracking-[0.2em] font-black">
              {image ? 'TAKE OR UPLOAD NEW PHOTO' : 'TAKE OR UPLOAD PHOTO'}
            </span>
          </button>
          
          <div className="mt-6 text-center text-[10px] opacity-20 uppercase tracking-[0.5em] font-black hidden sm:block">
            <span className="block mb-1">Color Context's Note</span>
            <p>Color Context is a visual guide. For final safety, please follow standard cooking instructions or food safety guidelines.</p>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      <Drawer signal={activeSignal} mode={mode} onClose={() => setActiveSignal(null)} />
      
      {/* Updated SafetyModal call with onAgree handler */}
      <SafetyModal 
        isOpen={isSafetyOpen} 
        onClose={() => setIsSafetyOpen(false)} 
        onAgree={handleAgree}
        theme={theme} 
      />
    </div>
  );
};

export default App;
