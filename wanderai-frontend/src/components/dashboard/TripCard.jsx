import { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, MapPin, Eye, Trash2, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { tripsAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { loaders } from '../../App';

function TripCard({ trip, onDelete, onUpdate }) {
  const user = useAuthStore(state => state.user);
  const isOwner = user?.id === trip.userId;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    navigate(`/trip/${trip.id}`);
  };

  const handleMouseEnter = () => {
    if (loaders.TripDetail) {
      loaders.TripDetail().catch(() => {});
    }
  };

  const handleMenuAction = (e, action) => {
    e.stopPropagation();
    setShowMenu(false);
    
    if (action === 'view') navigate(`/trip/${trip.id}`);
    if (action === 'delete') onDelete(trip);
    if (action === 'refresh') handleRefreshImage(e);
  };

  const handleRefreshImage = async (e) => {
    e.stopPropagation();
    try {
      toast.loading('Regenerating cover...', { id: `refresh-${trip.id}` });
      const res = await tripsAPI.refreshImage(trip.id);
      toast.success('Cover photo updated', { id: `refresh-${trip.id}` });
      if (onUpdate && res.data.trip) onUpdate(res.data.trip);
    } catch {
      toast.error('Regeneration failed', { id: `refresh-${trip.id}` });
    }
  };

  const formatCurrency = (val, overrideCurrency) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: overrideCurrency || trip.itinerary?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCategoryColor = () => {
    return 'emerald';
  };

  const category = getCategoryColor();

  return (
    <div className="h-full">
      <div 
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        className="group relative flex flex-col h-full bg-white/5 border border-white/10 rounded-[2rem] shadow-glass hover:shadow-hover transition-all duration-500 cursor-pointer overflow-hidden p-2"
      >
        <div className="relative h-36 overflow-hidden bg-vintage_grape-300 rounded-[1.5rem]">
          {trip.imageUrl ? (
            <img 
              src={trip.imageUrl} 
              alt={trip.destination} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
               <MapPin size={28} className="text-emerald/20" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-vintage_grape-500/60 via-transparent to-transparent opacity-80" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3">
             <div className="bg-vintage_grape-100 border border-white/10 text-parchment-100 text-[8px] font-black px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-widest flex items-center gap-1.5">
               <Zap size={10} className="text-emerald" /> {trip.days} DAYS
             </div>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between flex-grow">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald font-black uppercase tracking-[0.2em] text-[8px]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="">{trip.destination}</span>
            </div>
            
            <h2 className="text-xl font-black text-parchment-100 leading-tight uppercase tracking-tighter group-hover:text-emerald transition-colors">
              {trip.title || trip.destination}
            </h2>
            
            <div className="flex items-center gap-4 pt-3 border-t border-white/5">
               <div className="flex flex-col">
                   <span className="text-[7px] font-black text-parchment-100/30 uppercase tracking-[0.2em]">Estimate</span>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-parchment-100 tabular-nums">
                        {formatCurrency(trip.itinerary?.itineraryBudget || trip.budget, trip.itinerary?.itineraryBudget ? 'INR' : (trip.itinerary?.currency || 'INR'))}
                      </span>
                      {trip.itinerary?.itineraryBudget && (
                        <span className="text-[7px] font-black text-emerald/60 tabular-nums uppercase tracking-tighter">
                          → {formatCurrency(trip.budget, trip.itinerary.currency)}
                        </span>
                      )}
                   </div>
               </div>
               <div className="w-px h-6 bg-white/10" />
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-parchment-100/30 uppercase tracking-[0.2em]">Status</span>
                  <span className="text-[8px] font-black uppercase text-emerald tracking-[0.2em]">
                     SAVED
                  </span>
               </div>
            </div>
          </div>

          <div className="pt-5 flex items-center justify-between mt-auto relative">
            <div className="flex -space-x-1.5">
              {(trip.collaborators || []).slice(0, 3).map((collab, i) => (
                <div 
                  key={i} 
                  className="w-7 h-7 rounded-lg bg-white/10 border-2 border-vintage_grape-100 flex items-center justify-center text-[8px] font-black text-parchment-100 shadow-soft uppercase"
                  title={collab.email}
                >
                  {collab.userName?.[0] || collab.email?.[0]}
                </div>
              ))}
            </div>
            
            <div 
              className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0" 
              ref={menuRef}
            >
               <div className="relative">
                   <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="w-8 h-8 bg-white/5 text-parchment-100/40 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white hover:text-vintage_grape-500 transition-all active:scale-95"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 bottom-full mb-3 bg-vintage_grape-300 rounded-2xl shadow-elevated p-2 z-[60] min-w-[160px] animate-reveal border border-white/10">
                      <button 
                        onClick={(e) => handleMenuAction(e, 'view')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[8px] font-black uppercase tracking-widest text-parchment-100 hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Eye size={14} className="opacity-40" /> View Details
                      </button>
                      <button 
                        onClick={(e) => handleMenuAction(e, 'refresh')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[8px] font-black uppercase tracking-widest text-emerald hover:bg-emerald/5 rounded-xl transition-all"
                      >
                        <RefreshCw size={14} className="opacity-40" /> Refresh Image
                      </button>
                      <div className="h-px bg-white/10 my-1.5 mx-2" />
                      <button 
                        onClick={(e) => handleMenuAction(e, 'delete')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[8px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                      >
                        <Trash2 size={14} className="opacity-40" /> Delete Trip
                      </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TripCard);
