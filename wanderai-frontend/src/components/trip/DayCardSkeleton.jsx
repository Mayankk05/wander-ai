export default function DayCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-6 shadow-glass animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded-full" />
            <div className="h-3 w-16 bg-white/5 rounded-full" />
          </div>
        </div>
        <div className="h-6 w-16 bg-white/10 rounded-xl" />
      </div>

      {/* Activity Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-white/10 shrink-0" />
              {i !== 3 && <div className="w-px h-full bg-white/5 my-1" />}
            </div>
            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-1/3 bg-white/10 rounded-full" />
                <div className="h-3 w-12 bg-white/10 rounded-full" />
              </div>
              <div className="h-2 w-3/4 bg-white/5 rounded-full" />
              <div className="h-2 w-1/2 bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
