import React, { useRef } from 'react';
import { MapPin, BookOpen, Clock, Calendar, Phone, MessageSquare, Share2, CheckCircle2, Zap, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { JobLead } from '../types';
import { cn, formatCurrency, formatPostedDate, getCityPhone, getJobTheme } from '../utils';

interface JobCardProps {
  job: JobLead;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = getJobTheme();
  const gender = (job.Gender || 'Any').toLowerCase();
  const genderEmoji = gender.includes('male') && !gender.includes('female') ? "👨‍🏫" : (gender.includes('female') ? "👩‍🏫" : "👥");
  
  const classBoard = job['Class / Board'] || ((job.Class || '') + (job.Board ? ' (' + job.Board + ')' : '')) || 'Any Class';
  const location = job.Locations || job.City || 'Not Provided';
  const phone = getCityPhone(job.City);
  const postedDate = formatPostedDate(job['Record Added'] || job['Updated Time']);

  const captureAndShare = async () => {
    if (!cardRef.current) return;
    const actions = cardRef.current.querySelector('.card-actions');
    const screenshotBtn = cardRef.current.querySelector('.screenshot-btn');
    if (actions) (actions as HTMLElement).style.opacity = '0';
    if (screenshotBtn) (screenshotBtn as HTMLElement).style.opacity = '0';

    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: document.body.classList.contains('dark') ? '#0f172a' : '#ffffff'
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) return;
      const file = new File([blob], `Job_${job['Order ID']}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Tuition Job: ${job['Order ID']}` });
      } else {
        const link = document.createElement('a');
        link.download = `Job_${job['Order ID']}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (err) { console.error("Share failed", err); }
    finally {
      if (actions) (actions as HTMLElement).style.opacity = '1';
      if (screenshotBtn) (screenshotBtn as HTMLElement).style.opacity = '1';
    }
  };

  const generateWhatsAppLink = () => {
    const orderId = job['Order ID'] || 'N/A';
    return `https://wa.me/91${phone}?text=${encodeURIComponent(orderId)}`;
  };

  return (
    <div 
      ref={cardRef}
      className="w-full bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative animate-fade-down mb-6"
    >
      {/* 1. Card Header - Sky Blue Theme */}
      <div 
        className="p-8 sm:p-10 text-center relative shrink-0"
        style={{ background: theme.grad }}
      >
        <div className="absolute top-4 right-4 flex gap-2">
           <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-1">
              <CheckCircle2 size={10} /> Verified
           </span>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); captureAndShare(); }}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/40 rounded-xl text-white transition-colors screenshot-btn"
        >
          <Share2 size={16} strokeWidth={3} />
        </button>
        
        <div className="text-xl sm:text-2xl font-[900] text-white mb-1 drop-shadow-md uppercase tracking-tight line-clamp-2 px-4">
          💼 {job.subjects || 'Premium Job'}
        </div>
        <div className="text-[10px] sm:text-[12px] font-black text-white/90 uppercase tracking-[0.2em]">
          🆔 Order ID: {job['Order ID']}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8 flex-1">
        {/* 2. Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">{genderEmoji}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</div>
            <div className="text-[11px] sm:text-xs font-[900]" style={{ color: theme.solid }}>{job.Gender || 'Any'}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">📍</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</div>
            <div className="text-[11px] sm:text-xs font-[900]" style={{ color: theme.solid }}>{job.City}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">🏫</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class / Board</div>
            <div className="text-[11px] sm:text-xs font-[900] truncate w-full px-2" style={{ color: theme.solid }}>{classBoard}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">💰</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budgeted Fee</div>
            <div className="text-[11px] sm:text-xs font-[900]" style={{ color: theme.solid }}>{formatCurrency(job.Fee)} / Mo</div>
          </div>
        </div>

        {/* 3. Detailed Information Blocks */}
        <div className="space-y-8">
           <DetailSection icon={<MapPin size={16} className="text-primary" />} label="Target Territories">
              <div className="flex flex-wrap gap-2">
                {location.split(/[;,]/).map((l, i) => (
                  <span key={i} className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-slate-100 dark:border-slate-700 shadow-sm">
                    {l.trim()}
                  </span>
                ))}
              </div>
           </DetailSection>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <DetailSection icon={<Clock size={16} className="text-primary" />} label="Time Preference">
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-black text-slate-700 dark:text-white uppercase">{job.time || 'Flexible'}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Teaching Hours</div>
                 </div>
              </DetailSection>

              <DetailSection icon={<Calendar size={16} className="text-primary" />} label="Schedule">
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-black text-slate-700 dark:text-white uppercase">{job.days || 'Regular'}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly Mode</div>
                 </div>
              </DetailSection>
           </div>

           {job.Notes && (
             <DetailSection icon={<Info size={16} className="text-primary" />} label="Specific Requirements">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10" />
                   <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium relative z-10">{job.Notes}</p>
                </div>
             </DetailSection>
           )}

           <div className="flex justify-between items-center text-slate-400 pt-2 px-2">
              <div className="flex items-center gap-1.5">
                 <Calendar size={10} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Posted: <span className="text-slate-600 dark:text-slate-300">{postedDate}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                 <Zap size={10} className="text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-primary">Priority Lead</span>
              </div>
           </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row gap-4 card-actions">
          <a 
            href={`tel:91${phone}`}
            className="flex-1 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <Phone size={18} /> Call Hub
          </a>
          <a 
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[1.5] h-16 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            style={{ background: theme.grad }}
          >
            <MessageSquare size={18} /> Apply on WA
          </a>
        </div>
      </div>
    </div>
  );
};

const DetailSection = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
  <div className="space-y-4">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5 ml-1">
        {icon} {label}
     </label>
     {children}
  </div>
);
