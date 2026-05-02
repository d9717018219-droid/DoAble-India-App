import React from 'react';
import { Share2, Phone, MessageSquare, Heart, CheckCircle2, MapPin, BookOpen, Clock, User, GraduationCap, Zap, Calendar } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn, getCityTheme } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const gender = (tutor['Gender'] || '').trim();
  const displayGender = gender && gender !== 'null' ? gender : 'Any';
  const verified = (tutor['Verified'] || '').toString().toLowerCase().trim() === 'yes';
  const tutorTheme = getCityTheme(tutor['Preferred City'] || 'India');

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
    return `https://wa.me/919717018219?text=${encodeURIComponent(`Hi ${name}! I'm interested in your tutoring services. Tutor ID: ${id}`)}`;
  };

  const aboutText = tutor['About'] || 'No specific details provided.';
  const shortAbout = aboutText.split(' ').slice(0, 300).join(' ') + (aboutText.split(' ').length > 300 ? '...' : '');

  return (
    <div className="w-full min-h-[85vh] snap-start snap-always bg-white dark:bg-slate-900 flex flex-col relative border-b border-slate-100 dark:border-slate-800 animate-fade-down">
      {/* Header */}
      <div 
        className="p-8 sm:p-12 text-center text-white relative flex flex-col justify-center items-center overflow-hidden shrink-0"
        style={{ background: tutorTheme.grad }}
      >
        <div className="absolute top-4 right-4">
           {verified && (
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-1">
                <CheckCircle2 size={10} /> Verified
             </span>
           )}
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-[900] text-[#FFD700] mb-1 drop-shadow-md truncate w-full px-4 font-display">
          ✨ {toProperCase(tutor['Name'])}
        </h2>
        <div className="text-[10px] sm:text-[14px] font-black opacity-90 tracking-[0.2em] uppercase">
          🆔 Tutor ID: {tutor['Tutor ID'] || 'N/A'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">
        {/* Quick Stats Grid (4-Box) */}
        <div className="grid grid-cols-2 gap-4">
          <StatBox emoji="🎂" label="Age" value={tutor['Age'] || '–'} />
          <StatBox emoji="👥" label="Gender" value={displayGender} />
          <StatBox emoji="📍" label="City" value={tutor['Preferred City'] || 'India'} />
          <StatBox emoji="💰" label="Fee" value={(tutor['Fee/Month'] || '₹200').split('(')[0].trim()} />
        </div>

        {/* Content Blocks */}
        <div className="space-y-8">
          {/* About Me */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <User size={14} className="text-primary" /> About Me
             </label>
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 text-[14px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
               "{shortAbout}"
             </div>
          </div>

          {/* Qualification */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <GraduationCap size={14} className="text-primary" /> Qualification
             </label>
             <div className="flex flex-wrap gap-2">
                {(tutor['Qualification(s)'] || 'Not Specified').split(',').map((q, i) => (
                   <span key={i} className="tag-qualification">{q.trim()}</span>
                ))}
             </div>
          </div>

          {/* Expert Subjects */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <BookOpen size={14} className="text-primary" /> Expert Subjects
             </label>
             <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Subject(s)'] || 'Any').split(/[,;]/).map((s, i) => s.trim() && (
                  <span key={i} className="tag bg-pink-50 text-pink-600 border-pink-100 font-black text-[10px] px-4 py-2 rounded-xl">📖 {s.trim()}</span>
                ))}
             </div>
          </div>

          {/* Class Group */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <GraduationCap size={14} className="text-primary" /> Class Group
             </label>
             <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Class Group'] || 'All').split(',').map((c, i) => (
                   <span key={i} className="tag-class">{c.trim()}</span>
                ))}
             </div>
          </div>

          {/* Available Days */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> Available Days
             </label>
             <div className="flex flex-wrap gap-2">
                {(tutor['Mode of Teaching'] || 'All Days').split(',').map((d, i) => (
                   <span key={i} className="tag-days">{d.trim()}</span>
                ))}
             </div>
          </div>

          {/* Available Time */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Available Time
             </label>
             <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Time'] || 'Flexible').split(/[,;]/).map((t, i) => t.trim() && (
                   <span key={i} className="tag-time">🕐 {t.trim()}</span>
                ))}
             </div>
          </div>

          {/* Teaching Localities */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Teaching Localities
             </label>
             <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Location(s)'] || 'City Wide').split(/[,;]/).map((loc, i) => loc.trim() && (
                  <span key={i} className="tag bg-slate-50 text-slate-600 border-slate-100 font-black text-[10px] px-4 py-2 rounded-xl">📍 {loc.trim()}</span>
                ))}
             </div>
          </div>

          {/* Vehicle Status */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} className="text-primary" /> Vehicle Status
             </label>
             <div className="text-[14px] font-bold text-slate-700">{tutor['Have own Vehicle'] === 'Yes' ? '✅ Owns Vehicle' : '❌ No Vehicle'}</div>
          </div>

          {/* Last Updated */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Last Updated: {tutor['Record Added'] || 'Recently'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Action Dock */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 absolute bottom-0 left-0 right-0 z-10 shrink-0">
        <a 
          href="tel:+919971969197"
          className="p-5 rounded-2xl font-[900] text-xs uppercase tracking-widest text-center transition-all border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-95 flex items-center justify-center gap-2"
        >
          <Phone size={16} /> Call Tutor
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl font-[900] text-xs uppercase tracking-widest text-center text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#4ECDC4] to-[#00B894]"
        >
          <MessageSquare size={16} /> Chat on WA
        </a>
      </div>
    </div>
  );
};

const StatBox = ({ emoji, label, value }: { emoji: string, label: string, value: string }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
    <div className="text-3xl mb-1">{emoji}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    <div className="text-sm font-[900] text-primary truncate w-full px-2">{value}</div>
  </div>
);