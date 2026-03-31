import { useState } from 'react';
import { Mail, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function VerifyBanner() {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authAPI.resendVerification();
      toast.success('Verification email sent');
    } catch {
      toast.error('Could not send email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-[#1a1c1e]/80 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glass hover:bg-[#1a1c1e] transition-all max-w-5xl animate-fade-slide-up group">
      <div className="flex items-center gap-4 transition-transform duration-500 group-hover:translate-x-1">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
          <AlertTriangle size={18} className="text-emerald animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-[10px] md:text-xs font-black text-parchment-100 uppercase tracking-tight leading-none">Email Verification Required</h3>
          <p className="text-[7px] md:text-[8px] font-black text-parchment-100/40 uppercase tracking-[0.2em] leading-relaxed max-w-xs md:max-w-none">
            Please check your email to verify your account and see all your trips.
          </p>
        </div>
      </div>

      <button 
        disabled={isResending}
        onClick={handleResend}
        className="w-full sm:w-auto bg-parchment-100/90 text-vintage_grape-500 px-6 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-glass disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
      >
        {isResending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
        {isResending ? 'Sending...' : 'Resend Email'}
      </button>
    </div>
  );
}
