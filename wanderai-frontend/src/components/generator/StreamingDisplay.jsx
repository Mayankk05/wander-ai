import { useState, useEffect } from 'react';
import { Check, Bot, X, Search, MapPin, ShieldCheck, Activity, Sparkles, Binary } from 'lucide-react';

export default function StreamingDisplay({ statusMessage, progress }) {
  const [typedMessage, setTypedMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const steps = [
    { id: 1, label: 'Analyzing Destination', keywords: ['Understanding', 'Analyzing', 'Parse'], icon: Search },
    { id: 2, label: 'Designing Schedule', keywords: ['Generating', 'Structuring', 'Planning'], icon: Binary },
    { id: 3, label: 'Mapping Locations', keywords: ['Finding', 'coordinates', 'geocoding', 'Mapping'], icon: MapPin },
    { id: 4, label: 'Checking Details', keywords: ['Validating', 'Optimizing', 'Checking'], icon: ShieldCheck },
    { id: 5, label: 'Polishing Itinerary', keywords: ['weather', 'finishing', 'Wrapping', 'Enriching'], icon: Sparkles },
  ];

  const getStepStatus = (step) => {
    const active = step.keywords.some(k => statusMessage?.toLowerCase().includes(k.toLowerCase()));
    const stepProgress = steps.indexOf(step) * 20 + 20;
    
    if (progress >= stepProgress) return 'completed';
    if (active) return 'active';
    return 'pending';
  };

  const completedCount = steps.filter(s => getStepStatus(s) === 'completed').length;

  useEffect(() => {
    setShowMessage(false);
    setTypedMessage('');
    const timer = setTimeout(() => {
      setShowMessage(true);
      if (statusMessage) {
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i < statusMessage.length) {
            setTypedMessage(statusMessage.slice(0, i + 1));
            i++;
          } else {
            clearInterval(typeInterval);
          }
        }, 15);
        return () => clearInterval(typeInterval);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  // Multi-color Step Assist
  const getStepColor = (idx, status) => {
    const colors = ['text-azure', 'text-emerald', 'text-amber-500', 'text-rose-500', 'text-violet-500'];
    return status === 'active' || status === 'completed' ? colors[idx] : 'text-white/20';
  };

  const getStepBg = (idx, status) => {
    const bgColors = ['bg-azure', 'bg-emerald', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
    return status === 'completed' ? bgColors[idx] : status === 'active' ? 'bg-white' : 'bg-white/5';
  };

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      
      {/* Deep Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.05)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.02)_0%,transparent_50%)] pointer-events-none animate-pulse-slow" />

      <div className="w-full max-w-3xl relative z-10 flex flex-col items-center">
        
        {/* === SPECTRAL HEADER === */}
        <div className="text-center mb-10 animate-reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-6 shadow-glass">
            <Activity size={12} className="text-emerald animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-parchment-100">Progress</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-parchment-100 tracking-tight uppercase mb-4">
            Planning Your <span className="text-emerald italic">Trip</span>
          </h2>
        </div>

        {/* === SPECTRAL CARD === */}
        <div className="w-full bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 p-10 md:p-14 shadow-glass relative overflow-visible animate-reveal delay-200">
          
          {/* Compressed Header */}
          <div className="flex items-center justify-between gap-8 mb-12 relative z-10">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-glass">
                  <Bot size={28} className="text-emerald animate-bounce" />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-parchment-100/30 uppercase tracking-[0.3em]">Current Step</p>
                  <p className={`text-2xl font-bold uppercase tracking-tight ${getStepColor(Math.min(completedCount, steps.length - 1), 'active').replace('text-', 'text-glow-')}`}>
                    {steps[Math.min(completedCount, steps.length - 1)].label}
                  </p>
               </div>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] font-bold text-parchment-100/30 uppercase tracking-[0.3em]">Progress</p>
              <p className="text-5xl font-bold tracking-tighter text-parchment-100">{progress}%</p>
            </div>
          </div>

          {/* === MULTI-COLOR PIPELINE === */}
          <div className="grid grid-cols-5 gap-6 mb-12 relative z-10">
            {steps.map((step, idx) => {
              const status = getStepStatus(step);
              const colorBase = getStepColor(idx, 'active').replace('text-', '');
              const Icon = step.icon;
              return (
                <div key={step.id} className="group relative flex flex-col items-center">
                  {/* Spectral Beam */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-[60%] right-[-40%] top-7 h-1 bg-white/5 hidden md:block overflow-hidden rounded-full">
                       <div className={`h-full transition-all duration-1000 ${status === 'completed' ? 'translate-x-0' : '-translate-x-full'} bg-gradient-to-r from-${colorBase} to-emerald`} />
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 relative z-10 border-2 ${
                    status === 'completed' 
                      ? `bg-${colorBase} border-white/20 text-white shadow-glow-${colorBase} scale-105` 
                      : status === 'active'
                        ? `bg-white border-${colorBase} text-${colorBase} shadow-glow-${colorBase} scale-110 -translate-y-1`
                        : 'bg-white/5 border-white/10 text-parchment-100/10'
                  }`}>
                    {status === 'completed' ? (
                      <Check size={24} strokeWidth={4} />
                    ) : (
                      <Icon size={24} strokeWidth={3} className={status === 'active' ? 'animate-pulse' : ''} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* === STATUS MINI-BOX === */}
          <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 relative z-10 shadow-inner">
            <div className="min-h-[3rem] text-center w-full">
              <p className="text-xl font-bold text-parchment-100 uppercase tracking-tight leading-tight italic">
                {showMessage ? (typedMessage || 'STARTING...') : ''}
              </p>
            </div>

            {/* Micro Bar */}
            <div className="mt-8 w-full h-1.5 bg-white/5 rounded-full relative overflow-hidden">
               <div 
                 className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out shadow-glow-emerald bg-gradient-to-r from-azure to-emerald`}
                 style={{ width: `${progress}%` }} 
               />
            </div>
          </div>
        </div>

        {/* === MINI FOOTER === */}
        <div className="mt-12 flex flex-col items-center gap-4 animate-reveal delay-500">
           <button 
             onClick={() => window.location.reload()}
             className="text-[10px] font-bold uppercase tracking-[0.3em] text-parchment-100/30 hover:text-rose-500 transition-all flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-rose-500/5"
           >
             <X size={14} />
             CANCEL PLANNING
           </button>
        </div>
      </div>
    </div>
  );
}
