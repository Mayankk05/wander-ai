import { useState } from 'react';
import { Sparkles, MapPin, Compass, Building2, Mountain, Camera, Utensils, Music, Coffee, ShoppingBag, Heart, Home, User, Users, Loader2, AlertCircle } from 'lucide-react';
import PageTransition from '../shared/PageTransition';

const TRIP_TYPES = [
  { id: 'solo', label: 'Solo', icon: User, description: 'Single traveler', color: 'azure' },
  { id: 'couple', label: 'Couple', icon: Heart, description: 'Romantic duo', color: 'rose' },
  { id: 'family', label: 'Family', icon: Home, description: 'Group with kids', color: 'emerald' },
  { id: 'friends', label: 'Friends', icon: Users, description: 'Social getaway', color: 'violet' },
];

const INTERESTS = [
  { id: 'photography', label: 'Photography', icon: Camera, color: 'azure' },
  { id: 'food', label: 'Culinary', icon: Utensils, color: 'rose' },
  { id: 'nature', label: 'Nature', icon: Mountain, color: 'emerald' },
  { id: 'history', label: 'History', icon: Building2, color: 'amber-500' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'violet' },
  { id: 'music', label: 'Nightlife', icon: Music, color: 'poppy' },
  { id: 'hidden_gems', label: 'Hidden Gems', icon: Compass, color: 'emerald' },
  { id: 'wellness', label: 'Wellness', icon: Coffee, color: 'azure' },
];

export default function GeneratorInput({ onGenerate, error }) {
  const [prompt, setPrompt] = useState('');
  const [tripType, setTripType] = useState('solo');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;
    setIsSubmitting(true);
    onGenerate({ prompt, tripType, interests: selectedInterests });
  };

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isPromptTooLong = prompt.length > 500;
  const isReady = prompt.length > 5 && !isPromptTooLong;

  return (
    <PageTransition>
      <div className="flex flex-col items-center text-center space-y-8 animate-reveal max-w-[100vw] overflow-x-hidden pt-12 pb-20">
        
        {/* SPECTRAL HEADER */}
        <header className="flex flex-col items-center space-y-3 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-2 shadow-glass">
             <Sparkles size={12} className="text-emerald animate-pulse" />
             <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-parchment-100">Trip Planner</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-parchment-100 tracking-tight leading-none uppercase">
            Plan Your Next <span className="text-emerald italic">Trip</span>
          </h1>
        </header>

        <div className="w-full max-w-3xl px-6 relative z-10">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl p-8 md:p-10 space-y-10 shadow-glass relative overflow-visible group"
          >
            {/* INPUT SECTION */}
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-parchment-100/40 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                <MapPin size={12} className="text-emerald" /> Where would you like to go?
              </label>
              <div className="relative group/input">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 7 Days in Tokyo & Kyoto with high-density culinary focus..."
                  className={`w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-lg font-bold text-parchment-100 placeholder:text-parchment-100/20 focus:outline-none focus:ring-8 focus:ring-emerald/5 focus:border-emerald transition-all duration-500 min-h-[140px] resize-none shadow-inner ${isPromptTooLong ? 'ring-8 ring-rose-500/10 border-rose-500' : ''}`}
                />
                <div className="absolute bottom-6 right-6">
                  <span className={`text-[9px] font-bold tracking-widest ${prompt.length > 450 ? 'text-rose-500' : 'text-parchment-100/20'}`}>
                    {prompt.length}/500
                  </span>
                </div>
              </div>
            </div>

            {/* DYNAMICS SECTION */}
            <div className="space-y-5">
              <label className="text-[9px] font-bold text-parchment-100/40 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                Select Trip Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TRIP_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setTripType(type.id)}
                    className={`flex items-center gap-3 py-4 px-4 rounded-xl border transition-all duration-500 ${
                      tripType === type.id 
                        ? `bg-emerald border-emerald text-vintage_grape-500 shadow-glow-emerald scale-105 -translate-y-1` 
                        : 'bg-white/5 border-white/10 text-parchment-100/40 hover:bg-white/10 hover:text-parchment-100'
                    }`}
                  >
                    <type.icon size={16} className={`${tripType === type.id ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* THEMES SECTION */}
            <div className="space-y-5">
              <label className="text-[9px] font-bold text-parchment-100/40 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                Tell us what you love
              </label>
              <div className="flex flex-wrap gap-2.5">
                {INTERESTS.map((interest) => {
                  const isActive = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 text-[9px] font-bold uppercase tracking-widest ${
                        isActive
                          ? `bg-emerald border-emerald text-vintage_grape-500 shadow-glow-emerald scale-105 -translate-y-0.5`
                          : 'bg-white/5 border-white/10 text-parchment-100/40 hover:bg-white/10 hover:text-parchment-100'
                      }`}
                    >
                      <interest.icon size={12} className={isActive ? 'animate-bounce' : ''} />
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SUBMIT SECTION */}
            <div className="pt-8 border-t border-white/5 flex flex-col items-center space-y-6">
              {error && (
                <div className="flex items-center gap-3 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20 animate-reveal shadow-glow-poppy">
                  <AlertCircle size={14} className="text-rose-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500">{error}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!isReady || isSubmitting}
                className={`w-full btn-editorial py-6 text-sm relative group overflow-hidden ${isReady ? 'shadow-glow-emerald bg-emerald' : 'opacity-40 grayscale cursor-not-allowed'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald to-azure opacity-0 group-hover:opacity-20 transition-opacity" />
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={20} />
                    PLANNING...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    GENERATE MY TRIP
                    <Sparkles size={20} className="group-hover:rotate-12 group-hover:scale-125 transition-all duration-500" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
