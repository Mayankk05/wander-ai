export default function SkeletonCard() {
  return (
    <div className="bg-[#1a1c1e] border border-white/5 rounded-[2rem] overflow-hidden shadow-glass">
      <div className="h-48 bg-white/5 skeleton-shimmer" />
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-3/4 bg-white/5 rounded-full skeleton-shimmer" />
          <div className="h-4 w-12 bg-white/5 rounded-full skeleton-shimmer" />
        </div>
        
        <div className="space-y-2">
          <div className="h-3 w-1/2 bg-white/10 rounded-full skeleton-shimmer" />
          <div className="h-3 w-2/3 bg-white/10 rounded-full skeleton-shimmer" />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <div className="h-6 w-24 bg-white/5 rounded-full skeleton-shimmer" />
          <div className="h-6 w-16 bg-white/5 rounded-full skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
