import { Map, Globe, Calendar } from 'lucide-react';
import { memo } from 'react';

const StatCard = memo(({ icon: Icon, label, value, color, delay }) => (
  <div 
    className="relative overflow-hidden bg-white/5 rounded-[2rem] border border-white/10 p-5 flex items-center gap-5 shadow-glass hover:shadow-hover transition-all duration-500 hover:-translate-y-1 group animate-reveal"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald/10 text-emerald border border-emerald/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-parchment-100/30 text-[8px] font-black uppercase tracking-[0.3em] mb-1 leading-none truncate">
        {label}
      </p>
      <p className="text-2xl font-black text-parchment-100 tabular-nums leading-none">
        {value}
      </p>
    </div>
    
    {/* Subtle Bottom Accent */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </div>
));

function StatsBar({ trips = [] }) {
  const totalTrips = trips.length;
  
  const uniqueDestinations = new Set(
    trips.map((t) => t.destination?.toLowerCase().trim())
  ).size;

  const totalDays = trips.reduce((sum, trip) => sum + (trip.days || 0), 0);



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
      <StatCard
        icon={Map}
        label="Total Trips"
        value={totalTrips}
        color="emerald"
        delay={100}
      />
      <StatCard
        icon={Globe}
        label="Destinations"
        value={uniqueDestinations}
        color="emerald"
        delay={150}
      />
      <StatCard
        icon={Calendar}
        label="Total Days"
        value={`${totalDays}d`}
        color="emerald"
        delay={200}
      />
    </div>
  );
}

export default memo(StatsBar);
