import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, MessageSquare, Bot, User, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { stream } from '../../lib/stream';

export default function TripChat({ tripId, destination }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMsg = { role: 'user', text: message };
    setHistory(prev => [...prev, userMsg]);
    const currentMsg = message;
    setMessage('');
    setIsTyping(true);

    let assistantText = "";
    // Add separate entry for assistant
    setHistory(prev => [...prev, { role: 'assistant', text: "" }]);

    await stream({
      url: `${import.meta.env.VITE_API_URL}/chat/${tripId}`,
      body: { 
        message: currentMsg, 
        history: history.slice(-10) 
      },
      onChunk: (chunk) => {
        assistantText += chunk;
        setHistory(prev => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1].text = assistantText;
          }
          return next;
        });
      },
      onComplete: () => {
        setIsTyping(false);
      },
      onError: (err) => {
        console.error("Chat Error:", err);
        setHistory(prev => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1].text = "I'm having trouble connecting to the concierge. Please try again.";
          }
          return next;
        });
        setIsTyping(false);
      }
    });
  };

  const clearChat = () => {
    if (window.confirm('Wipe chat history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[999] flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[min(682px,calc(100vh-140px))] bg-vintage_grape-300/95 backdrop-blur-xl border border-white/10 shadow-glass rounded-[2.5rem] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/5">
          
          <style dangerouslySetInnerHTML={{ __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
          `}} />

          {/* Header */}
          <div className="px-7 py-5 bg-vintage_grape-300 border-b border-white/5 flex items-center justify-between relative z-40">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald/10 rounded-2xl flex items-center justify-center text-emerald">
                <Bot size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-parchment-100 uppercase tracking-[0.2em]">The Concierge</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                  <span className="text-[8px] font-black text-emerald uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={clearChat}
                className="p-2 text-parchment-100/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                title="Clear Chat"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-parchment-100/40 hover:text-parchment-100 hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar z-10 bg-white/[0.02]"
          >
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                 <div className="w-20 h-20 bg-emerald/5 rounded-[2.5rem] flex items-center justify-center text-emerald/40 border border-emerald/10 shadow-inner">
                    <Sparkles size={32} />
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-xl font-black text-parchment-100 tracking-tighter uppercase">Your Concierge</h4>
                    <p className="text-[10px] font-bold text-parchment-100/40 uppercase tracking-widest leading-loose max-w-[200px]">Ask about packing, sights, or local secrets in {destination}.</p>
                 </div>
              </div>
            )}

            {history.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-400 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                  msg.role === 'user' ? 'bg-emerald text-vintage_grape-500 border border-emerald/20' : 'bg-white/5 border border-white/10 text-emerald'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`max-w-[80%] p-5 rounded-[1.8rem] text-[13px] leading-relaxed font-semibold shadow-glass border ${
                  msg.role === 'user' 
                    ? 'bg-emerald text-vintage_grape-500 border-emerald/10 rounded-tr-none' 
                    : msg.text.includes("trouble")
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      : 'bg-white/5 border-white/10 text-parchment-100 rounded-tl-none ring-1 ring-white/5'
                }`}>
                  {msg.text || (isTyping && i === history.length - 1 && (
                    <div className="flex gap-1.5 py-1">
                      <div className="w-1.5 h-1.5 bg-emerald/30 rounded-full animate-bounce [animation-duration:800ms]" />
                      <div className="w-1.5 h-1.5 bg-emerald/30 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:-0.2s]" />
                      <div className="w-1.5 h-1.5 bg-emerald/30 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:-0.4s]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Streamlined Input */}
          <div className="p-6 bg-vintage_grape-300 border-t border-white/5 relative z-40">
            <form onSubmit={handleSend} className="relative group/form">
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask your concierge..."
                className="w-full bg-white/5 border-2 border-transparent rounded-[2.2rem] pl-6 pr-14 py-5 text-[13px] font-black text-parchment-100 focus:bg-white/10 focus:border-emerald focus:ring-8 focus:ring-emerald/5 outline-none transition-all placeholder:text-parchment-100/20 shadow-inner"
              />
              <button 
                type="submit"
                disabled={!message.trim() || isTyping}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3.5 bg-emerald text-vintage_grape-500 rounded-[1.5rem] hover:bg-emerald/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald/10 disabled:opacity-20 flex items-center justify-center group"
              >
                <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOAT BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 relative group ${
          isOpen ? 'bg-vintage_grape-100 rotate-90 border border-white/10' : 'bg-emerald hover:bg-emerald/90 hover:shadow-emerald/20'
        }`}
      >
        {isOpen ? (
          <X size={24} className="text-parchment-100" />
        ) : (
          <div className="relative">
             <MessageSquare size={24} className="text-vintage_grape-500" />
             <div className="absolute -top-1 -right-1">
                <Sparkles size={12} className="text-vintage_grape-500 animate-pulse" />
             </div>
          </div>
        )}
      </button>
    </div>
  );
}
