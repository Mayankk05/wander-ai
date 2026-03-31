import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronDown, Check, Map, Cloud, Users, FileDown,
  Shield, ArrowRight, Eye, Inbox, Zap, Share2
} from 'lucide-react';
import {
  staggerContainer,
  itemFadeUp,
  buttonInteraction,
  slideInFromLeft,
  slideInFromRight
} from '../lib/animations';
import { useAuthStore } from '../store/authStore';
import { loaders } from '../App';
import PageTransition from '../components/shared/PageTransition';
import mountainsImg from '../assets/mountains.png';
import explorerImg from '../assets/explorer.png';

export default function Landing() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        loaders.Dashboard?.().catch(() => {});
        loaders.Generate?.().catch(() => {});
      } else {
        loaders.Auth?.().catch(() => {});
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleCTAEnter = () => {
    if (user) {
      loaders.Generate?.().catch(() => { });
    } else {
      loaders.Auth?.().catch(() => { });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment-100 overflow-x-hidden selection:bg-emerald selection:text-white">

        <section
          className="min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-start relative overflow-hidden px-6 pt-16 md:pt-24 pb-12 md:pb-20"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-parchment-200 via-parchment-100 to-transparent z-0" />

          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald blur-3xl pointer-events-none" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-pacific_cyan blur-3xl pointer-events-none" 
          />

          <div className="absolute bottom-0 left-0 right-0 h-[30rem] pointer-events-none z-0">
            <img
              src={mountainsImg}
              alt=""
              fetchPriority="high"
              className="w-full h-full object-cover object-bottom opacity-20 mix-blend-multiply transition-all duration-1000 grayscale-[50%] brightness-75"
            />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-parchment-100 to-transparent" />
          </div>

          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="relative z-10 max-w-4xl mx-auto text-center"
          >
            <motion.div 
              variants={itemFadeUp}
              className="inline-flex items-center gap-2 bg-parchment-200 border border-parchment-300 rounded-full px-5 py-2 mb-10 shadow-sm"
            >
              <Sparkles size={14} className="text-emerald" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-espresso">The AI Explorer</span>
            </motion.div>

            <motion.div variants={itemFadeUp} className="my-8 md:my-10 max-w-5xl mx-auto w-full px-4 overflow-hidden">
              <h1 className="text-fluid-h1 font-black text-espresso leading-[1.1] tracking-tight mb-6 md:mb-8 uppercase break-words hyphens-auto">
                Describe your trip{" "}
                <span className="relative inline-block text-emerald italic">
                  in one sentence.
                  <span className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-1 sm:h-2 bg-emerald/10 -z-10 rounded-full" />
                </span>
              </h1>
            </motion.div>

            <motion.div variants={itemFadeUp}>
              <p className="text-sm md:text-base text-espresso/60 max-w-2xl mx-auto leading-relaxed mb-12 font-bold uppercase tracking-widest">
                Plan professional itineraries with precision maps, local tips, and real-time collaboration.
              </p>
            </motion.div>

            <motion.div variants={itemFadeUp} className="max-w-3xl mx-auto mb-12">
              <div className="flex flex-col items-center gap-4">
                <span className="text-[9px] md:text-[10px] font-black text-espresso/30 uppercase tracking-[0.5em] mb-4">Start your journey</span>
                <div className="w-full bg-parchment-200/80 backdrop-blur-md border border-parchment-300 rounded-[2.5rem] md:rounded-[3rem] p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 shadow-2xl group transition-all max-w-[95vw]">
                  <div className="flex-1 w-full bg-parchment-100/50 rounded-[1.5rem] md:rounded-[2rem] px-5 sm:px-8 py-5 md:py-6 text-left border border-parchment-300 group-focus-within:border-emerald/50 transition-all shadow-inner overflow-hidden min-w-0">
                    <p className="text-xs font-black text-espresso/20 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                      "14 days in Japan, focus on hidden temples, budget $3000..."
                    </p>
                  </div>
                  <motion.button
                    {...buttonInteraction}
                    onClick={() => navigate(user ? '/generate' : '/auth')}
                    onMouseEnter={handleCTAEnter}
                    onTouchStart={handleCTAEnter}
                    className="w-full md:w-auto bg-espresso text-parchment-100 px-10 md:px-12 py-5 md:py-6 rounded-[2rem] md:rounded-[2.5rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-espresso/90 shadow-xl shadow-espresso/10 transition-all min-h-[44px]"
                  >
                    <Sparkles size={18} className="text-emerald" />
                    Generate Plan
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemFadeUp} className="flex flex-col items-center gap-16">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <motion.div {...buttonInteraction}>
                  <Link
                    to={user ? "/dashboard" : "/auth"}
                    onMouseEnter={() => {
                        if (user) loaders.Dashboard?.().catch(() => {});
                        else loaders.Auth?.().catch(() => {});
                    }}
                    className="group flex items-center gap-4 md:gap-5 px-10 md:px-12 py-5 md:py-6 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-lime_cream-900 bg-emerald hover:bg-emerald/90 transition-all shadow-lg shadow-emerald/20 border border-emerald/20 min-h-[44px]"
                  >
                    {user ? 'View My Trips' : 'Join WanderAI'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>

              <motion.button
                {...buttonInteraction}
                onClick={scrollToFeatures}
                className="flex flex-col items-center gap-4 group"
              >
                <span className="text-[9px] font-black text-espresso/30 uppercase tracking-[0.5em] group-hover:text-emerald transition-colors">Smart Planning</span>
                <div className="w-12 h-12 rounded-full border border-parchment-300 flex items-center justify-center text-espresso group-hover:bg-parchment-200 transition-all">
                  <ChevronDown size={20} className="animate-bounce" />
                </div>
              </motion.button>
            </motion.div>

            <motion.div variants={itemFadeUp} className="mt-16 md:mt-28 py-8 md:py-12 border-y border-parchment-300/50">
              <div className="flex gap-x-8 gap-y-6 justify-center flex-wrap px-4">
                {["Join for free", "Unlimited use", "Real-time sync"].map((text, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-3 transition-transform group cursor-default"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald/10 flex items-center justify-center group-hover:bg-emerald/20 transition-colors">
                      <Check size={12} className="text-emerald" strokeWidth={3} />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-espresso/90 whitespace-nowrap">
                      {text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section
          id="how-it-works"
          className="py-16 bg-moss-300 border-y border-moss-200 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-espresso/20 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={itemFadeUp}
              className="text-center mb-16 relative z-10"
            >
              <div className="inline-flex items-center gap-2 bg-moss-400 border border-moss-200 rounded-full px-5 py-2 mb-6">
                <Eye size={14} className="text-emerald" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-parchment-100">See the Plan</span>
              </div>
              <h2 className="text-3xl font-black text-parchment-100 uppercase tracking-tighter mb-4 italic">The Journey Shared</h2>
              <p className="text-[10px] font-black text-parchment-200/40 uppercase tracking-[0.3em] max-w-lg mx-auto leading-loose">A preview of a 6-day expedition across Northern destinations.</p>
            </motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-4xl mx-auto bg-parchment-100 border border-moss-400 rounded-[3.5rem] shadow-3xl overflow-hidden"
            >
              <div className="bg-parchment-200 border-b border-parchment-300 px-6 md:px-10 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
                  <h3 className="text-lg md:text-xl font-black text-espresso uppercase tracking-tighter">6 Day Expedition</h3>
                  <span className="bg-emerald text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-emerald/20">Verified Path</span>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <span className="text-[9px] md:text-[10px] font-bold text-espresso/30 uppercase tracking-[0.2em]">₹45,000 Allocation</span>
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-parchment-200 bg-parchment-300 flex items-center justify-center text-[10px] font-black text-espresso">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-parchment-100 border-b border-parchment-300 px-6 md:px-10 py-5 flex gap-4 overflow-x-auto custom-scrollbar no-scrollbar-mobile">
                <div className="flex items-center gap-3 bg-emerald text-white px-5 py-2.5 rounded-2xl whitespace-nowrap shadow-xl shadow-emerald/10 flex-shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest">Day 1 · ☀️ Clear</span>
                </div>
                {[2, 3, 4, 5].map(d => (
                  <div key={d} className="flex items-center gap-3 bg-parchment-200 text-espresso/30 px-5 py-2.5 rounded-2xl whitespace-nowrap border border-parchment-300 flex-shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest">Day {d} · 🌦️</span>
                  </div>
                ))}
              </div>

              <div className="p-6 md:p-10">
                <div className="flex items-center gap-4 mb-8 md:mb-10 justify-center md:justify-start">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-emerald flex items-center justify-center text-white font-black text-sm">01</div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-espresso uppercase tracking-tight">Jaipur Trip Plan</h4>
                    <p className="text-[9px] font-black text-emerald uppercase tracking-widest">Cultural Hub • North India</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    {[
                      { name: "Amber Citadel", desc: "Hilltop defense complex with Mughal influence.", time: "3h", tag: "Historical" },
                      { name: "Palace of Winds", desc: "5-story latticework mesh of pink sandstone.", time: "1h", tag: "Observation" },
                      { name: "Johari Grid", desc: "Historic market sector specializing in gemstones.", time: "2h", tag: "Trade" }
                    ].map((p, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="w-px bg-parchment-300 relative my-2">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald ring-[6px] ring-parchment-100" />
                        </div>
                        <div className="flex-1 bg-parchment-200/30 p-6 rounded-[2rem] border border-transparent hover:border-parchment-300 hover:bg-parchment-200 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-xs font-black text-espresso uppercase tracking-wide">{p.name}</h5>
                            <span className="text-[9px] font-bold text-espresso/20 uppercase tracking-[0.2em]">{p.time}</span>
                          </div>
                          <p className="text-[10px] text-espresso/60 leading-relaxed mb-4 font-bold">{p.desc}</p>
                          <div className="flex gap-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald bg-emerald/10 px-3 py-1 rounded-lg">{p.tag}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-parchment-200/50 rounded-[3rem] p-10 border border-parchment-300 flex flex-col justify-between shadow-inner">
                    <div>
                      <h5 className="text-[10px] font-black text-espresso/30 uppercase tracking-[0.4em] mb-8">Dining & Drinks</h5>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center group/item">
                          <span className="text-xs font-black text-espresso uppercase tracking-tight group-hover/item:text-emerald transition-colors">Rawat Mishthan</span>
                          <span className="text-emerald font-black text-xs">₹250</span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                          <span className="text-xs font-black text-espresso uppercase tracking-tight group-hover/item:text-emerald transition-colors">Suvarna Mahal</span>
                          <span className="text-emerald font-black text-xs">₹1,400</span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                          <span className="text-xs font-black text-espresso uppercase tracking-tight group-hover/item:text-emerald transition-colors">Chokhi Dhani</span>
                          <span className="text-emerald font-black text-xs">₹1,000</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-12 pt-10 border-t border-parchment-300">
                      <button
                        onClick={() => navigate(user ? '/generate' : '/auth')}
                        className="w-full bg-espresso text-parchment-100 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-espresso/20 hover:bg-espresso/80 transition-all flex items-center justify-center gap-3"
                      >
                        Generate Full Network <ArrowRight size={14} className="text-emerald" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="py-20 bg-parchment-100 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={itemFadeUp}
              className="text-center mb-12"
            >
              <span className="text-[10px] font-black text-emerald uppercase tracking-[0.5em] mb-6 block">Features</span>
              <h2 className="text-3xl font-black text-espresso uppercase tracking-tighter leading-tight mb-6">Built for absolute accuracy.</h2>
              <div className="w-24 h-1 bg-parchment-300 mx-auto rounded-full" />
            </motion.div>

            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { icon: Sparkles, color: "var(--emerald)", title: "AI Sync", desc: "Building perfect itineraries from your simple descriptions." },
                { icon: Map, color: "var(--emerald)", title: "Real Maps", desc: "Every spot is checked against real-world data for accuracy." },
                { icon: Cloud, color: "var(--dusty_grape-400)", title: "Weather Ready", desc: "Real-time weather data helps you plan for the perfect day." },
                { icon: Users, color: "var(--emerald)", title: "Group Sync", desc: "Share your plans and collaborate with friends in real-time." },
                { icon: FileDown, color: "var(--emerald)", title: "Offline PDF", desc: "Download high-quality itineraries to your device." },
                { icon: Shield, color: "var(--vintage_grape-500)", title: "Private Trips", desc: "Your data is strictly private at all times." }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  variants={itemFadeUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-parchment-200 border border-parchment-300 rounded-[2.5rem] p-8 shadow-sm hover:shadow-card transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-parchment-100 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform">
                    <f.icon size={26} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-black text-espresso uppercase tracking-tight mb-4">{f.title}</h3>
                  <p className="text-[11px] text-espresso/50 leading-relaxed font-bold uppercase tracking-tight">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          className="py-20 bg-parchment-100 relative overflow-hidden"
        >
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 relative">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-parchment-100 rounded-full p-1 border-2 border-parchment-300 shadow-xl animate-bounce-slow z-20 overflow-hidden">
                <img src={explorerImg} alt="Explorer" className="w-full h-full object-cover rounded-full" />
              </div>

              <span className="text-[10px] font-black text-emerald uppercase tracking-[0.6em] mb-6 block pt-12">Our Process</span>
              <h2 className="text-4xl font-black text-espresso uppercase tracking-tighter">Start your journey</h2>
              <p className="text-[9px] font-black text-espresso/30 uppercase tracking-[0.4em] mt-3">Simple & Personal</p>
              <div className="space-y-16 relative">
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute left-6 md:left-1/2 top-10 bottom-10 w-px border-l-2 border-dashed border-parchment-300 hidden md:block" 
                />

                {[
                  { step: "01", icon: Inbox, color: "var(--ochre-500)", title: "Where to?", desc: "Tell us your destination and style. Zero forms required." },
                  { step: "02", icon: Zap, color: "var(--emerald)", title: "Quick Magic", desc: "Our engine builds the plan, finding the best routes in real-time." },
                  { step: "03", icon: Share2, color: "var(--espresso)", title: "Ready!", desc: "Invite friends, export to document, or share the link." }
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={i % 2 === 0 ? slideInFromLeft : slideInFromRight}
                    className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative group"
                  >
                    <div className={`flex-1 w-full order-2 ${i % 2 === 0 ? 'md:order-1 text-center md:text-right' : 'md:order-3 text-center md:text-left'}`}>
                      <div className={`flex items-center gap-3 mb-4 justify-center ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                        <s.icon size={20} style={{ color: s.color }} className="group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-black text-espresso uppercase tracking-tight">{s.title}</h4>
                      </div>
                      <p className="text-sm text-espresso/80 max-w-sm mx-auto md:mx-0 font-semibold leading-loose">
                        {s.desc}
                      </p>
                    </div>

                    <div className="relative z-10 order-1 md:order-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-espresso to-espresso/80 rounded-[1.5rem] flex items-center justify-center text-parchment-100 font-black text-xl shadow-2xl shadow-espresso/40 ring-[12px] ring-parchment-100 group-hover:rotate-12 transition-transform duration-500">
                        {s.step}
                      </div>
                    </div>

                    <div className="flex-1 hidden md:block order-3 md:order-1" />

                    <div className={`absolute -inset-x-20 -inset-y-16 bg-parchment-200/40 rounded-[4rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden lg:block`} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-parchment-100">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-12"
            >
              {[
                { label: "Active Pipelines", val: "14", color: "var(--emerald)" },
                { label: "Planning Speed", val: "12s", color: "var(--emerald)" },
                { label: "Spatial Accuracy", val: "99%", color: "var(--espresso)" },
                { label: "Cloud Uptime", val: "99.9", color: "var(--emerald)" }
              ].map((s, i) => (
                <motion.div
                  key={i}
                  variants={itemFadeUp}
                  className="text-center"
                >
                  <p className="text-5xl md:text-7xl font-black tracking-tighter mb-4" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[10px] font-black text-espresso/30 uppercase tracking-[0.4em] leading-none">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          className="py-24 bg-ochre-700 border-t border-ochre-600 relative overflow-hidden text-center px-6"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.03, 0.06, 0.03]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-emerald blur-[120px] pointer-events-none" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.06, 0.03]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-pacific_cyan blur-[120px] pointer-events-none" 
          />

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={itemFadeUp}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <span className="text-[10px] font-black text-espresso uppercase tracking-[0.5em] mb-6 md:mb-8 block">Ready to explore?</span>
            <h2 className="text-fluid-h2 font-black text-espresso uppercase tracking-tighter leading-[0.85] mb-10 md:mb-12">Build your trip in seconds.</h2>

            <div className="flex flex-col items-center gap-8">
              <motion.div {...buttonInteraction}>
                <Link
                  to={user ? "/dashboard" : "/auth"}
                  className="bg-espresso text-parchment-100 px-16 py-8 rounded-[3rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-espresso/90 transition-all shadow-card hover:shadow-hover flex items-center gap-5 group"
                >
                  Start Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
                <span className="text-[10px] font-black text-espresso/20 uppercase tracking-[0.4em]">12,402 Trips planned this cycle</span>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="bg-parchment-200 py-16 border-t border-parchment-300">
          <div className="max-w-7xl mx-auto px-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-12">
              <div className="flex flex-col items-center md:items-start gap-6">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-espresso rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles size={20} className="text-emerald" />
                  </div>
                  <span className="text-2xl font-black text-espresso tracking-tighter uppercase whitespace-nowrap">Wander<span className="text-emerald">AI</span></span>
                </Link>
                <p className="text-[10px] font-black text-espresso/30 uppercase tracking-[0.3em] max-w-[250px] text-center md:text-left leading-relaxed font-bold">The smart trip planning app for modern exploration.</p>
              </div>

              <div className="flex gap-20">
                <div className="space-y-6">
                  <p className="text-[11px] font-black text-espresso uppercase tracking-[0.4em]">Terminal</p>
                  <div className="flex flex-col gap-3">
                    <Link to={user ? "/dashboard" : "/auth"} className="text-xs font-black uppercase tracking-widest text-espresso/40 hover:text-emerald transition-colors italic">{user ? "Dashboard" : "Login"}</Link>
                    <Link to="/generate" className="text-xs font-black uppercase tracking-widest text-espresso/40 hover:text-emerald transition-colors italic">New Trip</Link>
                  </div>
                </div>
                <div className="space-y-6">
                  <p className="text-[11px] font-black text-espresso uppercase tracking-[0.4em]">Info</p>
                  <div className="flex flex-col gap-3">
                    <Link to="#" className="text-xs font-black uppercase tracking-widest text-espresso/40 hover:text-emerald transition-colors italic">Privacy</Link>
                    <Link to="#" className="text-xs font-black uppercase tracking-widest text-espresso/40 hover:text-emerald transition-colors italic">Terms</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-16 border-t border-parchment-300 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-espresso/20 uppercase tracking-[0.5em]">
              <p>© 2026 WANDERAI. ALL RIGHTS RESERVED.</p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
