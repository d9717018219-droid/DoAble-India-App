import React from 'react';
import { Phone, MessageSquare, User, GraduationCap, Zap, Calendar, BookOpen, Clock, MapPin, Car, Info, Library } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn } from '../utils';

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

  const nameRaw = getValue(['Name', 'name', 'fullName', 'Full Name'], 'Premium Tutor').toString();
  const name = toProperCase(nameRaw);
  const tutorId = getValue(['Tutor ID', 'tutorId', 'id', 'ID'], 'N/A').toString();
  const age = getValue(['Age', 'age'], '–').toString();
  const genderRaw = getValue(['Gender', 'gender'], '–').toString().trim();
  const displayGender = genderRaw && genderRaw.toLowerCase() !== 'null' ? genderRaw : '–';
  
  const cityFull = getValue(['Preferred City', 'preferredCity', 'City', 'city'], 'India').toString();
  const cityShort = cityFull.substring(0, 10);
  
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
  const classGroupRaw = getValue(['Preferred Class Group', 'preferredClassGroup', 'classGroup', 'Class'], 'All Classes').toString();
  const modeRaw = getValue(['Mode of Teaching', 'modeOfTeaching', 'Mode'], 'All Days').toString();
  const timeRaw = getValue(['Preferred Time', 'preferredTime', 'Time'], '').toString();
  const locationRaw = getValue(['Preferred Location(s)', 'preferredLocations', 'locations', 'Location'], '').toString();
  const addressRaw = getValue(['Address', 'address'], 'Hindi / English').toString();
  const vehicleRaw = getValue(['Have own Vehicle', 'haveOwnVehicle', 'Vehicle'], 'No').toString();
  const updatedRaw = getValue(['Record Added', 'recordAdded', 'Added On', 'Created At', 'Updated Time'], 'Recently').toString();

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

  const cityColor = getCityColor(cityFull);

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
  const subjectList = subjectsRaw.toString().split(';').map((s: string) => s.trim()).filter(Boolean);
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
    <div className="tutor-card w-full h-auto bg-white dark:bg-slate-900 flex flex-col relative sm:rounded-[24px] overflow-hidden sm:shadow-lg sm:border border-slate-200 dark:border-slate-800 mb-4">
      {/* 1. Identity & Header Mapping */}
      <div 
        className="card-top p-6 sm:p-10 text-center text-white relative flex flex-col justify-center items-center overflow-hidden shrink-0"
        style={{ background: `linear-gradient(135deg, ${cityColor} 0%, ${cityColor}99 100%)` }}
      >
        <div className="relative z-10 w-full">
            <div className="space-y-0.5">
                <h2 className="text-lg sm:text-2xl font-black text-[#FFD700] mb-0.5 drop-shadow-sm truncate w-full px-2 font-display">
                  ✨ {name}
                </h2>
                <div className="flex gap-3 justify-center text-[10px] sm:text-[12px] font-black opacity-90 tracking-widest uppercase">
                   <span>🆔 Tutor ID: {tutorId}</span>
                </div>
                <div className="flex gap-2 justify-center mt-2 flex-wrap">
                    {verified && (
                      <span className="bg-[#10B981] text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md">✅ Verified Badge</span>
                    )}
                    <span className="text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md" style={{ background: status.color }}>
                      {status.emoji} {status.label}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Quick Stats Grid (4-Box Section) */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8F9FA] dark:bg-[#3D3D3D] border-b border-[#F0F0F0] dark:border-[#444444]">
          <StatBox emoji="🎂" label="Age" value={age} />
          <StatBox emoji="👥" label="Gender" value={displayGender} />
          <StatBox emoji="📍" label="City" value={cityShort} />
          <StatBox emoji="💰" label="Fee" value={getFee(feeRaw)} />
      </div>

      {/* 3. Detailed Information Blocks */}
      <div className="p-4 sm:p-6 space-y-8 pb-24">
        
        {/* About Me Section */}
        <div className="bg-linear-to-br from-[#F0F9FF] to-[#FCE7F3] dark:bg-[#3D3D3D] p-4 rounded-xl border-l-4 border-[#4ECDC4]">
            <div className="text-[10px] text-[#4ECDC4] uppercase font-black tracking-widest flex items-center gap-2 mb-1.5">
               <Info size={12} /> ℹ️ ABOUT ME
            </div>
            <div className="text-[13px] text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed font-medium">
               {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
        </div>

        {/* Qualification & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <Section label="Qualification" icon={<GraduationCap size={14} className="text-blue-500" />}>
              <div className="flex flex-wrap gap-1.5">
                 {qualificationRaw.split(',').map((q, i) => q.trim() && (
                    <span key={i} className="tag-qualification text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100 font-bold">{q.trim()}</span>
                 ))}
              </div>
           </Section>
           <Section label="Experience" icon={<Library size={14} className="text-purple-500" />}>
              <div className="flex flex-wrap gap-1.5">
                 <span className="tag-experience text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-lg border border-purple-100 font-bold">{experienceRaw}</span>
                 {schoolExpRaw && schoolExpRaw !== 'No' && schoolExpRaw !== 'null' && <span className="tag-school text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100 font-bold">🏫 {schoolExpRaw} School Exp</span>}
              </div>
           </Section>
        </div>

        {/* Expert Subjects & Class Group */}
        <div className="space-y-8">
          <Section label="Expert Subjects" icon={<BookOpen size={14} className="text-emerald-500" />}>
             <div className="flex flex-wrap gap-1.5">
                {subjectList.length > 0 ? subjectList.map((s, i) => (
                  <span key={i} className="tag text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100 font-bold">📖 {s}</span>
                )) : <span className="text-slate-400 text-[10px] italic">Not updated</span>}
             </div>
          </Section>

          <Section label="Class Group" icon={<BookOpen size={14} className="text-sky-500" />}>
             <div className="flex flex-wrap gap-1.5">
                {classGroupRaw.split(',').map((cls, i) => cls.trim() && (
                   <span key={i} className="tag-class text-[10px] bg-sky-50 text-sky-600 px-2 py-1 rounded-lg border border-sky-100 font-bold">{cls.trim()}</span>
                ))}
             </div>
          </Section>
        </div>

        {/* Available Days & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <Section label="Available Days" icon={<Calendar size={14} className="text-rose-500" />}>
              <div className="flex flex-wrap gap-1.5">
                 {modeRaw.split(',').map((day, i) => day.trim() && (
                    <span key={i} className="tag-days text-[10px] bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100 font-bold">{day.trim()}</span>
                 ))}
              </div>
           </Section>
           <Section label="Available Time" icon={<Clock size={14} className="text-orange-500" />}>
              <div className="flex flex-wrap gap-1.5">
                 {timeList.length > 0 ? timeList.map((t, i) => (
                    <span key={i} className="tag-time text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100 font-bold">🕐 {t}</span>
                 )) : <span className="text-slate-400 text-[10px] italic">Flexible</span>}
              </div>
           </Section>
        </div>

        {/* Teaching Localities */}
        <Section label="Teaching Localities" icon={<MapPin size={14} className="text-slate-500" />}>
           <div className="flex flex-wrap gap-1.5">
              {locationList.length > 0 ? locationList.map((loc, i) => (
                <span key={i} className="tag bg-white border-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded-lg border shadow-sm font-bold">📍 {loc}</span>
              )) : <span className="text-slate-400 text-[10px] italic">City Wide</span>}
           </div>
        </Section>

        {/* 4. Footer & Additional Metadata */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                 <MessageSquare size={14} />
                 <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase">Communication</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{addressRaw || 'Hindi / English'}</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                 <Car size={14} />
                 <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase">Own Vehicle</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{vehicleRaw}</span>
                 </div>
              </div>
           </div>
           
           <div className="flex justify-between items-center text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                 <Calendar size={10} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Last Updated: <span className="text-slate-600 dark:text-slate-300">{updatedRaw}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                 <Zap size={10} className="text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-primary">Active Profile</span>
              </div>
           </div>
        </div>
      </div>

      {/* 5. Action Buttons (Links) */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <a 
          href="tel:9971969197"
          className="bg-linear-to-br from-[#FF6B6B] to-[#FF7675] text-white p-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest text-center shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Phone size={16} /> Call Now
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
    <div className="text-[9px] text-[#999] uppercase font-black tracking-tight">{label}</div>
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