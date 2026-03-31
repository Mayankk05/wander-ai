import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, MapPin, AlertCircle, Loader2, Trash2, Archive } from 'lucide-react';
import { tripsAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { useTrips } from '../hooks/useTrips';
import StatsBar from '../components/dashboard/StatsBar';
import TripCard from '../components/dashboard/TripCard';
import SkeletonCard from '../components/shared/SkeletonCard';
import toast from 'react-hot-toast';
import VerifyBanner from '../components/shared/VerifyBanner';
import PageTransition from '../components/shared/PageTransition';

export default function Dashboard() {
  const { trips, isLoading, error, refresh, updateTrip, removeTrip } = useTrips();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await tripsAPI.delete(deleteTarget.id);
      removeTrip(deleteTarget.id);
      toast.success('Trip deleted successfully');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete trip');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, removeTrip]);

  const memoHeader = useMemo(() => (
    <div className="flex flex-col gap-2 mb-10 relative overflow-visible perspective-pro animate-reveal">
      <div className="absolute -top-10 -right-20 w-[400px] h-[400px] opacity-[0.05] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-1000 rotate-12">
        <svg viewBox="0 0 100 100" className="w-full h-full text-vintage_grape-400">
           <path fill="currentColor" d="M30,20 L70,20 L85,50 L70,80 L30,80 L15,50 Z" />
           <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M0,50 Q25,0 50,50 T100,50 M50,0 Q75,50 50,100 T50,0" />
        </svg>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
        <div className="space-y-1.5 tilt-3d">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full shadow-glass hover:shimmer-spectral transition-all cursor-default">
             <Archive size={12} className="text-emerald animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-parchment-100/60">Your Travel Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-parchment-100 tracking-tighter leading-none uppercase">
            Your Saved <span className="text-emerald italic">Trips</span>
          </h1>
          <div className="flex items-center gap-2">
             <div className="w-8 h-0.5 bg-gradient-to-r from-emerald/40 to-transparent rounded-full" />
             <p className="text-parchment-100/20 text-[9px] font-black uppercase tracking-[0.4em]">
                {trips.length} Saved Itineraries
             </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/generate')}
          className="btn-pro px-6 md:px-8 py-3 md:py-4 shadow-card hover:shadow-hover group hover:scale-[1.02] transition-all duration-300 min-h-[44px]"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-parchment-100">New Trip</span>
          </div>
        </button>
      </div>
    </div>
  ), [trips.length, navigate]);

  const memoEmptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-20 text-center surface-mesh-spectral p-8 animate-fade-slide-up delay-200 group">
       <div className="relative z-10 flex flex-col items-center">
        <div className="w-14 h-14 bg-emerald/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald/20 shadow-card transition-all group-hover:scale-110">
          <MapPin size={24} className="text-emerald" />
        </div>
        <h3 className="text-2xl font-black text-parchment-100 mb-3 uppercase tracking-tighter">
          Your Trip List is <span className="text-emerald italic">Empty</span>
        </h3>
        <p className="text-parchment-100/40 mb-6 max-w-xs font-black text-[9px] uppercase tracking-widest leading-relaxed">
           You haven't planned any trips yet. Start a new journey to see your itineraries here.
        </p>
        <button 
          onClick={() => navigate('/generate')}
          className="btn-pro px-10 shadow-glow-emerald"
        >
          <Plus size={14} /> Plan a New Trip
        </button>
      </div>
    </div>
  ), [navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen pb-20 relative overflow-hidden bg-dashboard-canvas">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/[0.02] pointer-events-none" />

        <div className="max-w-[1800px] mx-auto px-6 py-6 relative z-10">
          {memoHeader}
          
          {!user?.emailVerified && <VerifyBanner />}

          <div className="animate-fade-slide-up delay-100 mb-8">
            <StatsBar trips={isLoading ? [] : trips} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
               <AlertCircle size={32} className="text-red-400/40 mb-4" />
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500/60">{error}</p>
            </div>
          ) : trips.length === 0 ? (
            memoEmptyState
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {trips.map((trip, idx) => (
                <div 
                  key={trip.id} 
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${(idx * 30) + 50}ms` }}
                >
                  <TripCard 
                    trip={trip} 
                    onDelete={setDeleteTarget} 
                    onUpdate={updateTrip}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {deleteTarget && (
          <div className="fixed inset-0 bg-vintage_grape-100/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="bg-vintage_grape-300 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 max-w-sm w-full shadow-elevated border border-white/10 animate-fade-slide-up">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 border border-rose-500/20 shadow-card">
                <Trash2 size={20} className="text-rose-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-parchment-100 mb-2 uppercase tracking-tighter">Delete Itinerary</h3>
              <p className="text-[9px] text-parchment-100/40 mb-8 font-black uppercase tracking-[0.2em] leading-relaxed">
                You are about to permanently delete the <span className="text-rose-500/80 italic font-black">{deleteTarget.destination}</span> trip itinerary from your account.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 btn-ghost-pro min-h-[44px]"
                  disabled={isDeleting}
                >
                  Keep Trip
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-rose-500 text-white font-bold uppercase tracking-[0.2em] py-3 rounded-xl text-[9px] transition-all hover:bg-rose-600 shadow-xl shadow-rose-500/20 min-h-[44px]"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
