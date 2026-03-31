import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-dashboard-canvas flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40 pointer-events-none" />
        <div className="relative mb-12 animate-fade-in text-[120px] md:text-[200px] font-black leading-none text-white/5 select-none uppercase tracking-tighter">
          404
          <div className="absolute inset-0 flex items-center justify-center translate-y-4">
             <Compass size={80} className="text-white/5 animate-spin-slow" strokeWidth={1} />
          </div>
        </div>
        
        <div className="max-w-md animate-fade-slide-up">
          <h1 className="text-2xl font-black text-parchment-100 uppercase tracking-tighter mb-4">You've reached uncharted territory</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-100/40 mb-12 leading-loose">
            The path you followed doesn't exist in our logs. Let's get you back to the known world.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 bg-parchment-100 text-dashboard-canvas px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all active:scale-95 shadow-glass"
          >
            <ArrowLeft size={14} />
            Back to Safety
          </Link>
        </div>

        {/* Decorative Grid */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[-1]" 
             style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </PageTransition>
  );
}
