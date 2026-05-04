import React from 'react';
import { Phone, MessageSquare, GraduationCap, Zap, Calendar, BookOpen, Clock, MapPin, Library, Share2, CheckCircle2, Info } from 'lucide-react';
import { TutorProfile } from '../types';
import { cn } from '../utils';

interface TutorCardProps {
  tutor: TutorProfile;
  onClick: (tutor: TutorProfile) => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor, onClick }) => {
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
  const classGroupRaw = getValue(['Preferred Class Group', 'preferredClassGroup', 'classGroup', 'Class'], 'All Classes').toString();
  const modeRaw = getValue(['Mode of Teaching', 'modeOfTeaching', 'Mode'], 'All Days').toString();
  const timeRaw = getValue(['Preferred Time', 'preferredTime', 'Time'], '').toString();
  const locationRaw = getValue(['Preferred Location(s)', 'preferredLocations', 'locations', 'Location'], '').toString();
  const addressRaw = getValue(['Address', 'address'], 'Hindi / English').toString();
  const vehicleRaw = getValue(['Have own Vehicle', 'haveOwnVehicle', 'Vehicle'], 'No').toString();
  const updatedRaw = getValue(['Record Added', 'recordAdded', 'Added On', 'Created At', 'Updated Time'], 'Recently').toString();

  const getCityColor = (cityName: string) => {
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
    const cityStr = (cityName || 'India').toString();
    for (let i = 0; i < cityStr.length; i++) {
        hash = cityStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const cityColor = getCityColor(cityFull);

  const cleanAndFormatAbout = (text: string) => {
    if (!text) return null;
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
    return paragraphs;
  };

  const getStatusBadge = (s: string) => {
    const lowS = s.toString().toLowerCase().trim();
    if (lowS === 'active' || lowS === 'searching') return { label: 'Active', color: '#10B981', emoji: '✅' };
    if (lowS === 'not available' || lowS === 'busy' || lowS === 'no') return { label: 'Not Available', color: '#FBBF24', emoji: '⏸️', textColor: '#333' };
    return { label: 'Suspended', color: '#EF5350', emoji: '🚫' };
  };

  const status = getStatusBadge(statusRaw);
  const paragraphs = cleanAndFormatAbout(aboutRaw);
  const subjectList = subjectsRaw.toString().split(/[;,]/).map((s: string) => s.trim()).filter(Boolean);
  const locationList = locationRaw.toString().split(/[;,]/).map((l: string) => l.trim().split('-')[0].trim()).filter(Boolean);
  
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
    <div 
      onClick={() => onClick(tutor)}
      className="tutor-card w-full h-auto bg-white rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-400 border-2 border-transparent hover:translate-y-[-15px] hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(255,107,107,0.2)] hover:border-[#FF6B6B] flex flex-col relative animate-fade-up mb-6 cursor-pointer"
    >
      {/* ─── TOP SECTION ─── */}
      <div 
        className="card-top p-6 sm:p-10 text-center text-white relative flex flex-col justify-center items-center overflow-hidden shrink-0"
        style={{ background: `linear-gradient(135deg, ${cityColor} 0%, ${cityColor}99 100%)` }}
      >
        <div className="relative z-10 w-full">
            <div className="space-y-0.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#FFD700] mb-0.5 drop-shadow-sm truncate w-full px-2" style={{ textShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
                  ✨ {name}
                </h2>
                <div className="flex gap-3 justify-center text-[10px] sm:text-[12px] font-black opacity-90 tracking-widest uppercase">
                   <span>🆔 Tutor ID: {tutorId}</span>
                </div>
                <div className="flex gap-2 justify-center mt-2 flex-wrap">
                    {verified && (
                      <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-md">✅ Verified</span>
                    )}
                    <span className="text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-md" style={{ background: status.color, color: status.textColor || 'white' }}>
                      {status.emoji} {status.label}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* ─── QUICK STATS ─── */}
      <div className="quick-stats grid grid-cols-2 gap-2.5 p-4 bg-[#F8F9FA] border-b-2 border-[#F0F0F0]">
          <div className="stat-item bg-white p-2.5 rounded-xl text-center border border-[#E8E8E8] transition-all duration-300">
              <div className="stat-emoji text-2xl mb-1">🎂</div>
              <div className="stat-value text-sm font-bold text-[#FF6B6B]">{age}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase mt-0.5">Age</div>
          </div>
          <div className="stat-item bg-white p-2.5 rounded-xl text-center border border-[#E8E8E8] transition-all duration-300">
              <div className="stat-emoji text-2xl mb-1">👥</div>
              <div className="stat-value text-sm font-bold text-[#FF6B6B]">{displayGender}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase mt-0.5">Gender</div>
          </div>
          <div className="stat-item bg-white p-2.5 rounded-xl text-center border border-[#E8E8E8] transition-all duration-300">
              <div className="stat-emoji text-2xl mb-1">📍</div>
              <div className="stat-value text-sm font-bold text-[#FF6B6B]">{cityShort}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase mt-0.5">City</div>
          </div>
          <div className="stat-item bg-white p-2.5 rounded-xl text-center border border-[#E8E8E8] transition-all duration-300">
              <div className="stat-emoji text-2xl mb-1">💰</div>
              <div className="stat-value text-sm font-bold text-[#FF6B6B]">{getFee(feeRaw).substring(0, 10)}</div>
              <div className="stat-label text-[10px] text-[#999] uppercase mt-0.5">Fee</div>
          </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="card-content p-5 flex-1 space-y-4">
          {paragraphs && (
            <div className="about-card bg-gradient-to-br from-[#F0F9FF] to-[#FCE7F3] p-3.5 rounded-xl border-l-4 border-[#4ECDC4] shadow-sm">
                <div className="about-label text-[10px] text-[#4ECDC4] font-bold uppercase">ℹ️ About Me</div>
                <div className="about-text text-[12px] text-[#2C3E50] mt-1.5 leading-relaxed space-y-2 font-medium">
                    {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
            </div>
          )}

          {qualificationRaw && (
            <div className="info-block">
                <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">🎓 Qualification</div>
                <div className="tags-container flex flex-wrap gap-1.5">
                    {qualificationRaw.split(',').map((q, i) => q.trim() && (
                      <span key={i} className="tag-qualification bg-gradient-to-br from-[#E7F5FF] to-[#F0E7FF] text-[#1971C2] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#1971C2]/20 hover:from-[#1971C2] hover:to-[#1C7ED6] hover:text-white hover:scale-110 transition-all duration-300">
                        {q.trim()}
                      </span>
                    ))}
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {experienceRaw && (
               <div className="info-block">
                   <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">📚 Experience</div>
                   <div className="tags-container flex flex-wrap gap-1.5">
                       <span className="tag-experience bg-gradient-to-br from-[#F0F9FF] to-[#F3E5F5] text-[#9C36B5] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#9C36B5]/20 hover:from-[#9C36B5] hover:to-[#CE5DE8] hover:text-white hover:scale-110 transition-all duration-300">
                         {experienceRaw}
                       </span>
                   </div>
               </div>
             )}
             {schoolExpRaw && (
               <div className="info-block">
                   <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">🏫 School Experience</div>
                   <div className="tags-container flex flex-wrap gap-1.5">
                       <span className="tag-school bg-gradient-to-br from-[#FEF3C7] to-[#FED7AA] text-[#B45309] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#B45309]/20 hover:from-[#B45309] hover:to-[#92400E] hover:text-white hover:scale-110 transition-all duration-300">
                         {schoolExpRaw}
                       </span>
                   </div>
               </div>
             )}
          </div>

          {subjectList.length > 0 && (
            <div className="info-block">
                <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">📚 Expert Subjects</div>
                <div className="tags-container flex flex-wrap gap-1.5">
                    {subjectList.map((s, i) => (
                      <span key={i} className="tag bg-gradient-to-br from-[#E3F2FD] to-[#F3E5F5] text-[#FF6B6B] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#FF6B6B]/20 hover:from-[#FF6B6B] hover:to-[#FF7675] hover:text-white hover:scale-110 transition-all duration-300">
                        {s}
                      </span>
                    ))}
                </div>
            </div>
          )}

          {classGroupRaw && (
            <div className="info-block">
                <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">📖 Class Group</div>
                <div className="tags-container flex flex-wrap gap-1.5">
                    {classGroupRaw.split(',').map((cls, i) => cls.trim() && (
                      <span key={i} className="tag-class bg-gradient-to-br from-[#E0F2FE] to-[#F0E7FF] text-[#0284C7] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#0284C7]/20 hover:from-[#0284C7] hover:to-[#0369A1] hover:text-white hover:scale-110 transition-all duration-300">
                        {cls.trim()}
                      </span>
                    ))}
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {modeRaw && (
               <div className="info-block">
                   <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">📅 Available Days</div>
                   <div className="tags-container flex flex-wrap gap-1.5">
                       {modeRaw.split(',').map((day, i) => day.trim() && (
                         <span key={i} className="tag-days bg-gradient-to-br from-[#F3E5F5] to-[#FCE7F3] text-[#D6336C] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#D6336C]/20 hover:from-[#D6336C] hover:to-[#E64980] hover:text-white hover:scale-110 transition-all duration-300">
                           {day.trim()}
                         </span>
                       ))}
                   </div>
               </div>
             )}
             <div className="info-block">
                 <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">⏰ Available Time</div>
                 <div className="tags-container flex flex-wrap gap-1.5">
                     {timeList.length > 0 ? timeList.map((time, i) => (
                       <span key={i} className="tag-time bg-gradient-to-br from-[#FFF3E0] to-[#F3E5F5] text-[#FF9800] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#FF9800]/20 hover:from-[#FF9800] hover:to-[#FF7043] hover:text-white hover:scale-110 transition-all duration-300">
                         🕐 {time}
                       </span>
                     )) : <span className="info-value text-[13px] text-[#2C3E50]">—</span>}
                 </div>
             </div>
          </div>

          {locationList.length > 0 && (
            <div className="info-block">
                <div className="info-label text-[10px] text-[#999] uppercase font-bold mb-1.5 tracking-wider">📍 Teaching Localities</div>
                <div className="tags-container flex flex-wrap gap-1.5">
                    {locationList.map((loc, i) => (
                      <span key={i} className="tag bg-gradient-to-br from-[#E3F2FD] to-[#F3E5F5] text-[#FF6B6B] px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[#FF6B6B]/20 hover:from-[#FF6B6B] hover:to-[#FF7675] hover:text-white hover:scale-110 transition-all duration-300">
                        {loc}
                      </span>
                    ))}
                </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
              <div className="info-block">
                  <div className="info-label text-[10px] text-[#999] uppercase font-bold tracking-wider">💬 Communication</div>
                  <div className="info-value text-[13px] text-[#2C3E50] font-medium">{addressRaw || 'Hindi/English'}</div>
              </div>

              <div className="info-block">
                  <div className="info-label text-[10px] text-[#999] uppercase font-bold tracking-wider">🚗 Own Vehicle</div>
                  <div className="info-value text-[13px] text-[#2C3E50] font-medium">{vehicleRaw || 'No'}</div>
              </div>

              <div className="info-block">
                  <div className="info-label text-[10px] text-[#999] uppercase font-bold tracking-wider">📅 Last Updated</div>
                  <div className="info-value text-[13px] text-[#2C3E50] font-medium">{updatedRaw || 'Recently'}</div>
              </div>

              <div className="info-block">
                  <div className="info-label text-[10px] text-[#999] uppercase font-bold tracking-wider">✅ Status</div>
                  <div className="info-value mt-1">
                      {verified ? (
                        <span className="bg-[#10B981] text-white px-3 py-1.5 rounded-full text-[11px] font-bold inline-block shadow-md">✅ Verified</span>
                      ) : (
                        <span className="bg-[#EF5350] text-white px-3 py-1.5 rounded-full text-[11px] font-bold inline-block shadow-md">⏳ Pending</span>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* ─── ACTIONS ─── */}
      <div className="card-actions grid grid-cols-2 gap-2.5 p-4 bg-gradient-to-br from-[#F8FAFC] to-[#F0F4F8] border-t-2 border-[#E8EEF5]">
          <a href="tel:9971969197" className="btn btn-call bg-gradient-to-br from-[#FF6B6B] to-[#FF7675] text-white px-4 py-3 rounded-xl font-bold text-[13px] text-center shadow-[0_8px_15px_rgba(255,107,107,0.3)] hover:translate-y-[-3px] hover:shadow-[0_12px_25px_rgba(255,107,107,0.4)] transition-all duration-300 flex items-center justify-center gap-2">
            📞 Call
          </a>
          <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp bg-gradient-to-br from-[#4ECDC4] to-[#00B894] text-white px-4 py-3 rounded-xl font-bold text-[13px] text-center shadow-[0_8px_15px_rgba(78,205,196,0.3)] hover:translate-y-[-3px] hover:shadow-[0_12px_25px_rgba(78,205,196,0.4)] transition-all duration-300 flex items-center justify-center gap-2">
            💬 Chat
          </a>
      </div>
    </div>
  );
};
