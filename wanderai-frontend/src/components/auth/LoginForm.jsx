import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { authAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const setUser = useAuthStore(state => state.setUser);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authAPI.login({ email, password });
      setUser(res.data.user);
      toast.success('Welcome back!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.forgotPassword(email);
      toast.success('Reset link sent! Check your email.');
      setView('login');
    } catch {
      setError(err.response?.data?.error || 'Could not send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'forgot') {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <button
          onClick={() => setView('login')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-parchment-100/40 hover:text-emerald mb-8 transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        <h2 className="text-2xl font-black text-parchment-100 mb-2 uppercase tracking-tighter italic">Reset Password</h2>
        <p className="text-[10px] font-bold text-parchment-100/40 uppercase tracking-widest mb-10 leading-loose">
          Send a password reset link to your email address.
        </p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl p-5 text-[10px] font-black uppercase tracking-widest mb-8 flex items-start gap-3 shadow-glass">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.3em] block px-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-parchment-100 focus:outline-none focus:ring-8 focus:ring-emerald/5 focus:border-emerald transition-all placeholder:text-parchment-100/20 shadow-inner"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-emerald text-vintage_grape-500 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-10 shadow-glass hover:bg-emerald/90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl p-5 text-[10px] font-black uppercase tracking-widest mb-8 flex items-start gap-3 shadow-glass">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.3em] block px-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-parchment-100 focus:outline-none focus:ring-8 focus:ring-emerald/5 focus:border-emerald transition-all placeholder:text-parchment-100/20 shadow-inner"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.3em] block px-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-16 text-sm font-bold text-parchment-100 focus:outline-none focus:ring-8 focus:ring-emerald/5 focus:border-emerald transition-all placeholder:text-parchment-100/20 shadow-inner"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-parchment-100/30 hover:text-parchment-100 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pr-2">
          <button
            type="button"
            onClick={() => setView('forgot')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald hover:opacity-80 transition-all cursor-pointer"
          >
            Reset Code
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full bg-emerald text-vintage_grape-500 py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-10 shadow-glass hover:bg-emerald/90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Verifying...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
}
