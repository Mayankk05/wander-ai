import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shareAPI, exportAPI } from '../api';
import { MapPin, Calendar, Wallet, Clock, Eye, Sparkles, Map as MapIcon, ChevronRight, Download, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PageTransition from '../components/shared/PageTransition';
import MapView from '../components/trip/MapView';

export default function ShareView() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [mobileView, setMobileView] = useState('itinerary'); // 'itinerary' | 'map'

  useEffect(() => {
    async function fetchSharedTrip() {
      try {
        const response = await shareAPI.getPublic(token);
        setTrip(response.data.trip);
      } catch (err) {
        setError(err.response?.status || 500);
      } finally {
        setLoading(false);
      }
    }
    fetchSharedTrip();
  }, [token]);

  const handleDownloadPDF = async () => {
    try {
      const response = await exportAPI.pdf(token);
      const file = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WanderAI-${trip?.destination || 'Trip'}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('PDF DOWNLOAD ERROR:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#131516] flex flex-col items-center justify-center p-6 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-parchment-100/40 animate-pulse">Loading Trip...</p>
      </div>
    );
  }

  if (error === 404 || error === 403) {
    return (
      <div className="min-h-screen bg-[#131516] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 text-parchment-100/10 border border-white/10 shadow-glass">
          <MapPin size={48} />
        </div>
        <h1 className="text-3xl font-black text-parchment-100 mb-4 uppercase tracking-tighter">
          {error === 404 ? 'Trip Not Found' : 'Access Restricted'}
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-100/40 max-w-sm mb-12 leading-loose">
          {error === 404 
            ? 'This trip is no longer public or has been deleted.' 
            : 'The owner has restricted public access to this itinerary.'}
        </p>
        <Link 
          to="/auth" 
          className="bg-emerald text-vintage_grape-500 px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald/90 transition-all active:scale-95 shadow-glass"
        >
          Plan Your Own Trip
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131516] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-black text-parchment-100 uppercase tracking-tighter mb-6">Connection Failed</h1>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-vintage_grape-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-glass"
        >
          Retry
        </button>
      </div>
    );
  }

  const { itinerary } = trip;

  return (
    <PageTransition>
      <div className="h-screen flex flex-col bg-[#131516] relative overflow-hidden selection:bg-emerald selection:text-white">
        {/* Detail depth overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none" />
        {/* SHARE NAVBAR */}
        <nav className="h-16 flex-shrink-0 bg-[#1a1c1e]/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between z-40 transition-all duration-300">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-black text-parchment-100 tracking-tighter uppercase">Wander<span className="text-emerald">AI</span></span>
          </Link>

          <div className="flex items-center gap-4">
             {/* READ-ONLY BADGE */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <Eye size={12} className="text-emerald" />
              <span className="text-[8px] font-black text-parchment-100 uppercase tracking-[0.2em]">View Only</span>
            </div>
            <div className="w-px h-6 bg-white/5 mx-1 hidden md:block" />
            <button 
              onClick={handleDownloadPDF}
              className="p-2.5 bg-white/5 text-parchment-100 rounded-xl border border-white/10 hover:bg-emerald/10 transition-all group"
              title="Download PDF"
            >
              <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
            <Link 
              to="/auth" 
              className="bg-emerald text-vintage_grape-500 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-glass flex items-center gap-2"
            >
              Start Planning <ChevronRight size={14} />
            </Link>
          </div>
        </nav>

        {/* MAIN CONTENT Area - Split Screen Layout */}
        <div className="flex-1 flex relative overflow-hidden">
          
          {/* LEFT COLUMN: ITINERARY */}
          <div 
            className={`${mobileView === 'itinerary' ? 'flex' : 'hidden'} md:flex w-full md:w-[42%] h-full flex-col relative overflow-hidden bg-white/5 backdrop-blur-md animate-fade-in transition-all`}
          >
            <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
              <main className="max-w-2xl mx-auto w-full">
                {/* HERO */}
                <div className="mb-12 animate-fade-slide-up">
                   <div className="bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-glass mb-12 group">
                     {trip.imageUrl ? (
                       <img src={trip.imageUrl} alt={trip.destination} className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-[3000ms]" />
                     ) : (
                       <div className="w-full h-72 bg-gradient-to-br from-black/40 via-black/20 to-emerald/5 flex items-center justify-center">
                         <div className="relative">
                            <MapPin size={60} className="text-parchment-100/10" />
                            <div className="absolute inset-0 blur-3xl opacity-20 bg-emerald" />
                         </div>
                       </div>
                     )}
                     
                     <div className="p-8">
                       <div className="flex flex-col gap-6">
                         <div>
                           <div className="flex items-center gap-3 mb-2">
                              <h1 className="text-3xl font-black text-parchment-100 leading-none tracking-tighter uppercase">{trip.title}</h1>
                              {trip.owner_verified && (
                                <div className="bg-emerald text-vintage_grape-500 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-glass">
                                  <ShieldCheck size={12} strokeWidth={3} />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Verified Trip</span>
                                </div>
                              )}
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                 <MapPin size={16} className="text-emerald" />
                              </div>
                              <span className="text-[10px] font-black text-parchment-100 uppercase tracking-[0.2em]">{trip.destination}</span>
                           </div>
                         </div>
                         
                         <div className="flex flex-wrap gap-3">
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-inner">
                              <Calendar size={16} className="text-emerald" />
                              <span className="text-[10px] font-black text-parchment-100 uppercase tracking-tight">{trip.days} Days</span>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-inner">
                              <Wallet size={16} className="text-emerald" />
                              <span className="text-[10px] font-black text-parchment-100 uppercase tracking-tight">{trip.itinerary?.currency || 'INR'} {trip.budget}</span>
                            </div>
                         </div>
                       </div>
                     </div>
                   </div>
                </div>

                {/* ITINERARY */}
                <div className="space-y-8 mb-24">
                  <div className="flex items-center gap-6 mb-8 animate-fade-in">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.5em] whitespace-nowrap">Trip Plan</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  {itinerary.days.map((day, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveDay(idx)}
                      className={`cursor-pointer transition-all duration-300 ${activeDay === idx ? 'ring-2 ring-emerald ring-offset-4 ring-offset-[#131516] scale-[1.02]' : 'hover:scale-[1.01]'} bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-glass mb-6`} 
                    >
                      <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-6">
                          <div className="bg-white text-vintage_grape-500 text-[10px] font-black px-5 py-2 rounded-2xl uppercase tracking-[0.2em] shadow-glass">
                            Day {(idx + 1).toString().padStart(2, '0')}
                          </div>
                          <h3 className="text-lg font-black text-parchment-100 uppercase tracking-tighter">{day.title}</h3>
                        </div>
                        <div className="text-[10px] font-black text-parchment-100/40 uppercase tracking-widest">
                          {trip.itinerary?.currency || 'INR'} {day.dayCost || 0}
                        </div>
                      </div>

                      {activeDay === idx && (
                        <div className="p-10 space-y-10 animate-fade-in">
                          {/* PLACES */}
                          <div className="space-y-4">
                            {day.places.map((place, pIdx) => (
                              <div key={pIdx} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-emerald transition-all group">
                                <div className="flex items-center gap-6">
                                  <div className="w-10 h-10 rounded-xl bg-emerald border border-white/20 flex items-center justify-center text-vintage_grape-500 font-black text-xs shadow-glass">
                                    {pIdx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-sm font-black text-parchment-100 uppercase tracking-tight">{place.name}</h4>
                                      {place.metadata?.isHiddenGem && (
                                        <span className="bg-emerald text-vintage_grape-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                                          <Sparkles size={10} strokeWidth={3} /> Gem
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-[9px] font-black text-parchment-100/40 uppercase tracking-widest">
                                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-emerald" /> {place.duration}</span>
                                      <span className="text-emerald">{trip.itinerary?.currency || 'INR'} {place.cost}</span>
                                      {place.metadata?.rating && (
                                        <span className="flex items-center gap-1 text-emerald">
                                          ★ {place.metadata.rating} <span className="opacity-30">({place.metadata.reviews})</span>
                                        </span>
                                      )}
                                    </div>
                                    {place.metadata?.address && (
                                      <p className="text-[9px] font-bold text-parchment-100/40 uppercase tracking-wide leading-tight italic mt-1">
                                        {place.metadata.address}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* LOGISTICS */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                              <span className="text-[8px] font-black text-emerald uppercase tracking-[0.3em] mb-3 block">Transport</span>
                              <p className="text-[10px] font-bold text-parchment-100 leading-relaxed uppercase">{day.transport || 'Transport Detail'}</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                              <span className="text-[8px] font-black text-emerald uppercase tracking-[0.3em] mb-3 block">Stay</span>
                              <p className="text-[10px] font-bold text-parchment-100 leading-relaxed uppercase">{day.accommodation || 'Stay Local'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA FOOTER */}
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center shadow-glass backdrop-blur-xl mb-12">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                     <Sparkles size={32} className="text-emerald animate-pulse" />
                   </div>
                    <h2 className="text-2xl font-black text-parchment-100 mb-4 tracking-tighter uppercase leading-none">Plan Your Trip</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-parchment-100/40 max-w-sm mx-auto mb-10 leading-loose">
                      Plan your next adventure in seconds with our smart planner.
                    </p>
                   
                   <div className="flex flex-col gap-4">
                     <Link 
                       to="/auth" 
                       className="w-full bg-emerald text-vintage_grape-500 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald-400 shadow-glass transition-all"
                     >
                        Get Started Free
                     </Link>
                   </div>
                </div>
              </main>
            </div>
          </div>

          {/* RIGHT COLUMN: MAP */}
          <div className={`${mobileView === 'map' ? 'block' : 'hidden'} md:block w-full md:w-[58%] h-full relative border-l border-white/5 animate-fade-in`}>
            <MapView 
              days={itinerary.days || []} 
              activeDay={activeDay}
              onActiveDay={setActiveDay} 
            />
          </div>
        </div>

        {/* MOBILE VIEW TOGGLE */}
        <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#1a1c1e] p-1.5 rounded-3xl flex gap-1 shadow-2xl border border-white/5">
           <button 
             onClick={() => setMobileView('itinerary')}
             className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all ${mobileView === 'itinerary' ? 'bg-emerald text-white' : 'text-white/50'}`}
           >
             <Calendar size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">List</span>
           </button>
           <button 
             onClick={() => setMobileView('map')}
             className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all ${mobileView === 'map' ? 'bg-emerald/80 text-white' : 'text-white/50'}`}
           >
             <MapIcon size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Map</span>
           </button>
        </div>
      </div>
    </PageTransition>
  );
}
