import React, { useRef } from 'react';
import { Camera, MapPin, BookOpen, IndianRupee, Clock, Calendar, Phone, MessageSquare, Share2, CheckCircle2, User, GraduationCap, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion } from 'motion/react';
import { JobLead } from '../types';
import { cn, formatCurrency, formatPostedDate, getCityPhone, getCityTheme } from '../utils';

interface JobCardProps {
  job: JobLead;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = getCityTheme(job.City);
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
      {/* Card Header */}
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
        
        <div className="text-2xl sm:text-4xl font-[900] text-[#FFE66D] mb-1 drop-shadow-md">
          {genderEmoji} {job.Name || 'Elite Job'}
        </div>
        <div className="text-[10px] sm:text-[14px] font-black text-white/90 uppercase tracking-[0.2em]">
          🆔 Order ID: {job['Order ID']}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* 4-Icon Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">{genderEmoji}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</div>
            <div className="text-sm font-[900] text-primary">{job.Gender || 'Any'}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">📍</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</div>
            <div className="text-sm font-[900] text-primary truncate w-full px-2">{location}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">📖</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</div>
            <div className="text-sm font-[900] text-primary truncate w-full px-2">{classBoard}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">💰</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</div>
            <div className="text-sm font-[900] text-primary">₹{formatCurrency(job.Fee)}</div>
          </div>
        </div>

        {/* Subjects & Details */}
        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Subject Requirements</label>
            <div className="flex flex-wrap gap-2">
              {(job.subjects || 'General').split(/[,;]/).map((s, i) => (
                <span key={i} className="px-5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-100 dark:border-blue-800 shadow-sm">
                  📚 {s.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#FFE66D]/10 p-6 rounded-[28px] border-2 border-dashed border-[#F59E0B]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10"><MessageSquare size={40} /></div>
            <label className="text-[11px] font-black text-[#B45309] uppercase tracking-[0.2em] block mb-2">📝 Parent Note</label>
            <div className="text-[15px] font-bold text-slate-700 dark:text-slate-200 italic leading-relaxed">
              "{job.Notes || 'No specific requirements mentioned.'}"
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Schedule & Duration</label>
               <div className="text-[13px] font-[900] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                 <Clock size={14} className="text-primary" />
                 {job.duration || '1 Hr/Day'} | {job.time || 'Flexible'}
               </div>
            </div>
            <div className="text-right">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Live Since</label>
               <div className="text-[13px] font-[900] text-slate-700 dark:text-slate-300 flex items-center gap-2 justify-end">
                 <Calendar size={14} className="text-primary" />
                 {postedDate}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Dock - Flowing naturally at bottom of card */}
      <div className="card-actions grid grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <a 
          href={`tel:${phone}`}
          className="p-5 rounded-[20px] font-[900] text-xs uppercase tracking-widest text-center transition-all border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-95 flex items-center justify-center gap-2 shadow-sm"
        >
          <Phone size={16} /> Call Support
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-[20px] font-[900] text-xs uppercase tracking-widest text-center text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ background: theme.grad }}
        >
          <MessageSquare size={16} /> Apply on WA
        </a>
      </div>
    </div>
  );
};
