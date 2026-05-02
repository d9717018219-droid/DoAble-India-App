import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Share2, Phone, MessageSquare, Heart, CheckCircle2, MapPin, BookOpen, Clock, User, GraduationCap, Zap, Calendar, Car } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn, getCityTheme } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const gender = (tutor['Gender'] || '').trim();
  const displayGender = gender && gender !== 'null' ? gender : 'Not Specified';
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

  return (
    <div 
      className="w-full h-full snap-start snap-always bg-white dark:bg-slate-900 overflow-hidden flex flex-col relative border-b border-slate-100 dark:border-slate-800"
    >
      {/* Header */}
      <div 
        className="p-8 sm:p-12 text-center text-white relative flex flex-col justify-center items-center overflow-hidden shrink-0"
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
        
        <h2 className="text-2xl sm:text-4xl font-[900] text-[#FFD700] mb-1 drop-shadow-md truncate w-full px-4">
          ✨ {toProperCase(tutor['Name']) || 'Premium Tutor'}
        </h2>
        <div className="text-[10px] sm:text-[14px] font-black opacity-90 tracking-[0.2em] uppercase">
          🆔 Tutor ID: {tutor['Tutor ID'] || 'N/A'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-28">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">🎂</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</div>
            <div className="text-sm font-[900] text-primary">{tutor['Age'] || '–'}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">👥</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</div>
            <div className="text-sm font-[900] text-primary">{displayGender}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">📍</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</div>
            <div className="text-sm font-[900] text-primary truncate w-full px-2">{(tutor['Preferred City'] || 'India')}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">💰</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee</div>
            <div className="text-sm font-[900] text-primary truncate w-full px-2">{(tutor['Fee/Month'] || '₹200').split('(')[0].trim()}</div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expert Subjects</label>
              <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Subject(s)'] || 'Not Provided').split(/[,;]/).map((s, i) => s.trim() && (
                  <span key={i} className="px-5 py-2.5 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-xs font-black border border-pink-100 dark:border-pink-800 shadow-sm">
                    📖 {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Experience & Qualifications</label>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                 <div className="flex items-center gap-3 mb-2 text-primary">
                   <GraduationCap size={18} />
                   <span className="uppercase tracking-widest text-[10px] font-black">Qualification</span>
                 </div>
                 <div className="mb-4">{tutor['Qualification(s)'] || 'Degree Not Mentioned'}</div>
                 
                 <div className="flex items-center gap-3 mb-2 text-primary">
                   <Zap size={18} />
                   <span className="uppercase tracking-widest text-[10px] font-black">Experience</span>
                 </div>
                 <div>{tutor['Experience'] || 'Fresher'} Experience</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Preferred Locations</label>
              <div className="flex flex-wrap gap-2">
                {(tutor['Preferred Location(s)'] || 'Not Specified').split(/[,;]/).map((loc, i) => loc.trim() && (
                  <span key={i} className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black border border-blue-100 dark:border-blue-800">
                    📍 {loc.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Vehicle Status</label>
                <div className="text-[13px] font-[900] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Car size={14} className="text-primary" />
                  {tutor['Have own Vehicle'] === 'Yes' ? 'Owns Vehicle' : 'No Vehicle'}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Last Updated</label>
                <div className="text-[13px] font-[900] text-slate-700 dark:text-slate-300 flex items-center gap-2 justify-end">
                  <Calendar size={14} className="text-primary" />
                  {tutor['Record Added'] || 'Recently'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Dock */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <a 
          href="tel:+919971969197"
          className="p-5 rounded-2xl font-[900] text-xs uppercase tracking-widest text-center transition-all bg-gradient-to-r from-primary to-[#FF7675] text-white shadow-xl active:scale-95 flex items-center justify-center gap-2"
        >
          <Phone size={16} /> Call Tutor
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl font-[900] text-xs uppercase tracking-widest text-center text-white transition-all bg-gradient-to-r from-[#4ECDC4] to-[#00B894] shadow-xl active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageSquare size={16} /> Chat on WA
        </a>
      </div>
    </div>
  );
};
