import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Share2, Phone, MessageSquare, Heart, CheckCircle2, MapPin, BookOpen, Clock, User, GraduationCap, Zap } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn, getCityTheme } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor, onSwipe }) => {
  const gender = (tutor['Gender'] || '').trim();
  const displayGender = gender && gender !== 'null' ? gender : '–';
  const verified = (tutor['Verified'] || '').toString().toLowerCase().trim() === 'yes';
  const tutorTheme = getCityTheme(tutor['Preferred City'] || 'India');

  // Motion Values for Swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  const toProperCase = (text: string) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  };

  const generateWhatsAppLink = () => {
    const name = toProperCase(tutor['Name']) || 'Tutor';
    const id = tutor['Tutor ID'] || 'N/A';
    const subj = tutor['Preferred Subject(s)'] ? tutor['Preferred Subject(s)'].split(';')[0].trim() : 'Tutoring';
    const city = tutor['Preferred City'] || '';
    const fee = (tutor['Fee/Month'] || '').split('(')[0].trim();
    
    let message = `Hi ${name}!%0A%0AI'm interested in your tutoring services. Tutor ID: ${id}%0A%0A`;
    if (subj) message += `Subject: ${subj}%0A`;
    if (city) message += `Location: ${city}%0A`;
    if (fee) message += `Rate: ${fee}%0A`;
    message += `%0APlease share your availability. Thanks!`;
    
    return `https://wa.me/919971969197?text=${message}`;
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

  const statusInfo = tutor['Status'] === 'Active' 
    ? { label: '✅ Active', color: '#10B981' } 
    : { label: tutor['Status'] === 'Not Available' ? '⏸️ Busy' : '🚫 Suspended', color: tutor['Status'] === 'Not Available' ? '#FBBF24' : '#EF5350' };

  return (
    <motion.div 
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
        transition: { duration: 0.5 }
      }}
      className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative w-full h-full max-h-[75vh] sm:max-h-[80vh] absolute"
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

      {/* Header */}
      <div 
        className="p-8 text-center text-white relative flex flex-col justify-center items-center overflow-hidden"
        style={{ background: tutorTheme.grad }}
      >
        <div className="absolute top-4 right-4 flex gap-2">
           {verified && (
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-1">
                <CheckCircle2 size={10} /> Verified
             </span>
           )}
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <h2 className="text-2xl sm:text-3xl font-[900] text-[#FFD700] mb-1 drop-shadow-md truncate w-full px-4">
          ✨ {toProperCase(tutor['Name']) || 'Premium Tutor'}
        </h2>
        <div className="text-[10px] sm:text-[12px] font-black opacity-90 tracking-[0.2em] uppercase">
          🆔 Tutor ID: {tutor['Tutor ID'] || 'N/A'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">🎂</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</div>
            <div className="text-sm font-extrabold text-primary">{tutor['Age'] || '–'}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</div>
            <div className="text-sm font-extrabold text-primary">{displayGender}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">📍</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</div>
            <div className="text-sm font-extrabold text-primary truncate">{(tutor['Preferred City'] || 'India')}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee</div>
            <div className="text-sm font-extrabold text-primary truncate">{(tutor['Fee/Month'] || '₹200').split('(')[0].trim()}</div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {tutor['About'] && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border-l-4 border-emerald-400 italic text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              "{tutor['About'].substring(0, 200)}..."
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert Subjects</label>
              <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Subject(s)'] || '').split(/[,;]/).map((s, i) => s.trim() && (
                  <span key={i} className="px-4 py-2 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-xs font-black border border-pink-100 dark:border-pink-800">
                    📖 {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</label>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">
                 🎓 {tutor['Qualification(s)']} | 📚 {tutor['Experience']}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Time</label>
              <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Time'] || '').split(/[,;]/).map((time, i) => time.trim() && (
                  <span key={i} className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-black border border-purple-100 dark:border-purple-800">
                    ⏰ {time.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Dock */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sticky bottom-0">
        <a 
          href="tel:+919971969197"
          className="p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center transition-all bg-gradient-to-r from-primary to-[#FF7675] text-white shadow-lg active:scale-95"
        >
          📞 Call Tutor
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center text-white transition-all bg-gradient-to-r from-[#4ECDC4] to-[#00B894] shadow-lg active:scale-95"
        >
          💬 Chat on WA
        </a>
      </div>
    </motion.div>
  );
};
