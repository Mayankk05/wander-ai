import { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, Globe, Settings2, X, UserPlus, Shield, ShieldCheck, Mail } from 'lucide-react';
import { collabAPI } from '../../api';
import toast from 'react-hot-toast';

const DEFAULT_COLLABS = [];
const DEFAULT_PRESENCE = [];

export default function CollaboratorBar({ 
  collaborators = DEFAULT_COLLABS, 
  presence = DEFAULT_PRESENCE, 
  socketConnected, 
  tripId,
  isOwner = false
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [collabList, setCollabList] = useState(collaborators);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    // Only update if the reference changed and isn't just an initialization pulse
    if (collaborators !== collabList) {
      setCollabList(collaborators);
    }
  }, [collaborators]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsInviting(true);
    try {
      await collabAPI.invite(tripId, { email, role });
      toast.success('Invitation sent successfully.', {
        icon: '🛰️',
        style: { background: 'var(--vintage_grape-300)', color: 'var(--parchment-100)', border: '1px solid rgba(255,255,255,0.1)' }
      });
      setEmail('');
      // Refresh list
      const res = await collabAPI.getAll(tripId);
      setCollabList(res.data.collaborators);
    } catch {
      toast.error('Failed to send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (targetEmail) => {
    try {
      await collabAPI.remove(tripId, targetEmail);
      setCollabList(prev => prev.filter(c => c.email !== targetEmail));
      toast.success('Access removed.');
    } catch {
      toast.error('Failed to remove collaborator.');
    }
  };

  return (
    <div className="space-y-3 mb-6 animate-in fade-in duration-500">
      {isOwner && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-parchment-100 hover:border-emerald transition-all active:scale-95 shadow-glass"
          >
            <UserPlus size={14} /> Manage Access
          </button>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 shadow-glass flex items-center justify-between group">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald animate-pulse' : 'bg-white/10'}`} />
            <span className="text-[10px] font-black text-parchment-100/30 uppercase tracking-[0.3em]">
              {socketConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
 
          <div className="h-4 w-px bg-white/5" />

          <div className="flex items-center gap-2">
            <Users size={14} className="text-emerald" />
            <span className="text-[10px] font-black text-parchment-100 uppercase tracking-tighter">
              {presence.length} {presence.length === 1 ? 'Traveler' : 'Travelers'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2.5">
            {presence.slice(0, 5).map((u, idx) => (
              <div 
                key={u.userId || idx}
                className="w-10 h-10 rounded-full border-2 border-vintage_grape-300 bg-emerald text-vintage_grape-500 flex items-center justify-center text-[10px] font-black shadow-lg relative transition-all hover:scale-110 cursor-pointer overflow-hidden group"
                title={u.userName || u.email}
              >
                {u.userName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                {u.isVerified && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full border border-vintage_grape-300 flex items-center justify-center -translate-y-[1px] translate-x-[1px]">
                    <ShieldCheck size={8} className="text-emerald" />
                  </div>
                )}
                <div className="absolute inset-0 ring-1 ring-emerald ring-offset-1 ring-offset-vintage_grape-300 rounded-full animate-pulse opacity-20" />
              </div>
            ))}
            {presence.length > 5 && (
              <div className="w-10 h-10 rounded-full border-2 border-vintage_grape-300 bg-white/5 text-parchment-100/40 flex items-center justify-center text-[9px] font-black shadow-sm">
                +{presence.length - 5}
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-parchment-100/30 hover:text-parchment-100"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-500 shadow-glass">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[10px] font-black text-parchment-100/60 uppercase tracking-[0.4em]">Invite Friends</h4>
            <button onClick={() => setIsExpanded(false)} className="p-1.5 hover:bg-white/10 rounded-xl text-parchment-100/20 hover:text-parchment-100 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* COLLABORATORS LIST */}
          <div className="space-y-2 mb-8">
            {collabList.length === 0 ? (
              <div className="flex items-center gap-3 py-4 px-5 border border-white/5 rounded-xl bg-white/[0.02] group/empty">
                <UserPlus size={14} className="text-parchment-100/20" />
                <span className="text-[10px] font-black text-parchment-100/20 uppercase tracking-[0.3em]">No collaborators yet</span>
              </div>
            ) : (
              collabList.map((collab, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group/item hover:border-emerald/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black text-parchment-100/40 uppercase">
                      {collab.email[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-parchment-100 truncate max-w-[140px] sm:max-w-none tracking-tight">{collab.email}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         {collab.role === 'editor' ? <ShieldCheck size={10} className="text-emerald" /> : <Shield size={10} className="text-azure" />}
                         <span className={`text-[8px] font-black uppercase tracking-widest ${collab.role === 'editor' ? 'text-emerald' : 'text-azure'}`}>{collab.role}</span>
                      </div>
                    </div>
                  </div>
                   {isOwner && (
                    <button 
                      onClick={() => handleRemove(collab.email)}
                      className="p-2 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-rose-500/10 text-rose-500 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* INVITE FORM */}
           {isOwner && (
            <form onSubmit={handleInvite} className="flex flex-wrap items-center gap-2">
              <div className="relative flex-[2] min-w-[200px]">
                <Mail size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                <input 
                  type="email" 
                  placeholder="Email address..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[11px] font-bold text-parchment-100 placeholder:text-parchment-100/10 focus:border-emerald hover:border-white/20 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative flex-1 min-w-[140px]">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-parchment-100/60 focus:border-emerald hover:border-white/20 outline-none cursor-pointer appearance-none pr-8"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="editor" className="bg-vintage_grape-300">Editor</option>
                  <option value="viewer" className="bg-vintage_grape-300">Viewer</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-100/20 pointer-events-none" />
              </div>
              <button 
                type="submit"
                disabled={isInviting}
                className="bg-white text-vintage_grape-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald transition-all active:scale-95 disabled:opacity-50 shadow-glass grow sm:grow-0"
              >
                {isInviting ? 'Inviting...' : 'Invite'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
