import React from 'react';
import { 
  MapPin, 
  ChevronRight, 
  Briefcase, 
  Star,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { TutorProfile } from '../types';
import { cn } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
  onClick: (tutor: TutorProfile) => void;
}

const getSubjectEmoji = (subjects: string = '') => {
  const s = subjects.toLowerCase();
  if (s.includes('math')) return { bg: 'bg-[#FFE2E2]', emoji: '🔢' };
  if (s.includes('science') || s.includes('physics') || s.includes('chem') || s.includes('bio')) return { bg: 'bg-[#FEF3C7]', emoji: '🔬' };
  if (s.includes('english') || s.includes('hindi') || s.includes('language')) return { bg: 'bg-[#E0E7FF]', emoji: '📚' };
  if (s.includes('social') || s.includes('sst') || s.includes('history')) return { bg: 'bg-[#D1FAE5]', emoji: '🌍' };
  if (s.includes('comput') || s.includes('coding') || s.includes('it')) return { bg: 'bg-[#F1F5F9]', emoji: '💻' };
  if (s.includes('music') || s.includes('art')) return { bg: 'bg-[#FAE8FF]', emoji: '🎨' };
  return { bg: 'bg-slate-100', emoji: '🎓' };
};

export const TutorCard: React.FC<TutorCardProps> = React.memo(({ tutor, onClick }) => {
  if (!tutor) return null;

  const getValue = (keys: string[], fallback: string = '–') => {
    for (const key of keys) {
      const val = (tutor as any)[key];
      if (val !== undefined && val !== null && val !== '') return val;
    }
    return fallback;
  };

  const name = getValue(['Name', 'name', 'fullName', 'Full Name'], 'Premium Tutor').toString();
  const tutorId = getValue(['Tutor ID', 'tutorId', 'id', 'ID'], 'N/A').toString();
  const city = getValue(['Preferred City', 'preferredCity', 'City', 'city'], 'India').toString();
  const fee = getValue(['Fee/Month', 'feeMonth', 'Fee', 'fee'], 'Flexible').toString();
  const exp = getValue(['Experience', 'experience', 'Teaching Experience'], '1-3 Years').toString();
  const qual = getValue(['Qualification(s)', 'qualifications', 'Qualification'], 'Graduate').toString();
  const subjects = getValue(['Preferred Subject(s)', 'preferredSubjects', 'subjects'], 'General').toString();
  const verified = getValue(['Verified', 'verified'], 'No').toString().toLowerCase().trim() === 'yes';

  const { bg, emoji } = getSubjectEmoji(subjects);

  return (
    <div 
      onClick={() => onClick(tutor)}
      className="bg-white rounded-[22px] p-4 shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-[0.98] transition-all cursor-pointer relative group overflow-hidden mb-2"
    >
      <div className="flex items-start gap-3">
        {/* Left Emoji Box - Smaller */}
        <div className={cn("w-[60px] h-[60px] rounded-[18px] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm text-[28px]", bg)}>
          {emoji}
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-primary text-[10px] font-bold tracking-tight">Premium Tutor</span>
              {verified && <CheckCircle2 size={10} className="text-[#10B981]" fill="currentColor" />}
            </div>
            <span className="text-[#94A3B8] text-[9px] font-bold uppercase tracking-widest">Tutor ID: {tutorId}</span>
          </div>
          
          <h4 className="text-[15px] font-[800] text-[#0F172A] leading-tight tracking-tight truncate">
            {name}
          </h4>
          <p className="text-[#64748B] text-[11px] font-[500] truncate">{qual}</p>
          
          <div className="flex items-center gap-1 text-[#64748B] text-[11px] font-[500] pt-0.5">
            <MapPin size={10} className="text-slate-400" />
            <span className="truncate">{city}</span>
          </div>

          <div className="flex items-center gap-2 pt-1.5">
            <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
               <span className="text-[#0F172A] text-[10px] font-bold tracking-tight">
                 {fee.startsWith('₹') ? fee : `₹${fee}`}
               </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
               <span className="text-[#64748B] text-[10px] font-bold">{exp} Exp</span>
            </div>
          </div>
        </div>

        {/* Right Arrow & Like */}
        <div className="flex flex-col items-end justify-between h-[60px] flex-shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="text-slate-300 hover:text-red-500 transition-colors"
          >
            <Heart size={18} />
          </button>
          <div className="text-slate-300">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-1">
        <div className="flex items-center gap-1.5">
          <Star size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-[10px] font-bold text-slate-700">4.8</span>
          <span className="text-[9px] text-slate-400">(120+ reviews)</span>
        </div>
        <span className="text-[#94A3B8] text-[9px] font-medium">Available Now</span>
      </div>
    </div>
  );
});

TutorCard.displayName = 'TutorCard';