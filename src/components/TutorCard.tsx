import React from 'react';
import { Phone, MessageSquare, User, GraduationCap, Zap, Calendar, BookOpen, Clock, MapPin, Library, Share2, CheckCircle2, Info } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn, getCityTheme } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  if (!tutor) return null;

  // Robust Data Accessors - Priority Mapping
  const getValue = (keys: string[], fallback: string = '–') => {
    for (const key of keys) {
      const val = (tutor as any)[key];
      if (val !== undefined && val !== null && val !== '') {
        return val;
      }
    }
    return fallback;
  };

  const toProperCase = (text: string) => {
    return text
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  };

  const cityFull = getValue(['Preferred City', 'preferredCity', 'City', 'city'], 'India').toString();
  const tutorTheme = getCityTheme(cityFull);

  const nameRaw = getValue(['Name', 'name', 'fullName', 'Full Name'], 'Premium Tutor').toString();
  const name = toProperCase(nameRaw);
  const tutorId = getValue(['Tutor ID', 'tutorId', 'id', 'ID'], 'N/A').toString();
  const genderRaw = getValue(['Gender', 'gender'], '–').toString().trim();
  const displayGender = genderRaw && genderRaw.toLowerCase() !== 'null' ? genderRaw : '–';
  
  const cityShort = cityFull.substring(0, 15);
  
  const feeRaw = getValue(['Fee/Month', 'feeMonth', 'Fee', 'fee'], '₹200').toString();
  const getFee = (f: string) => {
    if (f === '0' || f === '–' || !f) return 'Flexible';
    const s = f.toString().split('(')[0].trim();
    return s.startsWith('₹') ? s : `₹${s}`;
  };

  const verified = getValue(['Verified', 'verified'], 'No').toString().toLowerCase().trim() === 'yes';
  const statusRaw = getValue(['Status', 'status'], 'Active').toString();
  const aboutRaw = getValue(['About', 'about', 'Notes', 'remarks'], '');
  
  const qualificationRaw = getValue(['Qualification(s)', 'qualifications', 'Qualification', 'Education'], 'Not Specified').toString();
  const experienceRaw = getValue(['Experience', 'experience', 'Exp'], 'Fresher').toString();
  const schoolExpRaw = getValue(['School Exp.', 'schoolExp', 'School Experience'], '').toString();
  const subjectsRaw = getValue(['Preferred Subject(s)', 'preferredSubjects', 'subjects', 'Subjects'], '').toString();
  const modeRaw = getValue(['Mode of Teaching', 'modeOfTeaching', 'Mode'], 'All Days').toString();
  const timeRaw = getValue(['Preferred Time', 'preferredTime', 'Time'], '').toString();
  const locationRaw = getValue(['Preferred Location(s)', 'preferredLocations', 'locations', 'Location'], '').toString();
  const addressRaw = getValue(['Address', 'address'], 'Hindi / English').toString();
  const vehicleRaw = getValue(['Have own Vehicle', 'haveOwnVehicle', 'Vehicle'], 'No').toString();
  const updatedRaw = getValue(['Record Added', 'recordAdded', 'Added On', 'Created At', 'Updated Time'], 'Recently').toString();

  const cleanAndFormatAbout = (text: string) => {
    if (!text) return ['No details available.'];
    let cleaned = text.replace(/\*/g, '').replace(/"/g, '').trim();
    let words = cleaned.split(/\s+/);
    if (words.length > 300) words = words.slice(0, 300);
    cleaned = words.join(' ');
    let sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
    let paragraphs: string[] = [];
    let currentPara = '';
    sentences.forEach(sent => {
        currentPara += sent;
        if (currentPara.length > 150) {
            paragraphs.push(currentPara.trim());
            currentPara = '';
        }
    });
    if (currentPara) paragraphs.push(currentPara.trim());
    return paragraphs.length > 0 ? paragraphs : [cleaned];
  };

  const getStatusBadge = (s: string) => {
    const lowS = s.toString().toLowerCase().trim();
    if (lowS === 'active' || !lowS || lowS === 'searching') return { label: 'Active', color: '#10B981', emoji: '✅' };
    if (lowS === 'not available' || lowS === 'busy' || lowS === 'no') return { label: 'Not Available', color: '#FBBF24', emoji: '⏸️' };
    return { label: 'Suspended', color: '#EF5350', emoji: '🚫' };
  };

  const status = getStatusBadge(statusRaw);
  const paragraphs = cleanAndFormatAbout(aboutRaw);
  const subjectList = subjectsRaw.toString().split(/[;,]/).map((s: string) => s.trim()).filter(Boolean);
  const locationList = locationRaw.toString().split(/[;,]/).map((l: string) => l.trim()).filter(Boolean);
  
  const getTimes = (times: string) => {
    if (!times) return [];
    const tStr = times.toString();
    return tStr.split(/[;,]/).map((t: string) => t.trim()).filter(Boolean);
  };
  const timeList = getTimes(timeRaw);

  const generateWhatsAppLink = () => {
    const subj = subjectList[0] || 'Tutoring';
    const message = `Hi ${name}! I'm interested in your tutoring services.\n\n*Details:*\n🆔 Tutor ID: ${tutorId}\n📚 Subject: ${subj}\n📍 City: ${cityFull}`;
    return `https://wa.me/919717018219?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="tutor-card w-full h-auto bg-white dark:bg-slate-900 flex flex-col relative sm:rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 mb-6 animate-fade-up">
      {/* Card Header - Light Orange Theme */}
      <div 
        className="p-8 sm:p-10 text-center relative shrink-0"
        style={{ background: tutorTheme.grad }}
      >
        <div className="absolute top-4 right-4 flex gap-2">
           {verified && (
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-1">
                <CheckCircle2 size={10} /> Verified
             </span>
           )}
           <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-1">
              {status.emoji} {status.label}
           </span>
        </div>

        <button className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/40 rounded-xl text-white transition-colors">
          <Share2 size={16} strokeWidth={3} />
        </button>
        
        <div className="text-xl sm:text-2xl font-[900] text-white mb-1 drop-shadow-md uppercase tracking-tight line-clamp-1 px-4">
          🎓 {name}
        </div>
        <div className="text-[10px] sm:text-[12px] font-black text-white/90 uppercase tracking-[0.2em]">
          🆔 Tutor ID: {tutorId}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8 flex-1">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">👥</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</div>
            <div className="text-[11px] sm:text-xs font-[900]" style={{ color: tutorTheme.solid }}>{displayGender}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">📍</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</div>
            <div className="text-[11px] sm:text-xs font-[900]" style={{ color: tutorTheme.solid }}>{cityShort}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">🏛️</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education</div>
            <div className="text-[11px] sm:text-xs font-[900] truncate w-full px-2" style={{ color: tutorTheme.solid }}>{qualificationRaw}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-1">
            <div className="text-3xl mb-1">💰</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exp. Fee</div>
            <div className="text-[11px] sm:text-xs font-[900]" style={{ color: tutorTheme.solid }}>{getFee(feeRaw)} / Mo</div>
          </div>
        </div>

        {/* Detailed Information Blocks */}
        <div className="space-y-8">
          <DetailSection icon={<BookOpen size={16} className="text-primary" />} label="Expert Subjects">
            <div className="flex flex-wrap gap-2">
              {subjectList.map((s, i) => (
                <span key={i} className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-100 dark:border-slate-700 shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </DetailSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <DetailSection icon={<Zap size={16} className="text-primary" />} label="Experience">
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="text-sm font-black text-slate-700 dark:text-white uppercase">{experienceRaw}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total expertise</div>
                  {schoolExpRaw && schoolExpRaw.toLowerCase() !== 'no' && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                       <Library size={12} className="text-primary" />
                       <span className="text-[10px] font-black text-primary uppercase">School Exp: {schoolExpRaw}</span>
                    </div>
                  )}
               </div>
            </DetailSection>

            <DetailSection icon={<Clock size={16} className="text-primary" />} label="Availability">
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex flex-wrap gap-1.5">
                    {timeList.length > 0 ? timeList.map((t, i) => (
                      <span key={i} className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">{t}{i < timeList.length - 1 ? ' • ' : ''}</span>
                    )) : <span className="text-[10px] font-black text-slate-400 uppercase">Not Specified</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <Calendar size={12} className="text-slate-400" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{modeRaw}</span>
                  </div>
               </div>
            </DetailSection>
          </div>

          <DetailSection icon={<MapPin size={16} className="text-primary" />} label="Target Territories">
            <div className="flex flex-wrap gap-2">
              {locationList.map((l, i) => (
                <span key={i} className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-slate-100 dark:border-slate-700">
                  {l}
                </span>
              ))}
            </div>
          </DetailSection>

          {aboutRaw && (
            <DetailSection icon={<Info size={16} className="text-primary" />} label="Professional Summary">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10" />
                <div className="space-y-4 relative z-10">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </DetailSection>
          )}

           <div className="flex justify-between items-center text-slate-400 pt-2 px-2">
              <div className="flex items-center gap-1.5">
                 <Calendar size={10} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Last Update: <span className="text-slate-600 dark:text-slate-300">{updatedRaw}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                 <Zap size={10} className="text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-primary">Active Expert</span>
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row gap-4 card-actions">
          <a 
            href={`tel:919717018219`}
            className="flex-1 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <Phone size={18} /> Call Now
          </a>
          <a 
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[1.5] h-16 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            style={{ background: tutorTheme.grad }}
          >
            <MessageSquare size={18} /> Connect on WA
          </a>
        </div>
      </div>
    </div>
  );
};

const DetailSection = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
  <div className="space-y-4">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5 ml-1">
        {icon} {label}
     </label>
     {children}
  </div>
);
