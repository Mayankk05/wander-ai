import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const user = useAuthStore(state => state.user);
  const isLoading = useAuthStore(state => state.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lime_cream-900 flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-vintage_grape-500/40 animate-pulse">
          Checking sign in...
        </p>
      </div>
    );
  }

  // If no user is logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Support both direct wrapping and layout routing
  return children || <Outlet />;
}
