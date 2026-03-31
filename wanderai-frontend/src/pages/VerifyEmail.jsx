import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { authAPI } from '../api';
import PageTransition from '../components/shared/PageTransition';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying account...');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Your account has been verified.');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'This link has expired or is invalid.');
      }
    }
    verify();
  }, [token]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-auth-fabric flex items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[4rem] p-10 backdrop-blur-xl shadow-glass animate-fade-slide-up relative overflow-hidden z-10">
          
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pacific_cyan-600/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            {status === 'loading' && (
              <div className="space-y-8 py-8 w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center shadow-inner animate-pulse border border-white/10">
                  <Loader2 size={32} className="text-emerald animate-spin" />
                </div>
                <h1 className="text-2xl font-black text-parchment-100 uppercase tracking-tighter leading-none animate-pulse">Checking...</h1>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-8 py-8 w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald rounded-[2.5rem] flex items-center justify-center shadow-glass animate-fade-in">
                  <ShieldCheck size={40} className="text-vintage_grape-500" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl font-black text-parchment-100 uppercase tracking-tighter leading-none">Verified</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-100/40 leading-loose">
                    {message}
                  </p>
                </div>
                <Link 
                  to="/dashboard" 
                  className="bg-white text-vintage_grape-500 px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald transition-all active:scale-95 shadow-glass flex items-center gap-3"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-8 py-8 w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center shadow-glass border border-rose-500/20">
                  <XCircle size={40} className="text-rose-500" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl font-black text-parchment-100 uppercase tracking-tighter leading-none">Could not verify</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60 font-bold leading-loose">
                    {message}
                  </p>
                </div>
                <Link 
                  to="/auth" 
                  className="bg-white text-vintage_grape-500 px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald transition-all active:scale-95 shadow-glass flex items-center gap-3"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
