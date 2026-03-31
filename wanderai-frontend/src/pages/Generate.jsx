import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';
import { stream } from '../lib/stream';
import GeneratorInput from '../components/generator/GeneratorInput';
import StreamingDisplay from '../components/generator/StreamingDisplay';
import { CheckCircle2, Loader2, Clock, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export default function Generate() {
  const [pageState, setPageState] = useState('input');
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);

  const { setActiveTrip, addTrip } = useTripStore();
  const updateUser = useAuthStore(state => state.updateUser);
  const navigate = useNavigate();

  const calculateProgress = (msg, serverProgress) => {
    if (serverProgress !== undefined && serverProgress !== null) return serverProgress;
    
    const lower = msg.toLowerCase();
    const steps = [
      { keys: ['understanding', 'getting ready', 'intent'], val: 10 },
      { keys: ['generating', 'creating', 'itinerary'], val: 25 },
      { keys: ['checking', 'mapping', 'geocoding'], val: 50 },
      { keys: ['polishing', 'refining', 'enriching'], val: 70 },
      { keys: ['detail', 'locations', 'summary'], val: 85 },
      { keys: ['almost', 'saving', 'finalizing'], val: 95 }
    ];

    const match = steps.find(s => s.keys.some(k => lower.includes(k)));
    return match ? Math.max(progress, match.val) : progress;
  };

  const handleGenerate = async ({ prompt, tripType, interests }) => {
    setPageState('streaming');
    setStatusMessage('STARTING...');
    setProgress(5);
    setError(null);
    setRateLimited(false);

    await stream({
      url: `${import.meta.env.VITE_API_URL}/trips/generate`,
      method: 'GET',
      params: { prompt, groupType: tripType, interests },
      onStatus: (msg, serverProgress) => {
        setStatusMessage(msg.toUpperCase());
        setProgress(prev => {
           const next = calculateProgress(msg, serverProgress);
           return next > prev ? next : prev;
        });
      },
      onComplete: (data) => {
        const trip = data?.trip || data;
        const user = data?.user || null;

        if (!trip || !trip.id) {
          setError('The trip was created but we couldn\'t load the details. Please check your dashboard.');
          setPageState('input');
          return;
        }

        setProgress(100);
        setStatusMessage('TRIP READY!');
        setActiveTrip(trip);
        addTrip(trip);
        if (user) updateUser(user);
        
        setTimeout(() => {
          setPageState('complete');
          setTimeout(() => {
            navigate(`/trip/${trip.id}`);
          }, 2500);
        }, 1000);
      },
      onError: (err) => {
        setError(err);
        if (typeof err === 'string' && (err.includes('Rate limit') || err.includes('429'))) {
          setRateLimited(true);
        }
        setPageState('input');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  if (pageState === 'complete') {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-8 bg-dashboard-canvas overflow-hidden">
          <div className="w-full max-w-lg bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-10 md:p-12 shadow-glass relative overflow-hidden animate-reveal">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(93,211,158,0.1),transparent)] pointer-events-none" />
             
             <div className="relative z-10 space-y-6">
                <div className="w-20 h-20 bg-emerald/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald/20 shadow-inner">
                  <CheckCircle2 size={40} className="text-emerald animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-parchment-100/40 uppercase tracking-[0.3em]">Planning Complete</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-parchment-100 tracking-tight uppercase leading-tight">
                    Trip <span className="text-emerald italic">Ready</span>
                  </h2>
                  <p className="text-sm font-medium text-parchment-100/60 leading-relaxed max-w-sm mx-auto">
                    Your trip itinerary has been created and is ready to view.
                  </p>
                </div>

                <div className="pt-6 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 shadow-glass">
                     <Loader2 size={14} className="animate-spin text-emerald" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-parchment-100">Opening Trip...</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-40 bg-dashboard-canvas">
        {pageState === 'input' ? (
          <>
            {rateLimited && (
              <div className="max-w-3xl mx-auto px-6 pt-12">
                 <div className="bg-rose-500/10 backdrop-blur-3xl border border-rose-500/20 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-8 animate-reveal shadow-glass">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
                      <Clock size={32} className="text-rose-500" />
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.3em]">Wait a Moment</p>
                      <h3 className="text-2xl font-bold text-parchment-100 uppercase tracking-tight">Please Wait</h3>
                      <p className="text-sm font-medium text-parchment-100/60">You've generated multiple trips quickly. Please wait a moment before creating another one.</p>
                    </div>
                 </div>
              </div>
            )}
            
            <GeneratorInput 
              onGenerate={handleGenerate} 
              error={!rateLimited ? error : null} 
            />
          </>
        ) : (
          <StreamingDisplay 
            statusMessage={statusMessage}
            progress={progress}
          />
        )}
      </div>
    </PageTransition>
  );
}
