import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Sparkles, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navbarEntry, mobileMenuVariants, buttonInteraction } from '../../lib/animations';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import PrefetchLink from '../shared/PrefetchLink';

export default function Navbar() {
  const user = useAuthStore(state => state.user);
  const clearUser = useAuthStore(state => state.clearUser);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleLogout = async () => {
    setIsMenuOpen(false);
    const toastId = toast.loading('Logging out...');
    try {
      authAPI.logout().catch(err => console.error("Logout API failed:", err));
      clearUser();
      toast.success('Logged out.', { id: toastId });
      navigate('/');
    } catch {
      toast.error('Logout sync failed.', { id: toastId });
    }
  };

  return (
    <motion.nav 
      initial="initial"
      animate="animate"
      variants={navbarEntry}
      className="sticky top-0 z-50 bg-[#1a1c1e]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center gap-8">
            <motion.div {...buttonInteraction}>
              <PrefetchLink to="/" loaderKey="Landing" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-emerald rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-glass animate-pulse-slow">
                  <Sparkles size={18} className="text-vintage_grape-500" />
                </div>
                <span className="text-xl font-black text-parchment-100 tracking-tighter uppercase transition-all duration-500 group-hover:tracking-tight">Wander<span className="text-emerald">AI</span></span>
              </PrefetchLink>
            </motion.div>

            <div className="hidden md:flex items-center gap-1">
              {user && (
                <>
                  <PrefetchLink 
                    to="/dashboard" 
                    loaderKey="Dashboard"
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                      isActive('/dashboard') ? 'text-emerald bg-emerald/5' : 'text-parchment-100/40 hover:text-emerald hover:bg-white/5'
                    }`}
                  >
                    Dashboard
                  </PrefetchLink>
                  <PrefetchLink 
                    to="/generate" 
                    loaderKey="Generate"
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                      isActive('/generate') ? 'text-emerald bg-emerald/5' : 'text-parchment-100/40 hover:text-emerald hover:bg-white/5'
                    }`}
                  >
                    Generate
                  </PrefetchLink>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button 
                  {...buttonInteraction}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95 shadow-glass"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald flex items-center justify-center text-vintage_grape-500 font-black text-xs shadow-glass">
                    {user.name?.[0].toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`text-parchment-100/40 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#1a1c1e] border border-white/10 rounded-3xl shadow-glass p-2 animate-fade-in z-50 overflow-hidden ring-4 ring-black/20">
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-parchment-100 uppercase tracking-tighter truncate">{user.name}</p>
                        {user.emailVerified && (
                          <div className="text-emerald" title="Verified">
                            <Sparkles size={10} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-parchment-100/40 truncate">{user.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => { navigate('/dashboard'); setIsDropdownOpen(false); }}
                      onMouseEnter={() => loaders.Dashboard?.().catch(() => {})}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-parchment-100/60 uppercase tracking-widest hover:bg-white/10 hover:text-parchment-100 rounded-2xl transition-all active:scale-95"
                    >
                      <LayoutDashboard size={14} />
                      Dashboard
                    </button>

                    <button 
                      onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                      onMouseEnter={() => loaders.Profile?.().catch(() => {})}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-parchment-100/60 uppercase tracking-widest hover:bg-white/10 hover:text-parchment-100 rounded-2xl transition-all active:scale-95"
                    >
                      <User size={14} />
                      Profile
                    </button>
                    
                    <button 
                      onClick={() => { navigate('/generate'); setIsDropdownOpen(false); }}
                      onMouseEnter={() => loaders.Generate?.().catch(() => {})}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-parchment-100/60 uppercase tracking-widest hover:bg-white/10 hover:text-parchment-100 rounded-2xl transition-all active:scale-95"
                    >
                      <Sparkles size={14} />
                      New Trip
                    </button>

                    <div className="h-px bg-white/5 my-1 mx-2" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 rounded-2xl transition-all active:scale-95"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <motion.div {...buttonInteraction}>
                  <Link to="/auth" className="text-xs font-black text-parchment-100 uppercase tracking-widest hover:text-emerald transition-colors">Login</Link>
                </motion.div>
                <motion.div {...buttonInteraction}>
                  <Link 
                    to="/auth" 
                    onMouseEnter={() => loaders.Auth?.().catch(() => {})}
                    className="bg-emerald text-vintage_grape-500 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all shadow-glass"
                  >
                    Start Planning
                  </Link>
                </motion.div>
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-parchment-100/40 hover:bg-white/5 rounded-xl transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden absolute top-16 left-0 right-0 bg-[#131516] border-b border-white/5 p-8 space-y-6 shadow-2xl z-50 overflow-hidden"
          >
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald flex items-center justify-center text-vintage_grape-500 font-black text-sm shadow-glass">
                    {user.name?.[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-parchment-100 uppercase truncate tracking-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-parchment-100/30 truncate uppercase tracking-widest">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full px-6 py-4 text-[10px] font-black text-parchment-100 uppercase tracking-[0.3em] bg-white/5 rounded-2xl border border-transparent active:border-emerald/30 transition-all text-center">Dashboard</Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-full px-6 py-4 text-[10px] font-black text-parchment-100 uppercase tracking-[0.3em] bg-white/5 rounded-2xl border border-transparent active:border-emerald/30 transition-all text-center">Profile</Link>
                  <Link to="/generate" onClick={() => setIsMenuOpen(false)} className="w-full px-6 py-4 text-[10px] font-black text-vintage_grape-500 uppercase tracking-[0.3em] bg-emerald rounded-2xl border border-transparent active:scale-95 transition-all text-center">New Trip</Link>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-6 text-[10px] font-black text-red-500 uppercase tracking-[0.5em] border-t border-white/5 mt-4 opacity-40 hover:opacity-100 transition-opacity"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full py-5 text-center text-[10px] font-black text-parchment-100 uppercase tracking-[0.3em] bg-white/5 rounded-2xl border border-white/10">Login</Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full py-5 text-center text-[10px] font-black text-vintage_grape-500 uppercase tracking-[0.3em] bg-emerald rounded-2xl shadow-glass">Join</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
