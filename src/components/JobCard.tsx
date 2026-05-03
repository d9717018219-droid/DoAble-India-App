import React, { useRef } from 'react';
import { MapPin, BookOpen, Clock, Calendar, Phone, MessageSquare, Share2, CheckCircle2, Zap, Info, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import { JobLead } from '../types';
import { cn, formatCurrency, formatPostedDate, getCityPhone, getCityTheme } from '../utils';

interface JobCardProps {
  job: JobLead;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = getCityTheme(job.City);
  const gender = (job.Gender || 'Any').toLowerCase();
  const genderEmoji = gender.includes('male') && !gender.includes('female') ? "👨‍🏫" : (gender.includes('female') ? "👩‍🏫" : "👨‍🏫👩‍🏫");
  
  const classBoard = job['Class / Board'] || ((job.Class || '') + (job.Board ? ' (' + job.Board + ')' : '')) || 'General';
  const locationRaw = job.Locations || job.City || 'India';
  const location = locationRaw.toString().split(/[;,]/).map(l => l.trim().split('-')[0].trim()).join(', ');
  const resi = (job as any).residency || 'Student Home Address';
  const phone = getCityPhone(job.City);
  const postedDate = formatPostedDate(job['Updated Time'] || job['Record Added']);

  const formatJobName = (name: string) => {
    if (!name) return 'Elite Job';
    // Remove " Ji" suffix (case-insensitive)
    let cleaned = name.replace(/\s+[Jj][Ii]\s*$/, '').trim();
    // Convert to Title Case
    return cleaned.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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
        await navigator.share({ 
            files: [file], 
            title: `Tuition Job: ${job['Order ID']}`,
            text: `New job requirement from DoAble India. ID: ${job['Order ID']}`
        });
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

  const openMap = () => {
    const dest = encodeURIComponent(`${resi}, ${location}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  const generateWhatsAppLink = () => {
    const orderId = job['Order ID'] || 'N/A';
    const genderReq = (job.Gender || 'Any').toLowerCase();
    
    let tutorIntro = "I am a qualified tutor";
    if(genderReq.includes('male') && !genderReq.includes('female')) tutorIntro = "I am a professional Male Tutor";
    if(genderReq.includes('female')) tutorIntro = "I am a professional Female Tutor";

    const message = `Hello Sir/Ma'am,\n\nExtremely interested in applying for *Order ID: ${orderId}*.\n\n${tutorIntro} and I have carefully reviewed all the requirements. The preferred student time (${job.time || 'Flexible'}), duration (${(job as any).duration || '1 hr'}), and the schedule (${job.days || 'Regular'}) match my availability. \n\nI am also comfortable traveling to the residency area at *${resi}, ${location}*.\n\nKindly allow me a chance to provide a *Demo Class* to prove my teaching skills. Waiting for your positive response!\n\nThank you.`;
    
    return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div 
      ref={cardRef}
      className="job-card w-full h-auto bg-white dark:bg-slate-900 rounded-[20px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.06)] border-[1.5px] border-slate-200 dark:border-slate-800 flex flex-col relative animate-fade-down mb-6 transition-all duration-400"
    >
      {/* 1. Card Top - City Dynamic Theme */}
      <div 
        className="card-top p-[18px] text-center relative shrink-0 text-white"
        style={{ background: theme.grad }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); captureAndShare(); }}
          className="screenshot-btn absolute top-3 right-3 w-[35px] h-[35px] rounded-full bg-white/25 backdrop-blur-[5px] flex items-center justify-center text-white border-none cursor-pointer z-10 hover:bg-white/40 transition-colors"
        >
          <Share2 size={16} strokeWidth={3} />
        </button>
        
        <div className="hero-name text-[19px] font-[800] text-[#FFE66D] mb-[3px] drop-shadow-sm tracking-tight line-clamp-1 px-8">
          {genderEmoji} {formatJobName(job.Name)}
        </div>
        <div className="hero-id text-[11px] font-[600] opacity-95 uppercase tracking-widest">
          🆔 Order ID: {job['Order ID']}
        </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="quick-stats grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
        <div className="stat-item bg-white dark:bg-slate-800/50 p-[10px_8px] rounded-[14px] text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="stat-emoji text-[18px] block mb-0.5">{genderEmoji}</span>
          <span className="stat-value text-[12px] font-[700] block truncate text-[#2A7A3E]">{job.Gender || 'Any'}</span>
          <span className="stat-label text-[9px] text-slate-400 dark:text-slate-500 uppercase font-[800] mt-0.5">Gender</span>
        </div>
        <div className="stat-item bg-white dark:bg-slate-800/50 p-[10px_8px] rounded-[14px] text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="stat-emoji text-[18px] block mb-0.5">📍</span>
          <span className="stat-value text-[12px] font-[700] block truncate text-[#2A7A3E]">{location}</span>
          <span className="stat-label text-[9px] text-slate-400 dark:text-slate-500 uppercase font-[800] mt-0.5">Location</span>
        </div>
        <div className="stat-item bg-white dark:bg-slate-800/50 p-[10px_8px] rounded-[14px] text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="stat-emoji text-[18px] block mb-0.5">📖</span>
          <span className="stat-value text-[12px] font-[700] block truncate text-[#2A7A3E]">{classBoard}</span>
          <span className="stat-label text-[9px] text-slate-400 dark:text-slate-500 uppercase font-[800] mt-0.5">Class/Board</span>
        </div>
        <div className="stat-item bg-white dark:bg-slate-800/50 p-[10px_8px] rounded-[14px] text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="stat-emoji text-[18px] block mb-0.5">💰</span>
          <span className="stat-value text-[12px] font-[700] block truncate text-[#2A7A3E]">₹{formatCurrency(job.Fee || '0')}/Mo</span>
          <span className="stat-label text-[9px] text-slate-400 dark:text-slate-500 uppercase font-[800] mt-0.5">Fee</span>
        </div>
        
        <div className="stat-item col-span-2 bg-[#1B4B85]/5 dark:bg-sky-500/10 p-2 rounded-[14px] border border-[#1B4B85]/10 dark:border-sky-500/20 text-center">
            <span className="stat-value text-[11px] font-[700] text-[#1B4B85] dark:text-sky-400 flex items-center justify-center gap-1.5 uppercase">
                <Clock size={12} /> Posted On: {postedDate}
            </span>
        </div>
      </div>

      {/* 3. Parent Note Box */}
      <div className="notes-box bg-[#F59E0B]/10 dark:bg-amber-500/10 p-3 mx-3 mt-3 rounded-[12px] border border-dashed border-[#F59E0B] dark:border-amber-500/50">
          <span className="info-label text-[10px] text-[#B45309] dark:text-amber-400 font-[800] uppercase mb-1 block tracking-wider">📝 Parent Note</span>
          <div className="notes-text text-[11px] text-slate-700 dark:text-slate-200 font-[500] leading-relaxed line-clamp-3">
            {job.Notes || 'No specific requirements.'}
          </div>
      </div>

      {/* 4. Card Content */}
      <div className="card-content p-4 flex-1 space-y-4">
          <div className="space-y-2">
            <span className="info-label text-[10px] text-slate-400 dark:text-slate-500 font-[800] uppercase tracking-tight">Subjects we want you to teach</span>
            <div className="tags-container flex flex-wrap gap-1.5">
                {(job.subjects || 'General').split(/[;,]/).map((s, i) => (
                  <span key={i} className="tag bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-[10px] text-[11px] font-[600] border border-slate-200 dark:border-slate-700 whitespace-nowrap flex items-center gap-1">
                    📖 {s.trim()}
                  </span>
                ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="info-label text-[10px] text-slate-400 dark:text-slate-500 font-[800] uppercase tracking-tight">Where you have to take class</span>
            <div 
              className="residency-box bg-slate-50 dark:bg-slate-800/50 p-3 rounded-[12px] border-l-4 font-[500] text-[11px] text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm"
              style={{ borderLeftColor: theme.solid }}
              onClick={openMap}
            >
                📍 {resi}, {location}
                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-tighter">Tap to check distance & route on Google Maps</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="info-label text-[10px] text-slate-400 dark:text-slate-500 font-[800] uppercase tracking-tight">Schedule & Availability</span>
            <div className="tags-container flex flex-wrap gap-1.5">
                <span className="tag bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-[10px] text-[11px] font-[600] border border-slate-200 dark:border-slate-700">⏳ {(job as any).duration || '1 Hr/Day'}</span>
                <span className="tag bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-[10px] text-[11px] font-[600] border border-slate-200 dark:border-slate-700">📅 {job.days || 'Discuss'}</span>
                <span className="tag bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-[10px] text-[11px] font-[600] border border-slate-200 dark:border-slate-700">🕒 {job.time || 'Flexible'}</span>
            </div>
          </div>
      </div>

      {/* 5. Actions */}
      <div className="card-actions grid grid-cols-2 gap-2.5 p-4 border-t border-slate-100 dark:border-slate-800">
          <a 
            href={`tel:${phone}`} 
            className="btn bg-white dark:bg-slate-900 px-3 py-3 rounded-xl font-[800] text-[12px] text-center border-2 transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ color: theme.solid, borderColor: theme.solid }}
          >
            📞 Call Support
          </a>
          <a 
            href={generateWhatsAppLink()} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn text-white px-3 py-3 rounded-xl font-[800] text-[12px] text-center transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            style={{ background: theme.grad }}
          >
            💬 Apply Now
          </a>
      </div>
    </div>
  );
};
