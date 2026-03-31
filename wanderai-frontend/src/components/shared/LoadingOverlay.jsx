import { useEffect } from 'react';
import NProgress from 'nprogress';

/**
 * LoadingOverlay:
 * A lightweight component that starts NProgress when mounted (Suspense fallback)
 * and stops it when unmounted.
 */
export default function LoadingOverlay() {
  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none bg-[#131516]/40 backdrop-blur-md animate-fade-in flex items-center justify-center">
      {/* Optional: subtle spinner if the load takes > 1s */}
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-emerald animate-spin shadow-glass" />
    </div>
  );
}
