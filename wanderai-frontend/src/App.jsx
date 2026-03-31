import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { authAPI } from './api';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ScrollToTop from './components/shared/ScrollToTop';
import PageTransition from './components/shared/PageTransition';
import LoadingOverlay from './components/shared/LoadingOverlay';

export const loaders = {
  Landing: () => import('./pages/Landing'),
  Auth: () => import('./pages/Auth'),
  Dashboard: () => import('./pages/Dashboard'),
  Generate: () => import('./pages/Generate'),
  TripDetail: () => import('./pages/TripDetail'),
  ShareView: () => import('./pages/ShareView'),
  ExportPage: () => import('./pages/ExportPage'),
  Profile: () => import('./pages/Profile'),
  VerifyEmail: () => import('./pages/VerifyEmail'),
  ResetPassword: () => import('./pages/ResetPassword'),
  ForgotPassword: () => import('./pages/ForgotPassword'),
  NotFound: () => import('./pages/NotFound')
};

const Landing = lazy(loaders.Landing);
const Auth = lazy(loaders.Auth);
const Dashboard = lazy(loaders.Dashboard);
const Generate = lazy(loaders.Generate);
const TripDetail = lazy(loaders.TripDetail);
const ShareView = lazy(loaders.ShareView);
const ExportPage = lazy(loaders.ExportPage);
const Profile = lazy(loaders.Profile);
const VerifyEmail = lazy(loaders.VerifyEmail);
const ResetPassword = lazy(loaders.ResetPassword);
const ForgotPassword = lazy(loaders.ForgotPassword);
const NotFound = lazy(loaders.NotFound);

function AnimatedRoutes({ user }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/share/:token" element={<ShareView />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/trip/:id" element={<TripDetail />} />
          <Route path="/trip/:id/export" element={<ExportPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const user = useAuthStore(state => state.user);
  const initialize = useAuthStore(state => state.initialize);
  const isLoading = useAuthStore(state => state.isLoading);

  NProgress.configure({ 
    showSpinner: false, 
    speed: 400, 
    minimum: 0.1,
    easing: 'ease'
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="relative group">
           <LoadingSpinner size="lg" />
           <div className="absolute inset-0 bg-emerald/20 blur-3xl rounded-full" />
           <p className="text-vintage_grape-500/40 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse text-center">Starting up...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col selection:bg-emerald/20 selection:text-emerald font-sans antialiased text-vintage_grape-500 overflow-x-hidden">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<LoadingOverlay />}>
              <AnimatedRoutes user={user} />
            </Suspense>
          </main>

           <Toaster 
             position="bottom-right"
             toastOptions={{
               duration: 4000,
               style: {
                 background: 'var(--lime_cream-800)',
                 color: 'var(--vintage_grape-500)',
                 border: '1px solid var(--lime_cream-700)',
                 borderRadius: '2rem',
                 padding: '16px 24px',
                 fontSize: '11px',
                 fontWeight: '900',
                 textTransform: 'uppercase',
                 letterSpacing: '0.1em',
                 boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
               },
               success: {
                 iconTheme: {
                    primary: 'var(--emerald)',
                    secondary: 'var(--lime_cream-900)',
                 },
               },
               error: {
                 iconTheme: {
                   primary: 'var(--rose-600)',
                   secondary: 'var(--lime_cream-800)',
                 },
               },
             }}
           />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
