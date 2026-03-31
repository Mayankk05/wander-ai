import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { authAPI } from '../../api';
import axios from 'axios';

export default function StatusBanner() {
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        // We use a direct axios call to avoid interceptor noise for a background check
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/ai-status`);
        setStatus(res.data);
      } catch {
        setStatus({ summary: 'Status unavailable' });
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!status || !isVisible) return null;

  const isHealthy = status.summary?.includes('available') && !status.summary?.startsWith('0');

  return (
    <div className="max-w-7xl mx-auto px-6 mb-6 animate-fade-in">
      <div className={`flex items-center justify-between p-4 px-6 rounded-[2rem] border transition-all duration-500 shadow-glass backdrop-blur-xl ${
        isHealthy 
          ? 'bg-white/5 border-white/5 hover:border-emerald/20' 
          : 'bg-red-500/10 border-red-500/20 hover:border-red-500/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl scale-90 ${isHealthy ? 'bg-emerald/10 text-emerald' : 'bg-red-100 text-red-400'}`}>
            {isHealthy ? <Sparkles size={16} /> : <AlertCircle size={16} />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-parchment-100 uppercase tracking-tighter">System Status</span>
            <span className={`text-[8px] font-black uppercase tracking-widest ${isHealthy ? 'text-emerald' : 'text-red-400'}`}>
              {status.summary}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-white/5 rounded-xl transition-all text-parchment-100/10 hover:text-parchment-100/30"
        >
          <ChevronRight size={14} className="rotate-90 md:rotate-0" />
        </button>
      </div>
    </div>
  );
}
