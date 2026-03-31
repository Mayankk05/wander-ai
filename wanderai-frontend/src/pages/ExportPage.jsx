import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI, shareAPI, exportAPI } from '../api';
import { 
  ArrowLeft, FileDown, Download, CheckCircle2, Link as LinkIcon, 
  Globe, Copy, ExternalLink, FileText, Plane, Wallet, Calendar, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PageTransition from '../components/shared/PageTransition';

export default function ExportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const response = await tripsAPI.getOne(id);
        setTrip(response.data.trip);
      } catch (err) {
        toast.error('Failed to load trip data.');
        navigate(`/trip/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id, navigate]);

  const handleDownload = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const response = await exportAPI.pdf(id);
      
      // Ensure we have data
      if (!response || !response.data) {
        throw new Error('No itinerary data received.');
      }

      // Convert response data to a clean Blob
      const file = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(file);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `WanderAI-${trip?.destination || 'Trip'}-Itinerary.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setDownloadSuccess(true);
      toast.success('Itinerary prepared.', {
        icon: '📄'
      });
      
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF ERROR:', err);
      toast.error(err.response?.data?.error || 'Export failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${trip.shareLink}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnableLink = async () => {
    try {
      await shareAPI.enable(id);
      const response = await tripsAPI.getOne(id);
      setTrip(response.data.trip);
      toast.success('Public link active.');
    } catch (err) {
      toast.error('Sharing activation failed.');
    }
  };

  const handleDisableLink = async () => {
    try {
      await shareAPI.disable(id);
      const response = await tripsAPI.getOne(id);
      setTrip(response.data.trip);
      toast.success('Public link disabled.');
    } catch (err) {
      toast.error('Deactivation failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131516] flex flex-col items-center justify-center p-6 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-parchment-100/40 animate-pulse">Preparing Document</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/share/${trip.shareLink}`;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#131516] pb-20 selection:bg-emerald selection:text-white relative overflow-hidden">
        {/* Subtle mesh background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40 pointer-events-none" />
        <main className="max-w-5xl mx-auto px-6 py-12 animate-fade-slide-up relative z-10">
          
          {/* HEADER */}
          <div className="flex items-center gap-6 mb-12">
            <button 
              onClick={() => navigate(`/trip/${id}`)}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95 shadow-glass group"
            >
              <ArrowLeft size={20} className="text-parchment-100 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-parchment-100 uppercase tracking-tighter leading-none mb-2">Export Trip</h1>
              <p className="text-sm font-bold text-parchment-100/40 uppercase tracking-widest leading-none">Download trip or manage sharing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* LEFT COLUMN - OPTIONS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* DOWNLOAD CARD */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-glass backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-2xl bg-emerald flex items-center justify-center shadow-glass">
                     <FileDown size={20} className="text-vintage_grape-500" />
                   </div>
                   <h2 className="text-base font-black text-parchment-100 uppercase tracking-tight leading-none">Generate PDF</h2>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5 shadow-inner">
                  <h3 className="text-sm font-black text-parchment-100 uppercase tracking-tight truncate mb-1">{trip.destination}</h3>
                  <div className="flex gap-4">
                    <span className="text-[10px] font-bold text-parchment-100/40 uppercase tracking-widest">{trip.days} Days Itinerary</span>
                    <span className="text-[10px] font-bold text-parchment-100 uppercase tracking-widest">{trip.itinerary?.currency} {trip.budget} Budget</span>
                  </div>
                </div>

                {downloadSuccess ? (
                  <div className="w-full bg-emerald text-vintage_grape-500 py-5 rounded-2xl flex items-center justify-center gap-3 animate-fade-in shadow-glass">
                    <CheckCircle2 size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Download Started</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full bg-white text-vintage_grape-500 py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald transition-all active:scale-95 disabled:opacity-50 shadow-glass"
                  >
                    {isDownloading ? (
                      <>
                        <LoadingSpinner size="sm" />
                         <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>Download Itinerary</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* SHARE LINK CARD */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-glass backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                     <LinkIcon size={20} className="text-emerald" />
                   </div>
                   <h2 className="text-base font-black text-parchment-100 uppercase tracking-tight leading-none">Public Sharing</h2>
                </div>

                {trip.isPublic && trip.shareLink ? (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 flex items-center gap-3 overflow-hidden shadow-inner">
                      <Globe size={14} className="text-emerald flex-shrink-0" />
                      <span className="text-xs font-medium text-parchment-100 truncate flex-1 opacity-60 italic">{shareUrl}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleCopyLink}
                        className="bg-white/5 border border-white/5 text-parchment-100 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-glass"
                      >
                        {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button 
                        onClick={() => window.open(shareUrl, '_blank')}
                        className="bg-white/5 border border-white/5 text-parchment-100 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-glass"
                      >
                        <ExternalLink size={14} />
                        Open
                      </button>
                    </div>

                    <button 
                      onClick={handleDisableLink}
                      className="w-full text-center text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors mt-2"
                    >
                      Disable Link
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 px-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
                      <LinkIcon size={24} className="text-parchment-100/10" />
                    </div>
                    <p className="text-xs font-bold text-parchment-100/40 uppercase tracking-widest mb-6 leading-relaxed">Sharing disabled.</p>
                    <button 
                      onClick={handleEnableLink}
                      className="bg-emerald text-vintage_grape-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald/90 transition-all active:scale-95 shadow-glass"
                    >
                      Enable Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - PREVIEW */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-glass backdrop-blur-xl h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                       <FileText size={20} className="text-emerald" />
                     </div>
                     <h2 className="text-base font-black text-parchment-100 uppercase tracking-tight leading-none">Preview</h2>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 min-h-[600px] flex justify-center">
                   <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-glass border border-white/10 p-10 flex flex-col items-center">
                      <Plane size={32} className="text-emerald mb-12" />
                      <h4 className="text-xl font-black text-black text-center leading-tight mb-4 uppercase tracking-tighter">{trip.title}</h4>
                      <p className="text-[10px] font-black text-emerald uppercase tracking-[0.3em] mb-10">{trip.destination}</p>
                      
                      <div className="w-16 h-1 bg-black/5 rounded-full mb-10" />

                      <div className="flex gap-4 mb-20">
                         <div className="flex items-center gap-2 text-[10px] font-black text-black">
                           <Calendar size={12} className="text-black/20" />
                           <span>{trip.days} DAYS</span>
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-black">
                           <Wallet size={12} className="text-black/20" />
                           <span className="uppercase">{trip.itinerary?.currency} {trip.budget}</span>
                         </div>
                      </div>

                      <div className="w-full space-y-6 px-4 opacity-40">
                         <div className="w-full h-10 bg-black/5 rounded-xl" />
                         <div className="w-full h-10 bg-black/5 rounded-xl" />
                         <div className="w-full h-10 bg-black/5 rounded-xl" />
                      </div>


                      <div className="mt-auto pt-20">
                        <p className="text-[8px] font-black text-black/20 uppercase tracking-[0.4em]">WanderAI Trip Export</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
