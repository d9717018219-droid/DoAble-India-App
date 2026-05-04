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

const getSubjectStyles = (subject: string = '') => {
  const s = subject.toLowerCase();
  if (s.includes('math')) return { bg: 'bg-[#FFE2E2]', icon: <Calculator className="text-[#FF6B6B]" size={32} /> };
  if (s.includes('english')) return { bg: 'bg-[#E0E7FF]', icon: <BookText className="text-[#6366F1]" size={32} /> };
  if (s.includes('science')) return { bg: 'bg-[#FEF3C7]', icon: <Beaker className="text-[#D97706]" size={32} /> };
  if (s.includes('social') || s.includes('sst')) return { bg: 'bg-[#D1FAE5]', icon: <Globe className="text-[#10B981]" size={32} /> };
  return { bg: 'bg-slate-100', icon: <GraduationCap className="text-slate-500" size={32} /> };
};

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const subjects = (job.subjects || 'General').split(/[;,]/)[0].trim();
  const { bg, icon } = getSubjectStyles(subjects);
  
  const classBoard = job['Class / Board'] || ((job.Class || '') + (job.Board ? ' (' + job.Board + ')' : '')) || 'General';
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
        {/* Left Icon */}
        <div className={cn("w-[70px] h-[70px] rounded-[20px] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105", bg)}>
          {icon}
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
