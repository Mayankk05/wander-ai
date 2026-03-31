import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import PageTransition from '../components/shared/PageTransition';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword({ token, password });
      toast.success('Password updated successfully');
      navigate('/auth');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset link expired or invalid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-auth-fabric flex flex-col items-center justify-center p-6 selection:bg-emerald selection:text-white relative overflow-hidden">
        {/* Depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        <div className="max-w-md w-full animate-fade-slide-up relative z-10">
          
          {/* LOGO AREA */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2.8rem] flex items-center justify-center shadow-glass mx-auto mb-8 transform hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={48} className="text-emerald" />
            </div>
            <h1 className="text-5xl font-black text-parchment-100 italic tracking-tighter uppercase mb-2 leading-none">Wander<span className="text-emerald">AI</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-parchment-100/40">Credential Recovery</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-12 backdrop-blur-xl shadow-glass text-center">
             <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in">
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-parchment-100 uppercase tracking-tighter leading-none">New Code</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-parchment-100/40 leading-loose">
                    Update your system access credentials.
                  </p>
                </div>

                <div className="space-y-4">
                   <div className="relative">
                      <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                      <input 
                        type="password" 
                        placeholder="NEW CREDENTIAL" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-8 py-5 text-sm font-bold text-parchment-100 placeholder:text-parchment-100/10 focus:outline-none focus:border-emerald transition-all text-center tracking-widest"
                        required
                      />
                   </div>
                   <div className="relative">
                      <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                      <input 
                        type="password" 
                        placeholder="Verify Credential" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-8 py-5 text-sm font-bold text-parchment-100 placeholder:text-parchment-100/10 focus:outline-none focus:border-emerald transition-all text-center tracking-widest"
                        required
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-vintage_grape-500 py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald active:scale-95 transition-all shadow-glass disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Code'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
             </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
