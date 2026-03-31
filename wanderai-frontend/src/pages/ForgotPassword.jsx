import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import { Mail, ArrowLeft, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification link failed to dispatch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-auth-fabric flex flex-col items-center justify-center p-6 selection:bg-emerald selection:text-white relative overflow-hidden">
        {/* Root container depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        
        <div className="w-full max-w-lg relative z-10">
          <div className="text-center mb-12">
            <Link to="/auth" className="inline-flex items-center gap-2 mb-8 p-3 bg-white/5 rounded-full border border-white/10 text-parchment-100 hover:bg-white/10 hover:text-emerald transition-all shadow-glass">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-24 h-24 bg-emerald rounded-[2.8rem] flex items-center justify-center shadow-glass mx-auto transform hover:scale-110 transition-transform duration-500 mb-8 cursor-default">
              <Sparkles size={48} className="text-vintage_grape-500" />
            </div>
            <h1 className="text-5xl font-black text-parchment-100 italic tracking-tighter uppercase mb-4 leading-none">Wander<span className="text-emerald">AI</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-parchment-100/40">Reset Password</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-glass backdrop-blur-xl relative overflow-hidden">
            {submitted ? (
              <div className="text-center space-y-8 animate-fade-in">
                <div className="w-20 h-20 bg-emerald rounded-[2rem] flex items-center justify-center mx-auto shadow-glass">
                  <CheckCircle2 size={32} className="text-vintage_grape-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-parchment-100 uppercase tracking-tighter leading-none">Link Transmitted</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-parchment-100/40 leading-loose">
                    We've dispatched an encrypted verification link to <span className="text-emerald">{email}</span>. Please check your terminal inboxes.
                  </p>
                </div>
                <Link 
                  to="/auth" 
                  className="mt-8 block bg-white text-vintage_grape-500 py-5 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald transition-all active:scale-95 shadow-glass"
                >
                  Return to Port
                </Link>
              </div>
            ) : (
               <form onSubmit={handleSubmit} className="space-y-10">
                 <div className="text-center mb-4">
                   <h2 className="text-2xl font-black text-parchment-100 uppercase tracking-tighter leading-none">Recover Access</h2>
                   <p className="text-[9px] font-black uppercase tracking-widest text-parchment-100/40 leading-loose">
                     Provide your registered identifier to receive an override token.
                   </p>
                 </div>

                 <div className="relative group">
                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                    <input 
                      type="email" 
                      required
                      placeholder="ENTER EMAIL ADDRESS"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-8 py-5 text-sm font-bold text-parchment-100 placeholder:text-parchment-100/10 focus:outline-none focus:border-emerald focus:ring-8 focus:ring-emerald/5 transition-all text-center uppercase tracking-widest"
                    />
                 </div>

                 {error && (
                   <p className="text-[9px] font-black text-rose-500 text-center uppercase tracking-widest bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 shadow-glass">
                     {error}
                   </p>
                 )}

                 <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-vintage_grape-500 py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald active:scale-95 transition-all shadow-glass disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> }
                    SEND RECOVERY LINK
                  </button>
               </form>
            )}
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[-1]" 
             style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </PageTransition>
  );
}
