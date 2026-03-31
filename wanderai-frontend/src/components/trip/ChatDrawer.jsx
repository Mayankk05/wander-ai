import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { stream } from '../../lib/stream';

export default function ChatDrawer({ tripId, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  /**
   * Scroll to bottom on open and message changes
   */
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    const assistantMsg = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    await stream({
      url: `${import.meta.env.VITE_API_URL}/chat/${tripId}`,
      body: { 
        message: input, 
        history: messages.slice(-20).map(m => ({ role: m.role, text: m.content }))
      },
      onChunk: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };
          lastMsg.content = assistantContent;
          newMessages[newMessages.length - 1] = lastMsg;
          return newMessages;
        });
      },
      onComplete: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'assistant', content: `Connection Error: ${err}. Please try again.` }]);
      }
    });
  };

  return (
    <>
      {/* BACKDROP */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#131516]/40 backdrop-blur-md animate-in fade-in duration-300"
        />
      )}

      {/* DRAWER */}
      <div 
        className={`fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-[#1a1c1e] border-l border-white/5 z-[100] shadow-glass flex flex-col transition-transform duration-500 ease-out-expo ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* HEADER */}
        <div className="bg-[#1a1c1e] border-b border-white/5 px-8 py-6 flex flex-shrink-0 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[1.2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
              <Bot size={20} className="text-emerald" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-parchment-100 uppercase tracking-tighter leading-none">The Guide</span>
              <span className="text-[10px] font-bold text-parchment-100/40 uppercase tracking-[0.2em] mt-1.5">Assistant</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-parchment-100/20 hover:text-parchment-100 transition-all active:scale-95 shadow-glass flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col gap-6 bg-[#131516] selection:bg-emerald selection:text-white custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
               <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-parchment-100/10 shadow-inner">
                 <MessageCircle size={32} />
               </div>
               <h4 className="text-xs font-black text-parchment-100 uppercase tracking-widest leading-none">Hello Traveller</h4>
               <p className="text-[10px] font-bold text-parchment-100/40 mt-3 leading-loose uppercase tracking-widest max-w-[200px]">
                 Ask about hidden gems, route optimization, or coordinate adjustments.
               </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-slide-up`}
              >
                <div className={`px-5 py-4 text-xs font-bold leading-relaxed shadow-glass max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-emerald text-vintage_grape-500 rounded-[2rem] rounded-tr-sm' 
                    : 'bg-white/5 border border-white/10 text-parchment-100 rounded-[2rem] rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-2.5 animate-in fade-in">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                <Bot size={12} strokeWidth={2} className="text-emerald" />
              </div>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-glass">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald/40 animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald/40 animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald/40 animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="bg-[#1a1c1e] border-t border-white/5 px-6 py-6 flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-white/5 border border-white/10 rounded-[1.2rem] px-6 py-4 text-xs font-bold text-parchment-100 placeholder:text-parchment-100/20 focus:outline-none focus:border-emerald transition-all shadow-inner"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-4 bg-emerald text-vintage_grape-500 rounded-[1.2rem] shadow-glass shadow-emerald/5 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
