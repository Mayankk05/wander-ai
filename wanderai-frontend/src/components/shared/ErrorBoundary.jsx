import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-lime_cream-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-emerald/10 rounded-3xl flex items-center justify-center mb-8 animate-fade-in">
            <AlertTriangle size={40} className="text-emerald" />
          </div>
          
          <h1 className="text-2xl font-black text-vintage_grape-500 uppercase tracking-tight mb-3 animate-fade-slide-up delay-100">
            Something went wrong
          </h1>
          
          <p className="text-sm text-dusty_grape-500 max-w-sm mx-auto leading-relaxed mb-10 animate-fade-slide-up delay-200">
            We encountered an unexpected hurdle while preparing your journey. Please refresh or return home to continue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-slide-up delay-300">
            <button 
              onClick={() => window.location.reload()}
              className="bg-emerald text-vintage_grape-100 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg"
            >
              <RefreshCw size={16} />
              Refresh Page
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-lime_cream-800 border-2 border-lime_cream-600 text-vintage_grape-500 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-lime_cream-700 active:scale-95 transition-all"
            >
              <Home size={16} />
              Return Home
            </button>
          </div>
          
          <div className="mt-16 text-[10px] font-bold text-dusty_grape-400 uppercase tracking-[0.4em]">
            Error Reference: APP_RECOVERY_01
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
