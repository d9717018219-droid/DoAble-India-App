import React, { useRef } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Calculator, 
  BookText, 
  Beaker, 
  Globe, 
  GraduationCap,
  Clock,
  Briefcase
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { JobLead } from '../types';
import { cn, formatCurrency, formatPostedDate, getCityPhone } from '../utils';

interface JobCardProps {
  job: JobLead;
}

const getSubjectStyles = (subject: string = '', classStr: string = '') => {
  const s = subject.toLowerCase();
  const c = classStr.toLowerCase();
  
  if (s.includes('math')) return { bg: 'bg-[#FFE2E2]', emoji: '🔢' };
  if (s.includes('science') || s.includes('physics') || s.includes('chem') || s.includes('bio')) return { bg: 'bg-[#FEF3C7]', emoji: '🔬' };
  if (s.includes('english') || s.includes('hindi') || s.includes('language') || s.includes('french')) return { bg: 'bg-[#E0E7FF]', emoji: '📚' };
  if (s.includes('social') || s.includes('sst') || s.includes('history') || s.includes('geo')) return { bg: 'bg-[#D1FAE5]', emoji: '🌍' };
  if (s.includes('comput') || s.includes('coding') || s.includes('it') || s.includes('python')) return { bg: 'bg-[#F1F5F9]', emoji: '💻' };
  if (s.includes('music') || s.includes('guitar') || s.includes('piano') || s.includes('vocal')) return { bg: 'bg-[#FAE8FF]', emoji: '🎸' };
  if (s.includes('art') || s.includes('paint') || s.includes('draw')) return { bg: 'bg-[#FFF7ED]', emoji: '🎨' };
  if (s.includes('sport') || s.includes('chess') || s.includes('yoga') || s.includes('dance')) return { bg: 'bg-[#ECFDF5]', emoji: '⚽' };
  
  // Class based defaults if subject is generic
  if (c.includes('nursery') || c.includes('lkg') || c.includes('ukg') || c.includes('kg')) return { bg: 'bg-[#FFF1F2]', emoji: '🖍️' };
  if (c.includes('1') || c.includes('2') || c.includes('3') || c.includes('4') || c.includes('5')) return { bg: 'bg-[#F0F9FF]', emoji: '🍎' };
  
  return { bg: 'bg-slate-100', emoji: '🎓' };
};

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const subjects = (job.subjects || 'General').split(/[;,]/)[0].trim();
  const classBoard = job['Class / Board'] || ((job.Class || '') + (job.Board ? ' (' + job.Board + ')' : '')) || 'General';
  const { bg, emoji } = getSubjectStyles(subjects, classBoard);
  
  const locationRaw = job.Locations || job.City || 'India';
  const location = locationRaw.toString().split(/[;,]/).map(l => l.trim().split('-')[0].trim())[0];
  const postedDate = formatPostedDate(job['Updated Time'] || job['Record Added']);
  const isNew = true; // For demo matching image

  const generateWhatsAppLink = () => {
    const orderId = job['Order ID'] || 'N/A';
    const phone = getCityPhone(job.City);
    const resi = (job as any).residency || 'Student Home Address';
    const message = `Hello,\n\nI am interested in Order ID: ${orderId}.\nLocation: ${resi}, ${location}\n\nThank you.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div 
      ref={cardRef}
      onClick={() => window.open(generateWhatsAppLink(), '_blank')}
      className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer relative group overflow-hidden"
    >
      <div className="flex items-start gap-4">
        {/* Left Icon Box with Emoji */}
        <div className={cn("w-[70px] h-[70px] rounded-[22px] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm text-[32px]", bg)}>
          {emoji}
        </div>

        {/* Middle Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#10B981] text-[11px] font-bold tracking-tight">Teaching Job</span>
            {isNew && (
              <span className="bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">New</span>
            )}
          </div>
          
          <h4 className="text-[17px] font-[800] text-[#0F172A] leading-tight tracking-tight">
            {job.Name || subjects + ' Teacher'}
          </h4>
          <p className="text-[#64748B] text-[12px] font-[500]">{classBoard}</p>
          
          <div className="flex items-center gap-1 text-[#64748B] text-[12px] font-[500] pt-0.5">
            <MapPin size={12} className="text-slate-400" />
            <span>{location}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
               <span className="text-[#0F172A] text-[11px] font-bold tracking-tight">
                 ₹{formatCurrency(job.Fee || '0')} / Month
               </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
               <Briefcase size={10} className="text-slate-400" />
               <span className="text-[#64748B] text-[10px] font-bold">1-3 Years Exp.</span>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex flex-col items-end justify-between h-[70px]">
          <button className="text-slate-300 hover:text-primary transition-colors">
            <Bookmark size={20} />
          </button>
          <div className="text-slate-300">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <span className="text-[#94A3B8] text-[10px] font-medium flex items-center gap-1">
          Posted: {postedDate}
        </span>
      </div>
    </div>
  );
};
