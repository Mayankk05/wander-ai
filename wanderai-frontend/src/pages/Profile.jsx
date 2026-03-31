import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Calendar, MapPin, 
  LogOut, Check, ArrowLeft, Loader2, Camera, AlertCircle
} from 'lucide-react';
import { authAPI, tripsAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import toast from 'react-hot-toast';
import VerifyBanner from '../components/shared/VerifyBanner';
import PageTransition from '../components/shared/PageTransition';

export default function Profile() {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const clearUser = useAuthStore(state => state.clearUser);
  const { trips } = useTripStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    newPassword: '',
    bio: user?.bio || '',
    location: user?.location || '',
    image: user?.image || '',
  });
  
  const stats = {
    totalTrips: trips.length,
    sharedTrips: trips.filter(t => t.isPublic).length
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearUser();
      navigate('/auth');
      toast.success('Logged out');
    } catch (err) {
      clearUser();
      navigate('/auth');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (formData.email !== user?.email && user?.emailVerified) {
      const proceed = window.confirm("Changing your email will reset your verified status. You'll need to confirm your new email. Continue?");
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.newPassword || undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        image: formData.image || undefined
      });
      updateUser(res.data.user);
      setFormData(prev => ({ 
        ...prev, 
        newPassword: '',
        email: res.data.user.email,
        name: res.data.user.name 
      }));
      toast.success('Profile updated');
    } catch (err) {
       toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-dashboard-canvas pb-32 pt-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          
          {!user?.emailVerified && <VerifyBanner />}

          <div className="flex items-center gap-6 mb-12 animate-fade-slide-up">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-parchment-100 hover:border-emerald transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-4xl font-black text-parchment-100 tracking-tighter uppercase leading-none">My Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 space-y-8 animate-fade-slide-up delay-100">
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center shadow-glass relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald opacity-20" />
                  <div className="w-24 h-24 bg-vintage_grape-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-white/5 group-hover:scale-110 transition-transform duration-500 overflow-hidden border-4 border-white/10">
                    {user?.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-emerald">{user?.name?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-parchment-100 uppercase tracking-tight mb-2 truncate leading-none">{user?.name}</h2>
                  <div className="flex items-center justify-center gap-2 mb-8">
                     <div className={`w-2 h-2 rounded-full ${user?.emailVerified ? 'bg-emerald' : 'bg-rose-500'}`} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-parchment-100/40">
                       {user?.emailVerified ? 'Verified' : 'Not Verified'}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                       <span className="text-[20px] font-black text-parchment-100 leading-none mb-1 block">{stats.totalTrips}</span>
                       <span className="text-[8px] font-black text-parchment-100/40 uppercase tracking-widest">Trips</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                       <span className="text-[20px] font-black text-emerald leading-none mb-1 block">{stats.sharedTrips}</span>
                       <span className="text-[8px] font-black text-parchment-100/40 uppercase tracking-widest">Shared</span>
                    </div>
                  </div>
               </div>

               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-4 bg-white text-vintage_grape-500 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-glass"
               >
                 <LogOut size={16} /> Logout
               </button>
            </div>

            <div className="lg:col-span-2 space-y-8 animate-fade-slide-up delay-200">
               <form onSubmit={handleUpdate} className="bg-white/5 border border-white/10 rounded-[3rem] p-12 shadow-glass space-y-8 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                       <Shield size={18} className="text-emerald" />
                    </div>
                    <h3 className="text-sm font-black text-parchment-100 uppercase tracking-widest leading-none">Account Info</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-parchment-100/40 uppercase tracking-[0.4em] ml-2">Full Name</label>
                       <div className="relative">
                          <User size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                          <input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-parchment-100 focus:border-emerald outline-none transition-all"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-parchment-100/40 uppercase tracking-[0.4em] ml-2">Email Address</label>
                       <div className="relative">
                          <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                          <input 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-parchment-100 focus:border-emerald outline-none transition-all"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-parchment-100/40 uppercase tracking-[0.4em] ml-2">Location</label>
                       <div className="relative">
                          <MapPin size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                          <input 
                            value={formData.location}
                            placeholder="e.g. Kyoto, Japan"
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-parchment-100 focus:border-emerald outline-none transition-all placeholder:text-parchment-100/10"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-parchment-100/40 uppercase tracking-[0.4em] ml-2">Photo URL</label>
                       <div className="relative">
                          <Camera size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-parchment-100/20" />
                          <input 
                            value={formData.image}
                            placeholder="Link to image..."
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-parchment-100 focus:border-emerald outline-none transition-all placeholder:text-parchment-100/10"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-parchment-100/40 uppercase tracking-[0.4em] ml-2">About You</label>
                     <textarea 
                       value={formData.bio}
                       placeholder="Tell us about your travel style..."
                       onChange={(e) => setFormData({...formData, bio: e.target.value})}
                       rows={3}
                       className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-xs font-bold text-parchment-100 focus:border-emerald outline-none transition-all resize-none placeholder:text-parchment-100/10"
                     />
                  </div>

                  <div className="h-px w-full bg-white/5" />
 
                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                           <Shield size={18} className="text-emerald" />
                        </div>
                        <h3 className="text-sm font-black text-parchment-100 uppercase tracking-widest leading-none">Security</h3>
                     </div>
                     <div className="space-y-2 max-w-sm">
                        <label className="text-[9px] font-black text-parchment-100/40 uppercase tracking-[0.4em] ml-2">Update Password</label>
                        <input 
                          type="password"
                          value={formData.newPassword}
                          placeholder="New password (leave blank to keep current)"
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-parchment-100 focus:border-emerald outline-none transition-all placeholder:text-[10px] placeholder:font-medium"
                        />
                     </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-emerald text-vintage_grape-500 px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald/90 active:scale-95 transition-all shadow-xl shadow-emerald/20 disabled:opacity-50 flex items-center gap-3"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin text-vintage_grape-500" /> : <Check size={16} />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
