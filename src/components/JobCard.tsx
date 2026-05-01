import React, { useRef } from 'react';
import { Camera, MapPin, BookOpen, IndianRupee, Clock, Calendar, Phone, MessageSquare, Share2 } from 'lucide-react';
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
  
  const classBoard = job['Class / Board'] || ((job.Class || '') + (job.Board ? ' (' + job.Board + ')' : '')) || 'General';
  const location = job.Locations || job.City || 'India';
  const phone = getCityPhone(job.City);

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
    const subj = job.subjects || 'General';
    const message = `Hello,\n\nI am interested in applying for *Order ID: ${orderId}*.\n\nI have reviewed the requirements for *${classBoard}* teaching *${subj}* at *${location}*.\n\nKindly let me know the process for a demo class. Thank you!`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <motion.div 
      ref={cardRef}
      id={`card-${job['Order ID']}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[20px] overflow-hidden shadow-md border border-slate-200 flex flex-col relative"
    >
      {/* Card Top / Header */}
      <div 
        className="p-[18px] text-center relative"
        style={{ background: theme.grad }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); captureAndShare(); }}
          className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 rounded-xl text-white transition-colors screenshot-btn active:scale-90"
          title="Share as Image"
        >
          <Share2 size={18} strokeWidth={3} />
        </button>
        <div className="text-[19px] font-[800] text-[#FFE66D] mb-[3px]">{genderEmoji} {job.Name || 'Student'}</div>
        <div className="text-[11px] font-[600] text-white opacity-95">🆔 Order ID: {job['Order ID']}</div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2 p-4 bg-[#F8F9FA] border-b-2 border-[#F0F0F0]">
        <div className="stat-item min-w-0">
          <div className="text-2xl mb-1">{genderEmoji}</div>
          <div className="text-[14px] font-bold text-primary truncate px-1">{job.Gender || 'Any'}</div>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Gender</div>
        </div>
        <div className="stat-item min-w-0">
          <div className="text-2xl mb-1">📍</div>
          <div className="text-[14px] font-bold text-primary truncate px-1" title={location}>{location}</div>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Location</div>
        </div>
        <div className="stat-item min-w-0">
          <div className="text-2xl mb-1">📖</div>
          <div className="text-[14px] font-bold text-primary truncate px-1" title={classBoard}>{classBoard}</div>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Class/Board</div>
        </div>
        <div className="stat-item min-w-0">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-[14px] font-bold text-primary truncate px-1">₹{formatCurrency(job.Fee)}/Mo</div>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Fee</div>
        </div>
        
        <div 
          className="col-span-2 p-2.5 rounded-xl text-center bg-white border border-[#E8E8E8]"
        >
          <span className="text-[11px] font-bold flex items-center justify-center gap-1 text-primary">
            🕒 Posted On: {formatPostedDate(job['Updated Time'])}
          </span>
        </div>
      </div>

      {/* Parent Note */}
      <div className="bg-[#FFE66D]/10 p-4 mx-4 my-4 rounded-xl border border-dashed border-[#F59E0B]">
        <span className="text-[10px] font-black uppercase text-[#B45309] block mb-1.5 tracking-widest">📝 Parent Note</span>
        <div className="text-[12px] font-bold text-slate-700 leading-relaxed italic">
          {job.Notes || 'No specific requirements.'}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1">
        <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-wider">Subjects we want you to teach</label>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(job.subjects || 'General').split(',').map((s, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-50 text-[11px] font-extrabold text-blue-600 border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition-colors">
              📖 {s.trim()}
            </span>
          ))}
        </div>

        <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-wider">Where you have to take class</label>
        <div 
          className="residency-box mb-4"
          style={{ borderLeftColor: theme.solid }}
          onClick={() => {
            const dest = encodeURIComponent(`${job.residency || 'Student Home'}, ${location}`);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
          }}
        >
          📍 {job.residency || 'Student Home Address'}, {location}
          <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold text-[8px]">Tap to check distance & route on Google Maps</div>
        </div>

        <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-wider">Schedule & Availability</label>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-3 py-2 rounded-xl bg-amber-50 text-[11px] font-extrabold text-amber-600 border border-amber-100 flex items-center gap-2 hover:bg-amber-100 transition-colors shadow-sm">
            ⏳ {job.duration || '1 Hr/Day'}
          </span>
          <span className="px-3 py-2 rounded-xl bg-rose-50 text-[11px] font-extrabold text-rose-600 border border-rose-100 flex items-center gap-2 hover:bg-rose-100 transition-colors shadow-sm">
            📅 {job.days || 'Discuss'}
          </span>
          <span className="px-3 py-2 rounded-xl bg-indigo-50 text-[11px] font-extrabold text-indigo-600 border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 transition-colors shadow-sm">
            🕒 {job.time || 'Flexible'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions grid grid-cols-2 gap-3 p-4 border-t border-slate-100">
        <a 
          href={`tel:${phone}`}
          className="p-3 rounded-xl font-extrabold text-[12px] text-center transition-colors border-2"
          style={{ color: theme.solid, borderColor: theme.solid }}
        >
          📞 Call Support
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl font-extrabold text-[12px] text-center transition-transform text-white shadow-lg active:scale-95"
          style={{ background: theme.grad, boxShadow: `0 10px 20px ${theme.solid}30` }}
        >
          💬 Apply Now
        </a>
      </div>
    </motion.div>
  );
};

const StatItem = ({ emoji, label, value }: { emoji: string, label: string, value: string }) => (
  <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm">
    <span className="text-[18px] block mb-0.5">{emoji}</span>
    <span className="text-[11px] font-[800] block text-slate-800 truncate">{value}</span>
    <span className="text-[9px] font-[900] text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);
