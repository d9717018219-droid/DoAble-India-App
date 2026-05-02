import React, { useRef, useState } from 'react';
import { Camera, MapPin, BookOpen, IndianRupee, Clock, Calendar, Phone, MessageSquare, Share2, CheckCircle2, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { JobLead } from '../types';
import { cn, formatCurrency, formatPostedDate, getCityPhone, getCityTheme } from '../utils';

interface JobCardProps {
  job: JobLead;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSwipe }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = getCityTheme(job.City);
  const gender = (job.Gender || 'Any').toLowerCase();
  const genderEmoji = gender.includes('male') && !gender.includes('female') ? "👨‍🏫" : (gender.includes('female') ? "👩‍🏫" : "👥");
  
  const classBoard = job['Class / Board'] || ((job.Class || '') + (job.Board ? ' (' + job.Board + ')' : '')) || 'Any Class';
  const location = job.Locations || job.City || 'Not Provided';
  const phone = getCityPhone(job.City);
  const postedDate = formatPostedDate(job['Record Added'] || job['Updated Time']);

  // Motion Values for Swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

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

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      setSwipeDir('right');
      setTimeout(() => onSwipe?.('right'), 200);
    } else if (info.offset.x < -100) {
      setSwipeDir('left');
      setTimeout(() => onSwipe?.('left'), 200);
    }
  };

  return (
    <motion.div 
      ref={cardRef}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ 
        x: swipeDir === 'right' ? 1000 : (swipeDir === 'left' ? -1000 : 0), 
        opacity: 0, 
        rotate: swipeDir === 'right' ? 60 : (swipeDir === 'left' ? -60 : 0),
        transition: { duration: 0.4, ease: "easeInOut" }
      }}
      className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative w-full h-[95%] absolute"
    >
      {/* Visual Swipe Feedback */}
      <AnimatePresence>
        {swipeDir === 'right' && (
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1.5 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-emerald-500/20 backdrop-blur-[2px]">
            <Heart size={100} className="text-emerald-500 fill-emerald-500" />
          </motion.div>
        )}
        {swipeDir === 'left' && (
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1.5 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-rose-500/20 backdrop-blur-[2px]">
            <Share2 size={100} className="text-rose-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Top / Header */}
      <div 
        className="p-6 sm:p-8 text-center relative"
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
        
        <div className="text-2xl sm:text-3xl font-[900] text-[#FFE66D] mb-1 drop-shadow-md">
          {genderEmoji} {job.Name || 'Elite Job'}
        </div>
        <div className="text-[10px] sm:text-[12px] font-black text-white/90 uppercase tracking-[0.2em]">
          🆔 Order ID: {job['Order ID']}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-28">
        {/* 4-Icon Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">{genderEmoji}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</div>
            <div className="text-sm font-extrabold text-primary">{job.Gender || 'Any'}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">📍</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</div>
            <div className="text-sm font-extrabold text-primary truncate">{location}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</div>
            <div className="text-sm font-extrabold text-primary truncate">{classBoard}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee</div>
            <div className="text-sm font-extrabold text-primary">₹{formatCurrency(job.Fee)}</div>
          </div>
        </div>

        {/* Subjects & Details */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject Requirements</label>
            <div className="flex flex-wrap gap-2">
              {(job.subjects || 'General').split(/[,;]/).map((s, i) => (
                <span key={i} className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-100 dark:border-blue-800">
                  📚 {s.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#FFE66D]/10 p-4 rounded-2xl border border-dashed border-[#F59E0B]">
            <label className="text-[10px] font-black text-[#B45309] uppercase tracking-widest block mb-1">📝 Parent Note</label>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">
              {job.Notes || 'No specific requirements mentioned.'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Schedule</label>
               <div className="text-[12px] font-bold text-slate-600 dark:text-slate-400">{job.duration || '1 Hr/Day'} | {job.time || 'Flexible'}</div>
            </div>
            <div className="text-right">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Posted On</label>
               <div className="text-[12px] font-bold text-slate-600 dark:text-slate-400">{postedDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Dock - Pinned to Bottom */}
      <div className="card-actions grid grid-cols-2 gap-4 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 absolute bottom-0 left-0 right-0 z-10">
        <a 
          href={`tel:${phone}`}
          className="p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center transition-all border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-95"
        >
          📞 Call Support
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center text-white shadow-xl active:scale-95 transition-all"
          style={{ background: theme.grad }}
        >
          💬 Apply on WA
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
