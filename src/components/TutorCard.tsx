import React from 'react';
import { 
  MapPin, 
  ChevronRight, 
  Briefcase, 
  Star,
  CheckCircle2,
  Heart,
  BookOpen,
  FlaskConical,
  Globe,
  Monitor,
  Palette,
  GraduationCap,
  Calculator,
  Zap,
  Dna,
  Languages,
  TrendingUp,
  Code,
  Trophy,
  Sparkles
} from 'lucide-react';
import { TutorProfile } from '../types';
import { cn, toTitleCase } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
  onClick: (tutor: TutorProfile) => void;
  isShortlisted?: boolean;
  onShortlistToggle?: (id: string, e: React.MouseEvent) => void;
}

const getSubjectStyles = (subjects: string = '') => {
  const s = subjects.toLowerCase();
  
  if (s.includes('math')) return { bg: 'bg-blue-600', icon: <Calculator size={24} /> };
  if (s.includes('physics')) return { bg: 'bg-red-500', icon: <Zap size={24} /> };
  if (s.includes('chem')) return { bg: 'bg-teal-500', icon: <FlaskConical size={24} /> };
  if (s.includes('bio') || s.includes('science')) return { bg: 'bg-lime-600', icon: <Dna size={24} /> };
  if (s.includes('english')) return { bg: 'bg-indigo-600', icon: <Languages size={24} /> };
  if (s.includes('hindi')) return { bg: 'bg-orange-600', icon: <Languages size={24} /> };
  if (s.includes('history') || s.includes('geo') || s.includes('sst') || s.includes('social')) return { bg: 'bg-emerald-600', icon: <Globe size={24} /> };
  if (s.includes('eco') || s.includes('stat')) return { bg: 'bg-violet-600', icon: <TrendingUp size={24} /> };
  if (s.includes('account') || s.includes('business')) return { bg: 'bg-cyan-600', icon: <Briefcase size={24} /> };
  if (s.includes('comput') || s.includes('coding') || s.includes('it')) return { bg: 'bg-slate-800', icon: <Code size={24} /> };
  if (s.includes('music') || s.includes('art')) return { bg: 'bg-purple-500', icon: <Palette size={24} /> };
  if (s.includes('yoga') || s.includes('dance') || s.includes('sport')) return { bg: 'bg-pink-500', icon: <Trophy size={24} /> };
  if (s.includes('all')) return { bg: 'bg-primary', icon: <Sparkles size={24} /> };
  
  return { bg: 'bg-primary', icon: <GraduationCap size={24} /> };
};

export const TutorCard: React.FC<TutorCardProps> = React.memo(({ 
  tutor, 
  onClick, 
  isShortlisted, 
  onShortlistToggle 
}) => {
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
  const area = getValue(['Preferred Locality', 'preferredArea', 'Locality', 'Area'], '').toString().split(/[;,]/)[0].trim();
  const location = area ? `${area} - ${city}` : city;
  const fee = getValue(['Fee/Month', 'feeMonth', 'Fee', 'fee'], 'Flexible').toString();
  const exp = getValue(['Experience', 'experience', 'Teaching Experience'], '1-3 Years').toString();
  const qual = getValue(['Qualification(s)', 'qualifications', 'Qualification'], 'Graduate').toString();
  const subjects = getValue(['Preferred Subject(s)', 'preferredSubjects', 'subjects'], 'General').toString();
  const verified = getValue(['Verified', 'verified'], 'No').toString().toLowerCase().trim() === 'yes';

  const { bg, icon } = getSubjectStyles(subjects);

  return (
    <div 
      onClick={() => onClick(tutor)}
      className="bg-white rounded-[20px] p-3 shadow-sm border border-slate-100 flex flex-col gap-2.5 active:scale-[0.98] transition-all cursor-pointer relative group overflow-hidden mb-2"
    >
      <div className="flex items-start gap-2.5">
        {/* Left Icon Box - Smaller */}
        <div className={cn("w-[54px] h-[54px] rounded-[16px] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm text-white", bg)}>
          {icon}
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-primary text-[9.5px] font-bold tracking-tight uppercase">ID: {tutorId}</span>
              {verified && <CheckCircle2 size={10} className="text-[#10B981]" fill="currentColor" />}
            </div>
            <span className="text-[#94A3B8] text-[8.5px] font-bold uppercase tracking-widest">{location}</span>
          </div>
          
          <h4 className="text-[14px] font-[800] text-[#0F172A] leading-tight tracking-tight truncate">
            {toTitleCase(name)}
          </h4>
          <p className="text-[#64748B] text-[10.5px] font-[500] truncate">{qual}</p>
          
          <div className="flex items-center gap-2 pt-1">
            <div className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
               <span className="text-[#0F172A] text-[9.5px] font-black tracking-tighter whitespace-nowrap">
                 {(() => {
                    const cleanFee = fee.replace(/\/.*|per.*|month|mo/gi, '').trim();
                    return cleanFee.startsWith('₹') ? cleanFee : `₹${cleanFee}`;
                 })()}/hr
               </span>
            </div>
          </div>
        </div>

        {/* Right Arrow & Like */}
        <div className="flex flex-col items-end justify-between h-[54px] flex-shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onShortlistToggle?.(tutorId, e); }}
            className={cn("transition-colors", isShortlisted ? "text-red-500" : "text-slate-300 hover:text-red-500")}
          >
            <Heart size={16} fill={isShortlisted ? "currentColor" : "none"} />
          </button>
          <div className="text-slate-300">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-1.5 border-t border-slate-50 mt-0.5">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={10} className="text-primary" />
          <span className="text-[8.5px] font-bold text-slate-700 uppercase tracking-tight">School Exp: {getValue(['School Exp.', 'schoolExp'], 'No')}</span>
        </div>
        <span className="text-[#94A3B8] text-[8.5px] font-bold uppercase tracking-tight">Own Vehicle: {getValue(['Have own Vehicle', 'haveOwnVehicle'], 'No')}</span>
      </div>
    </div>
  );
});

TutorCard.displayName = 'TutorCard';