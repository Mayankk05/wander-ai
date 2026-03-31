import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { authAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const setUser = useAuthStore(state => state.setUser);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const pass = formData.password;
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald'];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (strength < 4) {
      setError('Please meet all requirements: 8+ characters, an uppercase letter, a number, and a symbol.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await authAPI.register(formData);
      setUser(res.data.user);
      
      // PERSISTENT TOAST: visible after redirect
      toast.success('Registration successful! Please check your email to verify your account.', {
        duration: 10000,
        id: 'registration-success',
        icon: '✉️',
      });

      if (onSuccess) onSuccess(formData.email);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl p-5 text-[10px] font-black uppercase tracking-widest mb-8 flex items-start gap-3 shadow-glass">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.3em] block px-1">Full Name</label>
          <input
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-parchment-100 focus:outline-none focus:ring-8 focus:ring-emerald/5 focus:border-emerald transition-all placeholder:text-parchment-100/20 shadow-inner"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.3em] block px-1">Email Address</label>
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-parchment-100 focus:outline-none focus:ring-8 focus:ring-emerald/5 focus:border-emerald transition-all placeholder:text-parchment-100/20 shadow-inner"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.3em] block px-1">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
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

          <div className="mt-5 px-1">
            <div className="h-1.5 w-full bg-white/10 rounded-full flex gap-1.5 p-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-full transition-all duration-700 ${
                    i <= strength ? strengthColors[strength - 1] : 'bg-white/5'
                  }`}
                />
              ))}
            </div>
            <p className="text-[9px] text-parchment-100/40 mt-3 font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} className={strength === 4 ? 'text-emerald' : 'text-parchment-100/20'} />
              8+ Characters • Uppercase • Number • Symbol
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || strength < 4}
          className="w-full bg-emerald text-vintage_grape-500 py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-8 shadow-glass hover:bg-emerald/90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Creating...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
