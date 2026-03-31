import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import PageTransition from '../components/shared/PageTransition';
import { Sparkles } from 'lucide-react';
import mountainsImg from '../assets/mountains.png';

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [registrationEmail, setRegistrationEmail] = useState(null);
  const user = useAuthStore(state => state.user);
  const isLoading = useAuthStore(state => state.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && !registrationEmail) {
      navigate('/dashboard');
    }
  }, [user, navigate, registrationEmail, isLoading]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden bg-auth-fabric">
        
        <div className="absolute inset-0 pointer-events-none z-0">
           <img 
             src={mountainsImg} 
             alt="" 
             className="w-full h-full object-cover opacity-10 mix-blend-screen grayscale-[50%]"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        </div>

        <div className="max-w-md w-full animate-fade-slide-up relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 mb-6 shadow-glass">
               <Sparkles size={16} className="text-emerald" />
               <h1 className="text-xl font-black text-parchment-100 tracking-tighter uppercase leading-none">
                 Wander<span className="text-emerald">AI</span>
               </h1>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-parchment-100/40">Login or Create Account</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 p-10 shadow-glass">
            <div className="bg-white/5 rounded-3xl p-1.5 flex mb-10 shadow-inner border border-white/5">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-500 rounded-2xl ${
                  activeTab === 'login'
                    ? 'bg-emerald text-vintage_grape-500 shadow-xl shadow-emerald/20 scale-[1.02]'
                    : 'text-parchment-100/40 hover:text-parchment-100 hover:bg-white/5'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-500 rounded-2xl ${
                  activeTab === 'register'
                    ? 'bg-emerald text-vintage_grape-500 shadow-xl shadow-emerald/20 scale-[1.02]'
                    : 'text-parchment-100/40 hover:text-parchment-100 hover:bg-white/5'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="animate-fade-in">
              {registrationEmail ? (
                <div className="flex flex-col items-center text-center py-6 space-y-8 animate-fade-slide-up">
                   <div className="w-20 h-20 bg-emerald rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald/20">
                      <Sparkles size={32} className="text-vintage_grape-500" />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-2xl font-black text-parchment-100 uppercase tracking-tighter leading-none italic">Welcome!</h2>
                      <p className="text-[10px] font-bold text-parchment-100/60 uppercase tracking-widest leading-loose">
                        We sent a verification link to:<br />
                        <span className="text-emerald font-black">{registrationEmail}</span>
                      </p>
                   </div>
                   <div className="pt-4 space-y-4 w-full">
                      <button 
                         onClick={() => navigate('/dashboard')}
                         className="w-full bg-white text-vintage_grape-500 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald transition-all active:scale-95 shadow-glass"
                      >
                        Go to Dashboard
                      </button>
                      <button 
                        onClick={() => setRegistrationEmail(null)}
                        className="text-[9px] font-black text-parchment-100/40 uppercase tracking-widest hover:text-emerald transition-all"
                      >
                        Back to Login
                      </button>
                   </div>
                </div>
              ) : activeTab === 'login' ? (
                <div className="space-y-6">
                  <LoginForm onSuccess={() => navigate('/dashboard')} />
                </div>
              ) : (
                <RegisterForm onSuccess={(email) => setRegistrationEmail(email)} />
              )}
            </div>
          </div>

          <div className="mt-12 text-center space-y-2">
            <div className="h-px w-10 bg-white/10 mx-auto mb-8" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-100/30 leading-loose">
              By continued access, you agree to our<br />
              <span className="text-parchment-100/60 hover:text-parchment-100 transition-colors cursor-pointer">Terms and Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
