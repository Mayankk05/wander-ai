import { useState, useMemo, memo } from 'react';
import { 
  MapPin, UtensilsCrossed, Car, Bed, Clock, 
  ChevronDown, AlertTriangle, RefreshCw, Loader2, Banknote, Navigation, Sparkles
} from 'lucide-react';

function DayCard({ 
  day, 
  dayIndex, 
  isActive, 
  onActivate, 
  tripId, 
  currency = 'INR',
  isRegenerating,
  onRegenerate,
  typingUser,
  onTyping,
  role = 'viewer'
}) {
  const [showRegenInput, setShowRegenInput] = useState(false);
  const [regenReason, setRegenReason] = useState('');

  const formatter = useMemo(() => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }), [currency]);

  const formatCurrency = (val) => formatter.format(val || 0);

  const getTypeStyles = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('food') || t.includes('eat') || t.includes('restaur') || t.includes('cafe')) 
      return { bg: 'bg-poppy/10', text: 'text-poppy', border: 'border-poppy/20', ring: 'ring-poppy/10' };
    if (t.includes('park') || t.includes('natur') || t.includes('beach') || t.includes('hike') || t.includes('outdoor')) 
      return { bg: 'bg-emerald/10', text: 'text-emerald', border: 'border-emerald/20', ring: 'ring-emerald/10' };
    if (t.includes('muse') || t.includes('hist') || t.includes('palace') || t.includes('art') || t.includes('cult')) 
      return { bg: 'bg-ochre-600/20', text: 'text-ochre', border: 'border-ochre/20', ring: 'ring-ochre/10' };
    if (t.includes('shop') || t.includes('market') || t.includes('mall') || t.includes('night') || t.includes('club')) 
      return { bg: 'bg-rose/10', text: 'text-rose', border: 'border-rose/20', ring: 'ring-rose/10' };
    if (t.includes('logist') || t.includes('trans') || t.includes('flight') || t.includes('bus')) 
      return { bg: 'bg-emerald/5', text: 'text-emerald', border: 'border-emerald/20', ring: 'ring-emerald/10' };
    
    return { bg: 'bg-espresso/5', text: 'text-espresso', border: 'border-espresso/10', ring: 'ring-espresso/5' };
  };

  const handleRegenSubmit = (e) => {
    e.stopPropagation();
    onRegenerate(dayIndex, regenReason);
    setShowRegenInput(false);
    setRegenReason('');
  };

  return (
    <div 
      className={`relative overflow-hidden mb-6 cursor-pointer border transition-all duration-500 ${
        isActive 
          ? 'bg-white/10 border-emerald/30 shadow-glass rounded-[2.5rem]' 
          : 'bg-white/5 border-white/5 shadow-soft rounded-3xl opacity-90 grayscale-[0.2] hover:grayscale-0 hover:opacity-100 hover:shadow-card'
      }`}
    >
      {/* CARD HEADER */}
      <div 
        onClick={() => onActivate(dayIndex)}
        className="px-8 py-6 flex items-center justify-between pointer-events-auto"
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-vintage_grape-100 border border-white/10 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-card">
            <span className="text-[9px] font-black text-parchment-100/40 uppercase tracking-widest leading-none mb-1">Day</span>
            <span className="text-xl font-black text-emerald leading-none">{String(dayIndex + 1).padStart(2, '0')}</span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <h3 className={`text-xl font-black text-parchment-100 uppercase tracking-tighter leading-tight transition-all duration-500 ${isActive ? '' : 'opacity-40'}`}>
              {day.title}
            </h3>
            {!isActive && <span className="text-[9px] font-black text-parchment-100/20 uppercase tracking-[0.2em]">{day.places?.length || 0} Entries</span>}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="flex flex-col items-end gap-1.5 min-w-[80px]">
             <span className="text-[9px] font-black text-parchment-100/20 uppercase tracking-[0.2em]">Cost</span>
             <span className="text-sm font-black text-parchment-100 tabular-nums tracking-tighter uppercase whitespace-nowrap">{formatCurrency(day.dayCost)}</span>
          </div>
          <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-500 ${isActive ? 'rotate-180 bg-emerald/10' : ''}`}>
             <ChevronDown 
               size={16} 
               className={`text-parchment-100/20 ${isActive ? 'text-emerald' : ''}`} 
               strokeWidth={2.5}
             />
          </div>
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {isActive && (
        <div className="border-t border-white/5 animate-reveal bg-white/[0.02]">
          
          <div className="px-8 pt-10 pb-4 flex items-center gap-3">
            <div className="w-1 h-3 bg-emerald rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-parchment-100/20">Daily Schedule</span>
          </div>
          
          <div className="px-8 pb-10 space-y-10 relative">
            <div className="absolute left-[47px] top-12 bottom-12 w-px bg-gradient-to-b from-emerald/40 via-white/10 to-transparent" />
 
            {day.places?.map((place, idx) => {
              const styles = getTypeStyles(place.type);
              return (
                <div key={idx} className="flex items-start gap-8 group relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-parchment-100 flex items-center justify-center text-xs font-black flex-shrink-0 mt-1 shadow-glass group-hover:scale-110 transition-transform duration-500">
                    {idx + 1}
                  </div>
                  
                  <div className="flex flex-col gap-3 flex-1 pb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-xl font-black text-parchment-100 uppercase tracking-tighter leading-none">{place.name}</h4>
                      {place.metadata?.isHiddenGem && (
                        <div className="flex items-center gap-1.5 bg-emerald/10 text-emerald text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ring-1 ring-emerald/20">
                          <Sparkles size={8} strokeWidth={3} /> Secret
                        </div>
                      )}
                      {place.type && (
                        <div className={`${styles.bg} ${styles.text} text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ring-1 ${styles.border}`}>
                          {place.type}
                        </div>
                      )}
                      {place.flagged && (
                        <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ring-1 ring-rose-500/20 animate-pulse">
                          <AlertTriangle size={8} strokeWidth={3} /> Validation Needed
                        </div>
                      )}
                    </div>
                    
                    <p className="text-[13px] text-parchment-100/70 leading-[1.6] font-medium max-w-xl">{place.description}</p>
                    
                    <div className="flex items-center gap-4 flex-wrap pt-1">
                      <div className="flex items-center gap-2 text-parchment-100/40 text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <Clock size={12} className="text-emerald" /> {place.duration}
                      </div>
                      <div className={`flex items-center gap-2 ${styles.text} text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl ring-1 ${styles.border}`}>
                        <Banknote size={12} /> {formatCurrency(place.cost)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MEALS SECTION */}
          <div className="px-8 pt-8 pb-4 flex items-center gap-3 border-t border-white/5">
            <div className="w-1 h-3 bg-poppy rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-parchment-100/30">Food & Dining</span>
          </div>
          
          <div className="px-8 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {day.meals?.map((meal, idx) => (
              <div key={idx} className="flex flex-col gap-3 bg-white/5 p-5 rounded-2xl border border-white/10 hover:shadow-glass transition-all group">
                <div className="flex items-center justify-between">
                  <span className={`text-[7px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm ${
                    meal.type === 'breakfast' ? 'bg-ochre-600/20 text-ochre' :
                    meal.type === 'lunch' ? 'bg-azure/5 text-azure' :
                    'bg-poppy/10 text-poppy'
                  }`}>
                    {meal.type}
                  </span>
                  <span className="text-[10px] font-serif italic text-parchment-100/40">{formatCurrency(meal.cost)}</span>
                </div>
                <div>
                  <div className="text-[14px] font-serif text-parchment-100 italic lowercase tracking-tight leading-none group-hover:text-poppy transition-colors">{meal.restaurant}</div>
                  <div className="text-[8px] font-black text-parchment-100/20 uppercase tracking-[0.2em] mt-1 line-clamp-1">{meal.dish}</div>
                </div>
              </div>
            ))}
          </div>

          {/* LOGISTICS SECTION */}
          <div className="px-8 pt-8 pb-4 flex items-center gap-3 border-t border-white/5">
             <div className="w-1 h-3 bg-azure rounded-full" />
             <span className="text-[9px] font-black uppercase tracking-[0.5em] text-parchment-100/30">Details</span>
          </div>
          <div className="px-8 pb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 bg-white/5 rounded-2xl p-5 border border-white/10 group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-vintage_grape-100 flex items-center justify-center shadow-soft border border-white/5">
                  <Car size={14} className="text-azure" />
                </div>
                <span className="text-[9px] font-black text-parchment-100/30 uppercase tracking-[0.2em]">Logistics</span>
              </div>
              <p className="text-[13px] font-serif text-parchment-100/80 leading-relaxed italic">{day.transport}</p>
            </div>
            
            <div className="flex flex-col gap-3 bg-white/5 rounded-2xl p-5 border border-white/10 group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-vintage_grape-100 flex items-center justify-center shadow-soft border border-white/5">
                  <Bed size={14} className="text-ochre" />
                </div>
                <span className="text-[9px] font-black text-parchment-100/30 uppercase tracking-[0.2em]">Stay</span>
              </div>
              <p className="text-[13px] font-serif text-parchment-100/80 leading-relaxed italic">{day.accommodation}</p>
            </div>
          </div>

          {/* REGENERATE SECTION */}
          {role !== 'viewer' && (
            <div className="px-8 py-10 bg-white/5 border-t border-white/5">
              {isRegenerating ? (
                <div className="flex items-center justify-center gap-4 py-8 bg-white/10 rounded-[2rem] shadow-inner">
                   <Loader2 size={16} className="animate-spin text-emerald" />
                   <span className="text-[9px] font-black text-emerald uppercase tracking-[0.4em]">Updating Day...</span>
                </div>
              ) : showRegenInput ? (
                <div className="flex flex-col gap-4 animate-reveal">
                  <textarea 
                    autoFocus
                    value={regenReason}
                    onChange={(e) => {
                      setRegenReason(e.target.value);
                      onTyping?.(`day-${dayIndex}`);
                    }}
                    placeholder="Describe desired modifications... (e.g. 'more coffee')"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[13px] text-parchment-100 placeholder-parchment-100/20 focus:ring-4 focus:ring-emerald/5 transition-all resize-none h-24 font-bold tracking-tight shadow-inner"
                  />
                  {typingUser && (
                    <div className="flex items-center gap-2 px-4 animate-fade-in">
                      <div className="w-1 h-1 rounded-full bg-emerald animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald/60">
                        {typingUser.userName} is typing...
                      </span>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button 
                      onClick={handleRegenSubmit}
                      className="btn-editorial flex-1 py-3 text-[9px]"
                    >
                      Update Day
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowRegenInput(false); }}
                      className="btn-ghost-editorial px-8 py-3 text-[9px]"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowRegenInput(true); }}
                  className="w-full border-2 border-dashed border-white/5 hover:border-emerald/40 text-parchment-100/20 hover:text-emerald rounded-2xl py-5 px-8 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-700 bg-transparent group"
                >
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-1000" />
                  Replan Day
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DayCard);
