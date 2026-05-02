import React from 'react';
import { Phone, MessageSquare, User, GraduationCap, Zap, Calendar, BookOpen, Clock, MapPin, Car, Info } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  if (!tutor) return null;

  // Robust Data Accessors
  const getValue = (keys: string[], fallback: string = '–') => {
    for (const key of keys) {
      if (tutor[key as keyof TutorProfile] !== undefined && tutor[key as keyof TutorProfile] !== null && tutor[key as keyof TutorProfile] !== '') {
        return tutor[key as keyof TutorProfile];
      }
    }
    return fallback;
  };

  const name = getValue(['Name', 'name', 'fullName'], 'Premium Tutor').toString();
  const tutorId = getValue(['Tutor ID', 'tutorId', 'id'], 'N/A').toString();
  const age = getValue(['Age', 'age'], '–').toString();
  const genderRaw = getValue(['Gender', 'gender'], '–').toString().trim();
  const displayGender = genderRaw && genderRaw.toLowerCase() !== 'null' ? genderRaw : '–';
  const city = getValue(['Preferred City', 'preferredCity', 'City', 'city'], 'India').toString();
  const feeRaw = getValue(['Fee/Month', 'feeMonth', 'Fee', 'fee'], '₹200').toString();
  const verified = getValue(['Verified', 'verified'], 'No').toString().toLowerCase().trim() === 'yes';
  const statusRaw = getValue(['Status', 'status'], 'Active').toString();
  const aboutRaw = getValue(['About', 'about', 'Notes'], '');
  const qualificationRaw = getValue(['Qualification(s)', 'qualifications', 'Qualification'], 'Not Specified').toString();
  const experienceRaw = getValue(['Experience', 'experience'], 'Fresher').toString();
  const schoolExpRaw = getValue(['School Exp.', 'schoolExp'], '').toString();
  const subjectsRaw = getValue(['Preferred Subject(s)', 'preferredSubjects', 'subjects'], '').toString();
  const classGroupRaw = getValue(['Preferred Class Group', 'preferredClassGroup', 'classGroup'], 'All Classes').toString();
  const modeRaw = getValue(['Mode of Teaching', 'modeOfTeaching'], 'All Days').toString();
  const timeRaw = getValue(['Preferred Time', 'preferredTime'], '').toString();
  const locationRaw = getValue(['Preferred Location(s)', 'preferredLocations', 'locations'], '').toString();
  const addressRaw = getValue(['Address', 'address'], 'Hindi / English').toString();
  const vehicleRaw = getValue(['Have own Vehicle', 'haveOwnVehicle'], 'No').toString();
  const updatedRaw = getValue(['Record Added', 'recordAdded', 'Updated Time'], 'Recently').toString();

  const getCityColor = (cityName: string) => {
    const colors = [
        '#C92A2A', '#E03131', '#F03E3E', '#FA5252', '#FD7E14', '#D63031', '#E84C3D', '#F1664F', '#0B7285', '#087E8B', '#0C8599', '#00862A', '#2B8A3E', '#40C057', '#5F3DC4', '#6741D9', '#7950F2', '#E8590C', '#F76707', '#FF6B35', '#B92E04', '#1566C0', '#1971C2', '#1C7ED6', '#C2103D', '#D6336C', '#E64980', '#4C0A86', '#5F3DC4', '#7950F2'
    ];
    let hash = 0;
    const cityStr = (cityName || 'India').toString();
    for (let i = 0; i < cityStr.length; i++) {
        hash = cityStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const cityColor = getCityColor(city);

  const toProperCase = (text: string) => {
    return text
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  };

  const getFee = (f: string) => {
    if (f === '0' || f === '–') return 'Flexible';
    const s = f.split('(')[0].trim();
    return s.startsWith('₹') ? s : `₹${s}`;
  };

  const cleanAndFormatAbout = (text: string) => {
    if (!text) return ['No details.'];
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

  const getTimes = (times: string) => {
    if (!times) return [];
    if (times.startsWith('[')) {
      try {
        const parsed = JSON.parse(times);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return times.split(/[;,]/).map((t: string) => t.trim()).filter(Boolean);
  };

  const getStatusBadge = (s: string) => {
    const lowS = s.toLowerCase();
    if (lowS === 'active' || !lowS) return { label: 'Active', color: '#10B981', emoji: '✅' };
    if (lowS === 'not available' || lowS === 'busy') return { label: 'Busy', color: '#FBBF24', emoji: '⏸️' };
    return { label: 'Suspended', color: '#EF5350', emoji: '🚫' };
  };

  const status = getStatusBadge(statusRaw);
  const paragraphs = cleanAndFormatAbout(aboutRaw);
  const subjectList = subjectsRaw.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean);
  const locationList = locationRaw.split(/[;,]/).map((l: string) => l.trim()).filter(Boolean);
  const timeList = getTimes(timeRaw);

  const generateWhatsAppLink = () => {
    const subj = subjectList[0] || 'Tutoring';
    const message = `Hi ${toProperCase(name)}! I'm interested in your tutoring services. Tutor ID: ${tutorId}${subj ? ` | Subject: ${subj}` : ''}${city ? ` | City: ${city}` : ''}`;
    return `https://wa.me/919717018219?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="tutor-card w-full h-auto bg-white dark:bg-slate-900 flex flex-col relative sm:rounded-[24px] overflow-hidden sm:shadow-lg sm:border border-slate-200 dark:border-slate-800 mb-4">
      {/* Header - Optimized */}
      <div 
        className="card-top p-6 sm:p-10 text-center text-white relative flex flex-col justify-center items-center overflow-hidden shrink-0"
        style={{ background: `linear-gradient(135deg, ${cityColor} 0%, ${cityColor}99 100%)` }}
      >
        <div className="relative z-10 w-full">
            <div className="space-y-0.5">
                <h2 className="text-lg sm:text-2xl font-black text-[#FFD700] mb-0.5 drop-shadow-sm truncate w-full px-2 font-display">
                  ✨ {toProperCase(name)}
                </h2>
                <div className="flex gap-3 justify-center text-[10px] sm:text-[12px] font-black opacity-90 tracking-widest uppercase">
                   <span>🆔 Tutor ID: {tutorId}</span>
                </div>
                <div className="flex gap-2 justify-center mt-2 flex-wrap">
                    {verified && (
                      <span className="bg-[#10B981] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-md">✅ Verified</span>
                    )}
                    <span className="text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-md" style={{ background: status.color }}>
                      {status.emoji} {status.label}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Grid - Stable */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8F9FA] dark:bg-[#3D3D3D] border-b border-[#F0F0F0] dark:border-[#444444]">
          <StatBox emoji="🎂" label="Age" value={age} />
          <StatBox emoji="👥" label="Gender" value={displayGender} />
          <StatBox emoji="📍" label="City" value={city} />
          <StatBox emoji="💰" label="Fee" value={getFee(feeRaw)} />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-8 pb-24">
        
        {/* About Me */}
        <div className="bg-linear-to-br from-[#F0F9FF] to-[#FCE7F3] dark:bg-[#3D3D3D] p-4 rounded-xl border-l-4 border-[#4ECDC4]">
            <div className="text-[10px] text-[#4ECDC4] uppercase font-black tracking-widest flex items-center gap-2 mb-1.5">
               <Info size={12} /> ABOUT
            </div>
            <div className="text-[13px] text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed font-medium">
               {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
        </div>

        {/* Qualification & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <Section label="Education" icon={<GraduationCap size={14} className="text-primary" />}>
              <div className="flex flex-wrap gap-1.5">
                 {qualificationRaw.split(',').map((q, i) => q.trim() && (
                    <span key={i} className="tag-qualification text-[10px]">{q.trim()}</span>
                 ))}
              </div>
           </Section>
           <Section label="Experience" icon={<Zap size={14} className="text-primary" />}>
              <div className="flex flex-wrap gap-1.5">
                 <span className="tag-experience text-[10px]">{experienceRaw}</span>
                 {schoolExpRaw && schoolExpRaw !== 'No' && schoolExpRaw !== 'null' && <span className="tag-school text-[10px]">🏫 {schoolExpRaw} School</span>}
              </div>
           </Section>
        </div>

        {/* Subjects & Class Group */}
        <div className="space-y-8">
          <Section label="Expert Subjects" icon={<BookOpen size={14} className="text-primary" />}>
             <div className="flex flex-wrap gap-1.5">
                {subjectList.length > 0 ? subjectList.map((s, i) => (
                  <span key={i} className="tag text-[10px]">📖 {s}</span>
                )) : <span className="text-slate-400 text-[10px] italic">Not updated</span>}
             </div>
          </Section>

          <Section label="Class Groups" icon={<GraduationCap size={14} className="text-primary" />}>
             <div className="flex flex-wrap gap-1.5">
                {classGroupRaw.split(',').map((cls, i) => cls.trim() && (
                   <span key={i} className="tag-class text-[10px]">{cls.trim()}</span>
                ))}
             </div>
          </Section>
        </div>

        {/* Localities */}
        <Section label="Teaching Localities" icon={<MapPin size={14} className="text-primary" />}>
           <div className="flex flex-wrap gap-1.5">
              {locationList.length > 0 ? locationList.map((loc, i) => (
                <span key={i} className="tag bg-white border-slate-200 text-slate-600 text-[10px]">📍 {loc}</span>
              )) : <span className="text-slate-400 text-[10px] italic">City Wide</span>}
           </div>
        </Section>
      </div>

      {/* Action Dock - Relative to Card */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <a 
          href="tel:9971969197"
          className="bg-linear-to-br from-[#FF6B6B] to-[#FF7675] text-white p-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest text-center shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Phone size={16} /> Call
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest text-center shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare size={16} /> WhatsApp
        </a>
      </div>
    </div>
  );
};

const StatBox = ({ emoji, label, value }: { emoji: string, label: string, value: any }) => (
  <div className="bg-white dark:bg-[#2D2D2D] p-3 rounded-xl border border-[#E8E8E8] dark:border-[#444444] text-center flex flex-col items-center justify-center gap-1 shadow-sm">
    <div className="text-xl mb-0.5">{emoji}</div>
    <div className="text-[13px] font-black text-[#FF6B6B] truncate w-full px-1">{value || '–'}</div>
    <div className="text-[9px] text-[#999] uppercase font-black">{label}</div>
  </div>
);

const Section = ({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="space-y-4">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5 ml-1">
        {icon} {label}
     </label>
     {children}
  </div>
);