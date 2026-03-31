import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Undo2, Download, Wallet, 
  X, Check, AlertCircle, 
  Loader2, Calendar, Settings, MapPin, Sparkles, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';
import { tripsAPI, budgetAPI, shareAPI, collabAPI } from '../api';
import { stream } from '../lib/stream';
import { connectSocket, disconnectSocket } from '../lib/socket';

import DayCard from '../components/trip/DayCard';
import DayCardSkeleton from '../components/trip/DayCardSkeleton';
import MapView from '../components/trip/MapView';
import BudgetTracker from '../components/trip/BudgetTracker';
import TripChat from '../components/trip/TripChat';
import CollaboratorBar from '../components/trip/CollaboratorBar';
import PageTransition from '../components/shared/PageTransition';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const activeTrip = useTripStore(state => state.activeTrip);
  const setActiveTrip = useTripStore(state => state.setActiveTrip);
  const updateTrip = useTripStore(state => state.updateTrip);
  const presence = useTripStore(state => state.presence);
  const setPresence = useTripStore(state => state.setPresence);
  const syncTripState = useTripStore(state => state.syncTripState);
  const removeTrip = useTripStore(state => state.removeTrip);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingItinerary, setIsFetchingItinerary] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingDayIndex, setRegeneratingDayIndex] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const [mobileView, setMobileView] = useState('itinerary'); // 'itinerary' | 'map'
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [role, setRole] = useState('viewer'); // 'owner' | 'editor' | 'viewer'
  const [metaForm, setMetaForm] = useState({
    title: '',
    destination: '',
    budget: 0,
    days: 0
  });
  const [cacheKey, setCacheKey] = useState(Date.now());
  const typingTimeouts = useRef({});

  const loadData = useCallback(async () => {
    try {
      if (!user) {
        navigate('/auth');
        return;
      }

      setPresence([]);


      const { tripCache, trips } = useTripStore.getState();
      let cached = tripCache[id] || trips?.find(t => t.id === id);
      
      if (cached) {
        setActiveTrip(cached);
        setIsLoading(false);
        if (cached.itinerary?.days) {
          setIsFetchingItinerary(false);
        } else {
          setIsFetchingItinerary(true);
        }
      } else {
        setIsLoading(true);
        setIsFetchingItinerary(true);
      }
      
      const [tripRes, budgetRes] = await Promise.all([
        tripsAPI.getOne(id),
        budgetAPI.getSummary(id).catch(() => ({ data: null }))
      ]);

      const currentTripData = tripRes.data.trip;
      setActiveTrip(currentTripData);
      setRole(tripRes.data.role);

      useTripStore.setState((state) => ({
        tripCache: { ...state.tripCache, [id]: currentTripData }
      }));
      
      setShareEnabled(currentTripData.isPublic || false);
      setShareLink(currentTripData.shareLink || '');
      setMetaForm({
        title: currentTripData.title,
        destination: currentTripData.destination,
        budget: currentTripData.budget,
        days: currentTripData.days
      });
    } catch (err) {
      toast.error('Failed to load trip details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
      setIsFetchingItinerary(false);
    }
  }, [id, user, navigate, setActiveTrip]);

  const computedBudgetSummary = useMemo(() => {
    if (!activeTrip || !activeTrip.itinerary) return null;
    const it = activeTrip.itinerary;
    const days = it.days || [];
    const totalCost = it.totalCost || 0;
    const currency = it.currency || 'INR';
    const budget = activeTrip.budget || 0;
    
    const isStale = it.budgetConverted && it.itineraryBudget !== budget;
    const effectiveBudget = (it.budgetConverted && !isStale) ? it.budgetConverted : budget;
    
    const perDayBudget = activeTrip.days > 0 ? Math.floor(effectiveBudget / activeTrip.days) : 0;
    
    const dayBreakdown = days.map(d => ({
      day: d.day,
      dayCost: d.dayCost || 0,
      overForDay: (d.dayCost || 0) > perDayBudget
    }));

    return {
      totalCost,
      budget: effectiveBudget,
      originalBudget: budget,
      currency,
      overBudget: totalCost > effectiveBudget,
      difference: totalCost - effectiveBudget,
      percentageOver: effectiveBudget > 0 ? Number(((totalCost - effectiveBudget) / effectiveBudget * 100).toFixed(1)) : 0,
      perDayBudget,
      dayBreakdown,
      isConverted: !!it.budgetConverted && !isStale
    };
  }, [activeTrip]);

  useEffect(() => {
    if (!id || !user) return;

    const socket = connectSocket();

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join:trip', { tripId: id });
    });

    socket.on('disconnect', () => setSocketConnected(false));

    const onPresenceCurrent = ({ users }) => setPresence(users);
    const onPresenceUpdate = ({ users }) => setPresence(users);
    const onTripUpdated = ({ change, updatedBy, value, field, dayIndex }) => {
       if (updatedBy === user.id) return;
       
       toast.success('Trip updated by another traveler', {
         icon: '✨',
         style: { background: 'var(--lime_cream-800)', color: 'var(--vintage_grape-500)', border: '1px solid var(--lime_cream-700)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
       });
       
       if (change.type === 'day') {
          updateTrip((prev) => {
            const newDays = [...(prev.itinerary?.days || [])];
            if (newDays[dayIndex]) {
              newDays[dayIndex] = { ...newDays[dayIndex], [field]: value };
            }
            return { ...prev, itinerary: { ...prev.itinerary, days: newDays } };
          });
        } else if (change.type === 'reorder') {
          updateTrip((prev) => {
            const newDays = [...(prev.itinerary?.days || [])];
            const [removed] = newDays.splice(change.sourceIndex, 1);
            newDays.splice(change.destinationIndex, 0, removed);
            const reindexed = newDays.map((d, i) => ({ ...d, day: i + 1 }));
            return { ...prev, itinerary: { ...prev.itinerary, days: reindexed } };
          });
        } else {
          loadData();
        }
    };

    const onTripTyping = ({ userId, userName, field }) => {
       if (userId === user.id) return;
       setTypingUsers(prev => ({ ...prev, [field]: { userId, userName } }));
       
       if (typingTimeouts.current[field]) {
         clearTimeout(typingTimeouts.current[field]);
       }

       typingTimeouts.current[field] = setTimeout(() => {
         setTypingUsers(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
         });
         delete typingTimeouts.current[field];
       }, 3000);
    };

    socket.on('presence:current', onPresenceCurrent);
    socket.on('presence:update', onPresenceUpdate);
    socket.on('trip:updated', onTripUpdated);
    socket.on('trip:typing', onTripTyping);
    socket.on('trip:error', ({ message }) => toast.error(message));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('presence:current');
      socket.off('presence:update');
      socket.off('trip:updated');
      socket.off('trip:typing');
      socket.off('trip:error');
      setPresence([]);
      disconnectSocket();
    };
  }, [id, user?.id, setPresence, updateTrip, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleRegenerateDay = useCallback(async (dayIndex, reason) => {
    setIsRegenerating(true);
    setRegeneratingDayIndex(dayIndex);
    
    await stream({
      url: `${import.meta.env.VITE_API_URL}/regenerate/${id}/day`,
      body: { dayIndex, reason },
      onComplete: (data) => {
        const trip = data?.trip || data;
        if (trip && trip.itinerary) {
          syncTripState(trip);
          toast.success(`Day ${dayIndex + 1} updated`);
        }
        setIsRegenerating(false);
        setRegeneratingDayIndex(null);
      },
      onError: (err) => {
        toast.error(err.formattedMessage || err.message || 'Update failed');
        setIsRegenerating(false);
        setRegeneratingDayIndex(null);
      }
    });
  }, [id, syncTripState]);

  const handleOptimizeBudget = useCallback(async () => {
    setIsOptimizing(true);
    await stream({
      url: `${import.meta.env.VITE_API_URL}/budget/${id}/optimize`,
      onComplete: (updatedTrip) => {
        syncTripState(updatedTrip);
        toast.success('Budget optimized');
        setIsOptimizing(false);
      },
      onError: (err) => {
        toast.error(err.formattedMessage || err.message || 'Optimization failed');
        setIsOptimizing(false);
      }
    });
  }, [id, syncTripState]);

  const handleUndo = useCallback(async () => {
    try {
      const res = await tripsAPI.undo(id);
      syncTripState(res.data.trip);
      toast.success('Previous version restored');
    } catch (err) {
      toast.error('Undo failed');
    }
  }, [id, syncTripState]);

  const handleShareClick = useCallback(() => setShowShareModal(true), []);
  const handleSettingsClick = useCallback(() => setShowSettingsModal(true), []);
  const handleUndoClick = useCallback(() => handleUndo(), [handleUndo]);
  const handleExportClick = useCallback(() => navigate(`/trip/${id}/export`), [id, navigate]);
  const handleBackClick = useCallback(() => navigate('/dashboard'), [navigate]);

  const handleShareToggle = async () => {
    try {
      if (shareEnabled) {
        await shareAPI.disable(id);
        setShareEnabled(false);
        setShareLink('');
        toast.success('Public link disabled');
      } else {
        const res = await shareAPI.enable(id);
        setShareLink(res.data.shareLink);
        setShareEnabled(true);
        toast.success('Public link enabled');
      }
    } catch (err) {
      toast.error('Failed to update link');
    }
  };

  const handleUpdateMetadata = async (e) => {
    e.preventDefault();
    const budgetVal = parseInt(metaForm.budget);
    const daysVal = parseInt(metaForm.days);

    if (isNaN(budgetVal) || budgetVal < 0) {
      toast.error('Please enter a valid budget');
      return;
    }

    if (isNaN(daysVal) || daysVal < 1 || daysVal > 30) {
      toast.error('Trip length must be between 1 and 30 days');
      return;
    }

    setIsUpdatingMetadata(true);
    try {
      const res = await tripsAPI.update(id, {
        title: metaForm.title,
        destination: metaForm.destination,
        budget: budgetVal,
        days: daysVal
      });
      syncTripState(res.data.trip);
      
      setMetaForm({
        title: res.data.trip.title,
        destination: res.data.trip.destination,
        budget: res.data.trip.budget,
        days: res.data.trip.days
      });
      
      toast.success('Trip parameters updated');
      setShowSettingsModal(false);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  const handleRegenerateFull = async () => {
    if (!window.confirm("This will completely re-plan your entire trip based on current settings. Are you sure?")) return;
    
    setIsRegenerating(true);
    setShowSettingsModal(false);

    await stream({
      url: `${import.meta.env.VITE_API_URL}/regenerate/${id}/full`,
      onComplete: (data) => {
        const trip = data?.trip || data;
        if (trip && trip.itinerary) {
          syncTripState(trip);
          toast.success('Entire itinerary regenerated', { icon: '✨' });
        }
        setIsRegenerating(false);
      },
      onError: (err) => {
        toast.error(err.formattedMessage || err.message || 'Full regeneration failed');
        setIsRegenerating(false);
      }
    });
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm("PERMANENT ACTION: Are you sure you want to delete this trip? This cannot be undone.")) return;
    
    try {
      toast.loading('Deleting trip...', { id: 'delete-trip' });
      await tripsAPI.delete(id);
      removeTrip(id); // SYNC: Remove from list and cache
      toast.success('Trip deleted forever', { id: 'delete-trip' });
      navigate('/dashboard');
    } catch (err) {
      toast.error('Deletion failed', { id: 'delete-trip' });
    }
  };

  const handleRefreshImage = async () => {
    try {
      toast.loading('Updating cover photo...', { id: 'refresh-cover' });
      const res = await tripsAPI.refreshImage(id);
      setActiveTrip(res.data.trip);
      setCacheKey(Date.now());
      toast.success('Cover photo updated', { id: 'refresh-cover' });
    } catch (err) {
      toast.error('Update failed', { id: 'refresh-cover' });
    }
  };

  const handleLeaveTrip = async () => {
    if (!window.confirm("Are you sure you want to leave this trip?")) return;
    try {
      toast.loading('Leaving trip...', { id: 'leave-trip' });
      await collabAPI.leave(id);
      removeTrip(id); // SYNC: Remove from list and cache
      toast.success('You have left the trip', { id: 'leave-trip' });
      navigate('/dashboard');
    } catch (err) {
      toast.error('Deactivation failed', { id: 'leave-trip' });
    }
  };

  const copyShareLink = () => {
    const fullUrl = `${window.location.origin}/share/${shareLink}`;
    navigator.clipboard.writeText(fullUrl);
    setIsCopying(true);
    toast.success('Link copied');
    setTimeout(() => setIsCopying(false), 2000);
  };

  if (isLoading || !activeTrip) {
    return (
      <div className="h-screen bg-vintage_grape-100 flex flex-col items-center justify-center gap-6">
        <div className="relative">
           <Loader2 size={40} className="animate-spin text-emerald" />
           <div className="absolute inset-0 bg-emerald/20 blur-2xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-parchment-100/20 animate-pulse">Loading Trip</p>
      </div>
    );
  }

  const tripCurrency = activeTrip.itinerary?.currency || 'INR';

  const formattedBudget = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: computedBudgetSummary?.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(computedBudgetSummary?.budget || activeTrip.budget);

  const formattedOriginalBudget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(computedBudgetSummary?.originalBudget || activeTrip.budget);

  return (
    <PageTransition>
      <div className="h-screen overflow-hidden bg-detail-nested flex flex-col selection:bg-emerald/20 selection:text-emerald relative">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[2px] pointer-events-none" />
        
        <header className="h-16 flex-shrink-0 bg-vintage_grape-100/90 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between z-40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackClick}
              className="p-2 md:p-2.5 rounded-2xl bg-white/5 border border-white/10 text-parchment-100/40 hover:text-emerald hover:border-emerald transition-all active:scale-95 min-h-[40px] flex items-center justify-center"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="hidden sm:block w-px h-6 bg-white/10" />
            <div className="flex flex-col">
               <h1 className="text-xs md:text-sm font-black text-parchment-100 uppercase tracking-tighter truncate max-w-[100px] sm:max-w-[150px] md:max-w-xs leading-none">
                 {activeTrip.destination}
               </h1>
               <div className="flex items-center gap-2 mt-1 md:mt-1.5">
                 <span className="text-[7px] md:text-[8px] font-black text-parchment-100/20 uppercase tracking-[0.2em]">{activeTrip.days}D</span>
                 {socketConnected && <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald animate-pulse" />}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {role !== 'viewer' && activeTrip.history?.length > 0 && (
              <button 
                onClick={handleUndoClick}
                className="hidden lg:flex items-center gap-2 text-parchment-100/40 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
              >
                <Undo2 size={14} />
                Undo
              </button>
            )}
            <button 
              onClick={handleShareClick}
              className="bg-white/5 border border-white/10 text-parchment-100 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald hover:text-white hover:border-emerald active:scale-95 transition-all flex items-center gap-2 shadow-soft min-h-[40px]"
            >
              <Share2 size={14} />
              <span className="hidden lg:inline">Share</span>
            </button>
            <button 
              onClick={handleExportClick}
              className="bg-emerald text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald/90 active:scale-95 transition-all flex items-center gap-2 shadow-card min-h-[40px]"
            >
              <Download size={14} />
              <span className="hidden lg:inline">Export</span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
            {role !== 'viewer' && (
              <button 
                onClick={handleSettingsClick}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-parchment-100/40 hover:text-emerald hover:border-emerald transition-all active:scale-95"
              >
                <Settings size={16} />
              </button>
            )}
            <div className="flex flex-col items-end scale-90 md:scale-100 origin-right">
              <div className="px-2 md:px-3 py-1 md:py-1.5 bg-emerald/10 border border-emerald/20 text-emerald rounded-xl flex items-center gap-1.5 md:gap-2 shadow-sm transition-all hover:scale-110 cursor-help group-hover:shadow-glow-emerald">
                <Wallet size={10} className="animate-pulse md:w-3 md:h-3" />
                <span className="text-[9px] md:text-[10px] font-black tabular-nums">{formattedBudget}</span>
              </div>
              {computedBudgetSummary?.isConverted && (
                <span className="text-[6px] md:text-[7px] font-black text-emerald/40 uppercase tracking-tighter mt-0.5 md:mt-1 tabular-nums">
                  FROM {formattedOriginalBudget}
                </span>
              )}
            </div>
          </div>
        </header>


        <div className="flex-1 flex relative overflow-hidden">
          
          <div 
            className={`${mobileView === 'itinerary' ? 'flex' : 'hidden'} md:flex w-full md:w-[42%] h-full flex-col relative overflow-hidden bg-vintage_grape-100/50 animate-fade-in`}
          >
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 custom-scrollbar">
              <CollaboratorBar 
                collaborators={activeTrip.collaborators} 
                presence={presence} 
                socketConnected={socketConnected}
                tripId={id}
                isOwner={activeTrip.userId === user?.id}
              />

              <div className="space-y-4 md:space-y-6 pb-40 mt-4">
                {isFetchingItinerary ? (
                  Array.from({ length: Math.max(activeTrip.days || 3, 3) }).map((_, i) => (
                    <DayCardSkeleton key={`skeleton-${i}`} />
                  ))
                ) : (
                  activeTrip.itinerary?.days?.map((day, index) => (
                    <div key={index} id={`day-card-${index}`} className="animate-fade-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <DayCard 
                        day={day}
                        dayIndex={index}
                        isActive={activeDay === index}
                        onActivate={() => setActiveDay(activeDay === index ? null : index)}
                        tripId={id}
                        currency={activeTrip.itinerary?.currency}
                        isRegenerating={isRegenerating && regeneratingDayIndex === index}
                        onRegenerate={handleRegenerateDay}
                        typingUser={typingUsers[`day-${index}`]}
                        role={role}
                        onUpdate={(field, value) => {
                           const socket = connectSocket();
                           socket.emit('trip:update', { 
                             tripId: id, 
                             change: { type: 'day', dayIndex: index, field, value } 
                           });
                        }}
                        onTyping={(field) => {
                          const socket = connectSocket();
                          socket.emit('trip:typing', { tripId: id, field });
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {role !== 'viewer' && (
              <BudgetTracker 
                budgetSummary={computedBudgetSummary}
                onOptimize={handleOptimizeBudget}
                isOptimizing={isOptimizing}
              />
            )}
          </div>

          <div className={`${mobileView === 'map' ? 'block' : 'hidden'} md:block w-full md:w-[58%] h-full relative border-l border-white/5 animate-fade-in`}>
            <MapView 
              days={activeTrip.itinerary?.days || []} 
              activeDay={activeDay}
              onActiveDay={setActiveDay} 
              currency={activeTrip.itinerary?.currency}
            />
          </div>
        </div>

        <div className="md:hidden fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-vintage_grape-500/90 backdrop-blur-md p-1.5 rounded-[2rem] flex gap-1 shadow-2xl border border-white/10 scale-90 sm:scale-100">
           <button 
             onClick={() => setMobileView('itinerary')}
             className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all min-h-[44px] ${mobileView === 'itinerary' ? 'bg-emerald text-vintage_grape-500 shadow-lg shadow-emerald/20' : 'text-parchment-100/40'}`}
           >
             <Calendar size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Plan</span>
           </button>
           <button 
             onClick={() => setMobileView('map')}
             className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all min-h-[44px] ${mobileView === 'map' ? 'bg-emerald text-vintage_grape-500 shadow-lg shadow-emerald/20' : 'text-parchment-100/40'}`}
           >
             <MapPin size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Map</span>
           </button>
        </div>

        <TripChat 
          tripId={id} 
          destination={activeTrip.destination} 
        />

        {showShareModal && (
          <div className="fixed inset-0 z-[100] bg-vintage_grape-500/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-vintage_grape-300 border border-white/10 rounded-[3rem] p-8 max-w-sm w-full shadow-2xl animate-fade-slide-up">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald rounded-2xl flex items-center justify-center shadow-card">
                    <Share2 size={20} className="text-white" />
                  </div>
                  <h2 className="text-lg font-black text-parchment-100 uppercase tracking-tighter">Share Trip</h2>
                </div>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 rounded-xl hover:bg-lime_cream-700 text-dusty_grape-400 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-parchment-100 uppercase tracking-widest">Public Access</span>
                      <span className="text-[10px] font-bold text-parchment-100/30 uppercase tracking-widest">Open to everyone</span>
                    </div>
                    <button 
                      onClick={handleShareToggle}
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${shareEnabled ? 'bg-emerald' : 'bg-parchment-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${shareEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                 </div>

                 {shareEnabled && shareLink && (
                   <div className="space-y-3 animate-fade-slide-up">
                      <label className="text-[9px] font-black text-parchment-100/40 uppercase tracking-[0.4em] ml-2">Share Link</label>
                      <div className="flex gap-2">
                        <input 
                          readOnly 
                          value={`${window.location.origin}/share/${shareLink}`}
                          className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs text-parchment-100 flex-1 select-all font-black truncate focus:outline-none"
                        />
                        <button 
                          onClick={copyShareLink}
                          className="bg-white text-vintage_grape-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald hover:text-white transition-all active:scale-95"
                        >
                          {isCopying ? <Check size={14} /> : 'Copy'}
                        </button>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] bg-vintage_grape-100/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-vintage_grape-300 rounded-[3rem] p-8 max-w-md w-full shadow-2xl animate-fade-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald rounded-2xl flex items-center justify-center shadow-sm font-black uppercase">
                    <Settings size={20} className="text-white" />
                  </div>
                  <h2 className="text-lg font-black text-parchment-100 uppercase tracking-tighter">Edit Trip</h2>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 rounded-xl hover:bg-oyster-200 text-espresso/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateMetadata} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-parchment-100/30 uppercase tracking-[0.4em] ml-2">Trip Title</label>
                    <input 
                      value={metaForm.title}
                      onChange={(e) => setMetaForm({...metaForm, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-parchment-100 focus:bg-white/10 focus:border-emerald focus:ring-8 focus:ring-emerald/5 outline-none transition-all shadow-inner"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-parchment-100/30 uppercase tracking-[0.4em] ml-2">Destination</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald" />
                      <input 
                        value={metaForm.destination}
                        onChange={(e) => setMetaForm({...metaForm, destination: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-xs font-black text-parchment-100 focus:bg-white/10 focus:border-emerald focus:ring-8 focus:ring-emerald/5 outline-none transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-parchment-100/30 uppercase tracking-[0.4em] ml-2">Budget ({tripCurrency})</label>
                    <div className="relative">
                      <Wallet size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                      <input 
                        type="number"
                        value={metaForm.budget}
                        onChange={(e) => setMetaForm({...metaForm, budget: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-xs font-black text-parchment-100 focus:bg-white/10 focus:border-emerald focus:ring-8 focus:ring-emerald/5 outline-none transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-parchment-100/30 uppercase tracking-[0.4em] ml-2">Days</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                      <input 
                        type="number"
                        value={metaForm.days}
                        min="1"
                        max="30"
                        onChange={(e) => setMetaForm({...metaForm, days: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-xs font-black text-parchment-100 focus:bg-white/10 focus:border-emerald focus:ring-8 focus:ring-emerald/5 outline-none transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-parchment-100/30 uppercase tracking-[0.4em] ml-2">Trip Cover</label>
                  <div className="relative group/cover h-44 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-inner bg-white/5">
                    {activeTrip.imageUrl ? (
                      <img 
                        src={`${activeTrip.imageUrl}?t=${cacheKey}`} 
                        alt="Cover" 
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/cover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin size={32} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-vintage_grape-500/40 to-transparent" />
                    <button 
                      type="button"
                      onClick={handleRefreshImage}
                      className="absolute bottom-5 right-5 bg-white text-vintage_grape-500 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2 group/refresh"
                    >
                      <Sparkles size={14} className="text-emerald group-hover/refresh:animate-spin" />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="pt-6 space-y-8">
                  <button 
                    type="submit"
                    disabled={isUpdatingMetadata}
                    className="w-full bg-emerald text-white py-5 rounded-[2.2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald/90 hover:shadow-glow-emerald active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isUpdatingMetadata ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} className="text-white transition-transform" />}
                    {isUpdatingMetadata ? 'Saving...' : 'Save Changes'}
                  </button>
 
                  <div className="pt-8 border-t border-white/10 space-y-6">
                    <div className="flex items-center gap-3 ml-2">
                       <AlertCircle size={14} className="text-rose-500" />
                       <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Advanced Settings</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={handleRegenerateFull}
                        disabled={isRegenerating}
                        className="bg-parchment-100 border border-parchment-300 text-rose-500 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 group"
                      >
                        {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={16} className="group-hover:animate-pulse" />}
                        <span>{isRegenerating ? 'Updating...' : 'Start Over'}</span>
                      </button>

                      <button 
                        type="button"
                        onClick={activeTrip.userId === user?.id ? handleDeleteTrip : handleLeaveTrip}
                        className="bg-rose-500 text-white py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest border-2 border-rose-500 hover:bg-rose-600 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                      >
                        <Trash2 size={16} />
                        <span>{activeTrip.userId === user?.id ? 'Delete Trip' : 'Leave Trip'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
