import React from 'react';
import { Share2, Phone, MessageSquare, CheckCircle2, MapPin, BookOpen, Clock, User, GraduationCap, Zap, Calendar, Car, ShieldCheck } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn, getCityTheme } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const gender = (tutor['Gender'] || '').trim();
  const displayGender = gender && gender !== 'null' ? gender : '–';
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

  const getFee = (feeStr: string) => {
    if (!feeStr) return '₹200';
    return feeStr.split('(')[0].trim();
  };

  const cleanAndFormatAbout = (text: string) => {
    if (!text) return 'No specific details provided.';
    const words = text.split(/\s+/);
    const limited = words.slice(0, 300).join(' ');
    return words.length > 300 ? limited + '...' : limited;
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'Active').toLowerCase();
    if (s === 'active') return { label: '✅ Active', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (s === 'not available' || s === 'busy') return { label: '⏸️ Busy', bg: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { label: '🚫 Suspended', bg: 'bg-rose-50 text-rose-600 border-rose-100' };
  };

  const generateWhatsAppLink = () => {
    const name = toProperCase(tutor['Name']) || 'Tutor';
    const id = tutor['Tutor ID'] || 'N/A';
    const subj = tutor['Preferred Subject(s)'] ? tutor['Preferred Subject(s)'].split(';')[0].trim() : 'Tutoring';
    const city = tutor['Preferred City'] || '';
    
    const message = `Hi ${name}! I'm interested in your tutoring services. Tutor ID: ${id} | Subject: ${subj} | City: ${city}`;
    return `https://wa.me/919717018219?text=${encodeURIComponent(message)}`;
  };

  const status = getStatusBadge(tutor['Status']);

  return (
    <div className="w-full h-auto min-h-[85vh] snap-start snap-always bg-white dark:bg-slate-900 flex flex-col relative border-b border-slate-100 dark:border-slate-800 animate-fade-down overflow-visible">
      {/* Header with Dynamic Gradient */}
      <div 
        className="p-10 sm:p-14 text-center text-white relative flex flex-col justify-center items-center overflow-hidden shrink-0"
        style={{ background: tutorTheme.grad }}
      >
        <div className="absolute top-4 right-4 flex gap-2">
           {verified && (
             <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-1.5 shadow-lg">
                <ShieldCheck size={12} className="fill-white/20" /> Verified
             </span>
           )}
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <h2 className="text-3xl sm:text-5xl font-[900] text-[#FFD700] mb-2 drop-shadow-md truncate w-full px-4 font-display">
          ✨ {toProperCase(tutor['Name'])}
        </h2>
        <div className="text-[12px] sm:text-[16px] font-black opacity-90 tracking-[0.3em] uppercase">
          🆔 Tutor ID: {tutor['Tutor ID'] || 'N/A'}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8 space-y-10 pb-36">
        
        {/* Status Badge Row */}
        <div className="flex justify-center">
           <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", status.bg)}>
             {status.label}
           </span>
        </div>

        {/* Quick Stats Grid (4-Box) */}
        <div className="grid grid-cols-2 gap-4">
          <StatBox emoji="🎂" label="Age" value={tutor['Age'] || '–'} />
          <StatBox emoji="👥" label="Gender" value={displayGender} />
          <StatBox emoji="📍" label="Preferred City" value={tutor['Preferred City'] || 'India'} />
          <StatBox emoji="💰" label="Estimated Fee" value={getFee(tutor['Fee/Month'])} />
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10">
          
          {/* About Me */}
          <Section label="About Me" icon={<User size={16} className="text-primary" />}>
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 text-[15px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed font-body whitespace-pre-line">
               {cleanAndFormatAbout(tutor['About'])}
             </div>
          </Section>

          {/* Qualification */}
          <Section label="Academic Background" icon={<GraduationCap size={16} className="text-primary" />}>
             <div className="flex flex-wrap gap-2.5">
                {(tutor['Qualification(s)'] || 'Not Specified').split(',').map((q, i) => (
                   <span key={i} className="tag-qualification">{q.trim()}</span>
                ))}
             </div>
          </Section>

          {/* Experience Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Section label="Overall Experience" icon={<Zap size={16} className="text-primary" />}>
               <span className="tag-experience w-full text-center py-3">{tutor['Experience'] || 'Fresher'}</span>
            </Section>
            {tutor['School Exp.'] && (
              <Section label="School Experience" icon={<BookOpen size={16} className="text-primary" />}>
                 <span className="tag-school w-full text-center py-3">{tutor['School Exp.']}</span>
              </Section>
            )}
          </div>

          {/* Expert Subjects */}
          <Section label="Expert Subjects" icon={<BookOpen size={16} className="text-primary" />}>
             <div className="flex flex-wrap gap-2.5">
                {(tutor['Preferred Subject(s)'] || 'Any').split(/[;,]/).map((s, i) => s.trim() && (
                  <span key={i} className="tag border-primary/20 text-primary font-black text-[11px] px-5 py-2.5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">📖 {s.trim()}</span>
                ))}
             </div>
          </Section>

          {/* Class Group */}
          <Section label="Preferred Class Group" icon={<GraduationCap size={16} className="text-primary" />}>
             <div className="flex flex-wrap gap-2.5">
                {(tutor['Preferred Class Group'] || 'All').split(',').map((c, i) => (
                   <span key={i} className="tag-class">{c.trim()}</span>
                ))}
             </div>
          </Section>

          {/* Availability (Days & Time) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Section label="Available Days" icon={<Calendar size={16} className="text-primary" />}>
               <div className="flex flex-wrap gap-2.5">
                  {(tutor['Mode of Teaching'] || 'All Days').split(',').map((d, i) => (
                     <span key={i} className="tag-days">{d.trim()}</span>
                  ))}
               </div>
            </Section>
            <Section label="Available Time" icon={<Clock size={16} className="text-primary" />}>
               <div className="flex flex-wrap gap-2.5">
                  {(tutor['Preferred Time'] || 'Flexible').split(/[;,]/).map((t, i) => t.trim() && (
                     <span key={i} className="tag-time">🕐 {t.trim()}</span>
                  ))}
               </div>
            </Section>
          </div>

          {/* Teaching Localities */}
          <Section label="Preferred Teaching Localities" icon={<MapPin size={16} className="text-primary" />}>
             <div className="flex flex-wrap gap-2.5">
                {(tutor['Preferred Location(s)'] || 'City Wide').split(/[;,]/).map((loc, i) => loc.trim() && (
                  <span key={i} className="tag border-slate-200 text-slate-600 font-black text-[11px] px-5 py-2.5 rounded-2xl bg-white shadow-sm">📍 {loc.trim()}</span>
                ))}
             </div>
          </Section>

          {/* Vehicle & Communication */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Section label="Vehicle Status" icon={<Car size={16} className="text-primary" />}>
               <div className="text-[14px] font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">{tutor['Have own Vehicle'] === 'Yes' ? '✅ Owns Vehicle' : '❌ No Vehicle'}</div>
            </Section>
            <Section label="Communication" icon={<MessageSquare size={16} className="text-primary" />}>
               <div className="text-[14px] font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">{tutor['Address'] || 'Hindi / English'}</div>
            </Section>
          </div>

          {/* Last Updated */}
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center">
             <div className="flex items-center gap-2.5 text-slate-400">
                <Calendar size={14} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Record Updated: {tutor['Record Added'] || 'Recently'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Action Dock - Final Optimized */}
      <div className="grid grid-cols-2 gap-5 p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 absolute bottom-0 left-0 right-0 z-[50] shrink-0">
        <a 
          href="tel:+919971969197"
          className="p-5 rounded-[24px] font-[900] text-[11px] uppercase tracking-widest text-center transition-all border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-95 flex items-center justify-center gap-2 shadow-sm"
        >
          <Phone size={18} /> Call Now
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-[24px] font-[900] text-[11px] uppercase tracking-widest text-center text-white shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 bg-[#25D366] animate-glow"
        >
          <MessageSquare size={18} /> Chat on WA
        </a>
      </div>
    </div>
  );
};

const StatBox = ({ emoji, label, value }: { emoji: string, label: string, value: string }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-3xl mb-1">{emoji}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    <div className="text-sm font-[900] text-slate-900 dark:text-white truncate w-full px-2">{value}</div>
  </div>
);

const Section = ({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="space-y-4">
     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5 ml-1">
        {icon} {label}
     </label>
     {children}
  </div>
);