import React from 'react';
import { Share2, Phone, MessageSquare, ShieldCheck, User, GraduationCap, Zap, Calendar, BookOpen, Clock, MapPin, Car, Info } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn, getCityTheme } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const gender = (tutor['Gender'] || '').trim();
  const displayGender = gender && gender !== 'null' ? gender : '–';
  const verified = (tutor['Verified'] || '').toString().toLowerCase().trim() === 'yes';
  
  // Custom City Color Hash Logic (as per provided HTML)
  const getCityColor = (city: string) => {
    const colors = [
        '#C92A2A', '#E03131', '#F03E3E', '#FA5252', '#FD7E7E',
        '#D63031', '#E84C3D', '#F1664F', '#F7746D', '#FB9088',
        '#0B7285', '#087E8B', '#0C8599', '#0F8CA9', '#189BA0',
        '#00862A', '#2B8A3E', '#40C057', '#51CF66', '#69DB7C',
        '#5F3DC4', '#6741D9', '#7950F2', '#845EF7', '#9775FA',
        '#E8590C', '#F76707', '#FF6B35', '#FD7E14', '#FF9C3D',
        '#B92E04', '#C92A2A', '#D9380E', '#E67700', '#F59F00',
        '#1566C0', '#1971C2', '#1C7ED6', '#1C92D2', '#339AF0',
        '#C2103D', '#D6336C', '#E64980', '#F06595', '#F783AC',
        '#4C0A86', '#5F3DC4', '#7950F2', '#845EF7', '#9775FA'
    ];
    let hash = 0;
    for (let i = 0; i < city.length; i++) {
        hash = city.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const cityColor = getCityColor(tutor['Preferred City'] || 'India');

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
    if (!text) return ['No specific details provided.'];
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

    return paragraphs.length > 0 ? paragraphs : ['No specific details provided.'];
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'Active').toLowerCase();
    if (s === 'active') return { label: 'Active', color: '#10B981', emoji: '✅' };
    if (s === 'not available' || s === 'busy') return { label: 'Busy', color: '#FBBF24', emoji: '⏸️' };
    return { label: 'Suspended', color: '#EF5350', emoji: '🚫' };
  };

  const generateWhatsAppLink = () => {
    const name = toProperCase(tutor['Name']) || 'Tutor';
    const id = tutor['Tutor ID'] || 'N/A';
    const subject = tutor['Preferred Subject(s)'] ? tutor['Preferred Subject(s)'].split(';')[0].trim() : 'Tutoring';
    const city = tutor['Preferred City'] || '';
    const fee = tutor['Fee/Month'] ? tutor['Fee/Month'].split('(')[0].trim() : '';

    let message = `Hi ${name}!%0A%0AI'm interested in your tutoring services. Tutor ID: ${id}%0A%0A`;
    if (subject) message += `Subject: ${subject}%0A`;
    if (city) message += `Location: ${city}%0A`;
    if (fee) message += `Rate: ${fee}%0A`;
    message += `%0APlease share your availability and rates. Thanks!`;

    return `https://wa.me/919717018219?text=${message}`;
  };

  const status = getStatusBadge(tutor['Status']);
  const paragraphs = cleanAndFormatAbout(tutor['About']);

  return (
    <div className="tutor-card w-full h-auto min-h-[85vh] snap-start snap-always bg-white dark:bg-slate-900 flex flex-col relative border-b border-slate-100 dark:border-slate-800 animate-fade-down overflow-visible tutor-card-glow">
      {/* Card Top / Header */}
      <div 
        className="card-top p-10 sm:p-14 text-center text-white relative flex flex-col justify-center items-center overflow-hidden shrink-0"
        style={{ background: `linear-gradient(135deg, ${cityColor} 0%, ${cityColor}99 100%)` }}
      >
        <div className="tutor-header relative z-10 w-full">
            <div className="tutor-info space-y-2">
                <h2 className="text-3xl sm:text-5xl font-[800] text-[#FFD700] mb-2 drop-shadow-md truncate w-full px-4 font-display">
                  ✨ {toProperCase(tutor['Name'])}
                </h2>
                <div className="tutor-meta flex gap-3 justify-center text-[12px] sm:text-[14px] font-black opacity-90 tracking-[0.2em] uppercase">
                   <span>🆔 Tutor ID: {tutor['Tutor ID'] || 'N/A'}</span>
                </div>
                <div className="flex gap-2 justify-center mt-3 flex-wrap">
                    {verified && (
                      <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg">✅ Verified</span>
                    )}
                    <span className="text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-lg" style={{ background: status.color }}>
                      {status.emoji} {status.label}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="quick-stats grid grid-cols-2 gap-3 p-4 bg-[#F8F9FA] dark:bg-[#3D3D3D] border-b-2 border-[#F0F0F0] dark:border-[#444444]">
          <div className="stat-item bg-white dark:bg-[#2D2D2D] p-3 rounded-xl border border-[#E8E8E8] dark:border-[#444444] text-center transition-all">
              <div className="stat-emoji text-2xl mb-1">🎂</div>
              <div className="stat-value text-[14px] font-bold text-primary">{tutor['Age'] || '–'}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase font-bold">Age</div>
          </div>
          <div className="stat-item bg-white dark:bg-[#2D2D2D] p-3 rounded-xl border border-[#E8E8E8] dark:border-[#444444] text-center transition-all">
              <div className="stat-emoji text-2xl mb-1">👥</div>
              <div className="stat-value text-[14px] font-bold text-primary">{displayGender}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase font-bold">Gender</div>
          </div>
          <div className="stat-item bg-white dark:bg-[#2D2D2D] p-3 rounded-xl border border-[#E8E8E8] dark:border-[#444444] text-center transition-all">
              <div className="stat-emoji text-2xl mb-1">📍</div>
              <div className="stat-value text-[14px] font-bold text-primary truncate w-full px-1">{(tutor['Preferred City'] || 'India').substring(0, 10)}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase font-bold">City</div>
          </div>
          <div className="stat-item bg-white dark:bg-[#2D2D2D] p-3 rounded-xl border border-[#E8E8E8] dark:border-[#444444] text-center transition-all">
              <div className="stat-emoji text-2xl mb-1">💰</div>
              <div className="stat-value text-[14px] font-bold text-primary truncate w-full px-1">{getFee(tutor['Fee/Month'])}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase font-bold">Fee</div>
          </div>
      </div>

      {/* Card Content */}
      <div className="card-content p-6 sm:p-8 space-y-8 pb-36">
        
        {/* About Me */}
        <div className="about-card bg-linear-to-br from-[#F0F9FF] to-[#FCE7F3] dark:bg-[#3D3D3D] p-4 rounded-xl border-l-4 border-[#4ECDC4]">
            <div className="about-label text-[10px] color-[#4ECDC4] uppercase font-bold tracking-widest flex items-center gap-2">
               <Info size={12} /> ℹ️ About Me
            </div>
            <div className="about-text text-[13px] text-slate-600 dark:text-slate-300 mt-2 space-y-2 leading-relaxed">
               {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
        </div>

        {/* Qualification */}
        <div className="info-block space-y-2">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <GraduationCap size={14} className="text-primary" /> 🎓 Qualification
            </div>
            <div className="tags-container flex flex-wrap gap-2">
                {(tutor['Qualification(s)'] || 'Not Specified').split(',').map((q, i) => (
                   <span key={i} className="tag-qualification">{q.trim()}</span>
                ))}
            </div>
        </div>

        {/* Experience */}
        <div className="info-block space-y-2">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <Zap size={14} className="text-primary" /> 📚 Experience
            </div>
            <div className="tags-container flex flex-wrap gap-2">
                <span className="tag-experience">{tutor['Experience'] || 'Fresher'}</span>
            </div>
        </div>

        {/* School Experience */}
        {tutor['School Exp.'] && (
          <div className="info-block space-y-2">
              <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
                 <User size={14} className="text-primary" /> 🏫 School Experience
              </div>
              <div className="tags-container flex flex-wrap gap-2">
                  <span className="tag-school">{tutor['School Exp.']}</span>
              </div>
          </div>
        )}

        {/* Expert Subjects */}
        <div className="info-block space-y-2">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <BookOpen size={14} className="text-primary" /> 📚 Expert Subjects
            </div>
            <div className="tags-container flex flex-wrap gap-2">
                {(tutor['Preferred Subject(s)'] || 'Any').split(/[;]/).map((s, i) => s.trim() && (
                  <span key={i} className="tag">{s.trim()}</span>
                ))}
            </div>
        </div>

        {/* Class Group */}
        <div className="info-block space-y-2">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <GraduationCap size={14} className="text-primary" /> 📖 Class Group
            </div>
            <div className="tags-container flex flex-wrap gap-2">
                {(tutor['Preferred Class Group'] || 'All').split(',').map((cls, i) => (
                   <span key={i} className="tag-class">{cls.trim()}</span>
                ))}
            </div>
        </div>

        {/* Available Days */}
        <div className="info-block space-y-2">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <Calendar size={14} className="text-primary" /> 📅 Available Days
            </div>
            <div className="tags-container flex flex-wrap gap-2">
                {(tutor['Mode of Teaching'] || 'All Days').split(',').map((day, i) => (
                   <span key={i} className="tag-days">{day.trim()}</span>
                ))}
            </div>
        </div>

        {/* Available Time */}
        <div className="info-block space-y-2">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <Clock size={14} className="text-primary" /> ⏰ Available Time
            </div>
            <div className="tags-container flex flex-wrap gap-2">
                {(tutor['Preferred Time'] || 'Flexible').split(/[;,]/).map((time, i) => time.trim() && (
                   <span key={i} className="tag-time">🕐 {time.trim()}</span>
                ))}
            </div>
        </div>

        {/* Teaching Localities */}
        <div className="info-block space-y-2">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <MapPin size={14} className="text-primary" /> 📍 Teaching Localities
            </div>
            <div className="tags-container flex flex-wrap gap-2">
                {(tutor['Preferred Location(s)'] || 'City Wide').split(/[;,]/).map((loc, i) => loc.trim() && (
                  <span key={i} className="tag">{loc.trim()}</span>
                ))}
            </div>
        </div>

        {/* Communication */}
        <div className="info-block space-y-1">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <MessageSquare size={14} className="text-primary" /> 💬 Communication
            </div>
            <div className="info-value text-[13px] text-slate-600 dark:text-slate-300 font-bold px-1">{tutor['Address'] || 'Hindi/English'}</div>
        </div>

        {/* Own Vehicle */}
        <div className="info-block space-y-1">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <Car size={14} className="text-primary" /> 🚗 Own Vehicle
            </div>
            <div className="info-value text-[13px] text-slate-600 dark:text-slate-300 font-bold px-1">{tutor['Have own Vehicle'] || 'No'}</div>
        </div>

        {/* Last Updated */}
        <div className="info-block space-y-1">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <Calendar size={14} className="text-primary" /> 📅 Last Updated
            </div>
            <div className="info-value text-[13px] text-slate-600 dark:text-slate-300 font-bold px-1">{tutor['Record Added'] || 'Recently'}</div>
        </div>

        {/* Status */}
        <div className="info-block space-y-1">
            <div className="info-label text-[10px] text-[#999] font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
               <ShieldCheck size={14} className="text-primary" /> ✅ Status
            </div>
            <div className="info-value pt-1">
                {verified ? (
                   <span className="bg-[#10B981] text-white px-3 py-1.5 rounded-full text-[11px] font-bold inline-block shadow-sm">✅ Verified</span>
                ) : (
                   <span className="bg-[#EF5350] text-white px-3 py-1.5 rounded-full text-[11px] font-bold inline-block shadow-sm">⏳ Pending</span>
                )}
            </div>
        </div>

      </div>

      {/* Final Action Dock */}
      <div className="card-actions grid grid-cols-2 gap-4 p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 absolute bottom-0 left-0 right-0 z-[50] shrink-0">
        <a 
          href="tel:9971969197"
          className="btn btn-call bg-linear-to-br from-[#FF6B6B] to-[#FF7675] text-white p-4 rounded-xl font-bold text-[13px] text-center shadow-lg hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Phone size={18} /> Call
        </a>
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp bg-linear-to-br from-[#4ECDC4] to-[#00B894] text-white p-4 rounded-xl font-bold text-[13px] text-center shadow-lg hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageSquare size={18} /> Chat
        </a>
      </div>
    </div>
  );
};
