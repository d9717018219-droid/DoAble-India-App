import React from 'react';
import { motion } from 'motion/react';
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

  const statusInfo = tutor['Status'] === 'Active' 
    ? { label: '✅ Active', color: '#10B981' } 
    : { label: tutor['Status'] === 'Not Available' ? '⏸️ Busy' : '🚫 Suspended', color: tutor['Status'] === 'Not Available' ? '#FBBF24' : '#EF5350' };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-2 border-transparent transition-all hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(255,107,107,0.2)] hover:border-primary group flex flex-col"
    >
      {/* Header */}
      <div 
        className="p-6 sm:p-8 text-center text-white relative flex flex-col justify-center items-center overflow-hidden"
        style={{ background: tutorTheme.grad }}
      >
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <h2 className="text-xl sm:text-[24px] font-extrabold text-[#FFD700] mb-1 sm:mb-2 drop-shadow-sm truncate w-full px-2">
          ✨ {toProperCase(tutor['Name']) || 'Tutor'}
        </h2>
        <div className="text-[10px] sm:text-[11px] font-bold opacity-90 tracking-widest uppercase">
          🆔 Tutor ID: {tutor['Tutor ID'] || 'N/A'}
        </div>
        
        <div className="mt-3 sm:mt-4 flex gap-2 justify-center flex-wrap">
          {verified && (
            <span className="bg-[#10B981] text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border border-white/20">
              ✅ Verified
            </span>
          )}
          <span 
            className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm"
            style={{ background: statusInfo.color, color: 'white' }}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-3 sm:p-4 bg-[#F8F9FA] border-b-2 border-[#F0F0F0]">
        <div className="stat-item p-2 sm:p-2.5">
          <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🎂</div>
          <div className="text-xs sm:text-[14px] font-bold text-primary">{tutor['Age'] || '–'}</div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black">Age</div>
        </div>
        <div className="stat-item p-2 sm:p-2.5">
          <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">👥</div>
          <div className="text-xs sm:text-[14px] font-bold text-primary">{displayGender}</div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black">Gender</div>
        </div>
        <div className="stat-item p-2 sm:p-2.5">
          <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">📍</div>
          <div className="text-xs sm:text-[14px] font-bold text-primary">{(tutor['Preferred City'] || 'India').substring(0, 10)}</div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black">City</div>
        </div>
        <div className="stat-item p-2 sm:p-2.5">
          <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">💰</div>
          <div className="text-xs sm:text-[14px] font-bold text-primary">{(tutor['Fee/Month'] || '₹200').split('(')[0].trim().substring(0, 8)}</div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black">Fee</div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 flex-1">
        {tutor['About'] && (
          <div className="bg-[#F0F9FF] p-3 sm:p-4 rounded-xl border-l-[4px] border-[#4ECDC4]">
            <div className="text-[9px] sm:text-[10px] font-black text-[#4ECDC4] uppercase mb-1 sm:mb-1.5 tracking-widest">ℹ️ About Me</div>
            <div className="text-[11px] sm:text-[12px] text-slate-600 font-bold leading-relaxed space-y-1.5">
              {tutor['About'].split('\n').map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {tutor['Qualification(s)'] && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider">🎓 Qualification</div>
            <div className="flex flex-wrap gap-1.5">
              {tutor['Qualification(s)'].split(',').map((q, i) => (
                <span key={i} className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-blue-50 text-[10px] sm:text-[11px] font-bold text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                  🎓 {q.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {tutor['Experience'] && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider">📚 Experience</div>
            <div className="text-[12px] sm:text-[13px] font-bold text-slate-700 bg-slate-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">{tutor['Experience']}</div>
          </div>
        )}

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">📚 Expert Subjects</label>
          <div className="flex flex-wrap gap-1.5">
            {(tutor['Preferred Subject(s)'] || '').split(';').map((s, i) => s.trim() && (
              <span key={i} className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-pink-50 text-[10px] sm:text-[11px] font-bold text-pink-600 border border-pink-100 hover:scale-105 transition-transform flex items-center gap-1.5">
                📖 {s.trim()}
              </span>
            ))}
          </div>
        </div>

        {tutor['School Exp.'] && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">🏫 School Experience</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-3 py-1.5 rounded-xl bg-cyan-50 text-[11px] font-extrabold text-cyan-600 border border-cyan-100 flex items-center gap-2 hover:bg-cyan-100 transition-colors shadow-sm">
                {tutor['School Exp.']}
              </span>
            </div>
          </div>
        )}

        {tutor['Preferred Class Group'] && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">📖 Class Group</div>
            <div className="flex flex-wrap gap-1.5">
              {tutor['Preferred Class Group'].split(',').map((cls, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-orange-50 text-[11px] font-bold text-orange-600 border border-orange-100">{cls.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {tutor['Mode of Teaching'] && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">📅 Mode / Days</div>
            <div className="flex flex-wrap gap-1.5">
              {tutor['Mode of Teaching'].split(',').map((day, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[11px] font-bold text-emerald-600 border border-emerald-100">{day.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {(tutor['Preferred Time'] || '').split(/[,;]/).filter(t => t.trim()).length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">⏰ Preferred Time</div>
            <div className="flex flex-wrap gap-1.5">
              {(tutor['Preferred Time'] || '').split(/[,;]/).map((time, i) => time.trim() && (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-purple-50 text-[11px] font-bold text-purple-600 border border-purple-100">🕐 {time.trim()}</span>
              ))}
            </div>
          </div>
        )}


        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">📍 Preferred Localities</label>
          <div className="flex flex-wrap gap-1.5">
            {(tutor['Preferred Location(s)'] || '').split(/[,;]/).map((l, i) => {
              const loc = l.trim();
              if (!loc) return null;
              return (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-[11px] font-extrabold text-indigo-600 border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {loc.split('-')[0].trim()}
                </span>
              );
            })}
          </div>
        </div>


        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
           <div className="space-y-2">
             <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">🚗 Own Vehicle</div>
             <div className={cn(
               "px-3 py-2 rounded-xl text-[11px] font-bold border flex items-center gap-2 self-start",
               tutor['Have own Vehicle'] === 'Yes' 
                 ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                 : "bg-slate-50 text-slate-400 border-slate-100"
             )}>
               {tutor['Have own Vehicle'] === 'Yes' ? '✅ Owns Vehicle' : '❌ No Vehicle'}
             </div>
           </div>
           <div className="space-y-2 text-right">
             <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">📅 Record Updated</div>
             <div className="text-[12px] font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-block">
               {tutor['Record Added'] || 'Recently'}
             </div>
           </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">💬 Communication / Address</div>
          <div className="text-[13px] font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100/50 leading-relaxed">
            {tutor['Address'] || 'Available for discussions in Hindi & English'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border-t border-slate-100">
        <a 
          href="tel:+919971969197"
          className="p-3.5 rounded-xl font-black text-[13px] uppercase tracking-widest text-center text-white transition-all bg-gradient-to-r from-primary to-[#FF7675] shadow-lg shadow-primary/20 active:scale-95"
        >
          📞 Call
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-xl font-black text-[13px] uppercase tracking-widest text-center text-white transition-all bg-gradient-to-r from-[#4ECDC4] to-[#00B894] shadow-lg shadow-[#4ECDC4]/20 active:scale-95"
        >
          💬 Chat
        </a>
      </div>
    </motion.div>
  );
};

const StatCell = ({ emoji, value, label }: { emoji: string, value: string, label: string }) => (
  <div className="flex flex-col items-center justify-center p-3 border-r last:border-r-0 border-slate-100">
    <span className="text-base mb-0.5">{emoji}</span>
    <span className="text-[11px] font-black text-slate-800 truncate w-full text-center">{value}</span>
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
  </div>
);

const InfoItem = ({ label, value }: { label: string, value?: string }) => {
  if (!value || value === 'null' || !value.trim()) return null;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">{label}</label>
      <div className="tag w-full !block !whitespace-normal font-bold">
        {value}
      </div>
    </div>
  );
};
