import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  ChevronDown,
  Briefcase,
  GraduationCap,
  BookOpen,
  Calendar,
  MessageCircle,
  Users,
  User,
  School,
  Star,
  ChevronRight
} from 'lucide-react';
import { JobLead, UserType } from '../types';
import { cn } from '../utils';

interface HomeViewProps {
  userName: string | null;
  userType: UserType | null;
  userCity: string;
  activeLeadsCount: number;
  activeTutorsCount: number;
  featuredJobs: JobLead[];
  playTapSound: () => void;
  setFormType: (type: 'parent' | 'teacher') => void;
  setShowFormModal: (show: boolean) => void;
  setActiveTab: (tab: 'home' | 'jobs' | 'tutors' | 'alerts' | 'admin' | 'support') => void;
  getDynamicGreeting: () => string;
  setShowFilterDrawer: (show: boolean) => void;
}

export default function HomeView({
  userName,
  userType,
  userCity,
  playTapSound,
  setFormType,
  setShowFormModal,
  setActiveTab,
  setShowFilterDrawer
}: HomeViewProps) {
  return (
    <div className="flex flex-col gap-6 pb-32 bg-[#FAFBFF] font-sans">
      
      {/* 1. Greeting Section */}
      <section className="px-5 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <h1 className="text-[18px] font-[800] text-[#0F172A] tracking-tight whitespace-nowrap">
              Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
            </h1>
            <p className="text-[#0F172A] text-[10px] font-[500] opacity-70 tracking-tight">
              {getDynamicGreeting()} Let's create impact today.
            </p>
          </div>
          <button 
            onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
            className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-full border border-slate-100 text-[#0F172A] text-[9px] font-bold shadow-sm active:scale-95 transition-all shrink-0"
          >
            <MapPin size={11} className="text-[#2563EB]" />
            <span className="tracking-tight">{userCity || 'City'}</span>
            <ChevronDown size={10} className="text-slate-300" />
          </button>
        </div>
      </section>

      {/* 2. Main Banner */}
      <section className="px-5">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full rounded-[24px] overflow-hidden p-5 shadow-md"
          style={{ background: `linear-gradient(135deg, #0F6B4C 0%, #1A936F 100%)` }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
               style={{
                 backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                 backgroundSize: "150px"
               }}>
          </div>

          <div className="relative z-10 max-w-[75%]">
            <div className="space-y-0.5 mb-3">
              <h2 className="text-[16px] font-[500] text-white/90 tracking-tight leading-tight">
                Discovery Made
              </h2>
              <h2 className="text-[24px] font-[800] text-[#FFD166] tracking-[-0.04em] leading-none">
                Simple & Live
              </h2>
            </div>
            
            <p className="text-white/80 text-[10px] font-[500] mb-4 leading-snug tracking-tight">
              Connect with elite educators and premium teaching opportunities instantly.
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="bg-[#FFD166] text-[#0F172A] px-3 py-2 rounded-full font-[800] text-[9px] flex items-center gap-1 active:scale-95 transition-all shadow-sm uppercase tracking-wide whitespace-nowrap"
              >
                <GraduationCap size={13} strokeWidth={2.5} /> Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-3 py-2 rounded-full font-[800] text-[9px] flex items-center gap-1 active:scale-95 transition-all uppercase tracking-wide whitespace-nowrap"
              >
                <Star size={13} strokeWidth={2.5} /> Free Trial
              </button>
            </div>
          </div>

          {/* Decorative Icon Composition on the Right */}
          <div className="absolute right-[-10px] bottom-[-10px] w-[35%] h-[120%] pointer-events-none flex items-center justify-center">
             <div className="relative w-full h-full flex items-center justify-center">
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute p-4 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20"
                >
                   <GraduationCap size={42} className="text-[#FFD166] opacity-90" strokeWidth={1.5} />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/4 right-1/4"
                >
                   <Star size={20} className="text-[#FFD166] fill-[#FFD166]" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-1/4 left-1/4"
                >
                   <Users size={24} className="text-white" />
                </motion.div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Explore Opportunities Section */}
      <section className="px-5 space-y-2.5">
        <div className="flex justify-between items-center">
          <h3 className="text-[15px] font-[700] text-[#0F172A] tracking-tight">Explore Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[12px] font-[600] text-[#2563EB] tracking-tight">
            View all
          </button>
        </div>
        
        <div className="flex justify-between gap-1.5 overflow-hidden">
          <ExploreCard icon={<Briefcase size={14} fill="currentColor" className="text-[#8B5CF6]" />} label="Jobs" sub="Openings" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<GraduationCap size={14} fill="currentColor" className="text-[#10B981]" />} label="Tutors" sub="Experts" onClick={() => setActiveTab('tutors')} />
          <ExploreCard icon={<BookOpen size={14} fill="currentColor" className="text-[#F97316]" />} label="Subjects" sub="Topics" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<Calendar size={14} fill="currentColor" className="text-[#EC4899]" />} label="Trial" sub="Book now" onClick={() => { setFormType('parent'); setShowFormModal(true); }} />
          <ExploreCard icon={<MessageCircle size={14} fill="currentColor" className="text-[#3B82F6]" />} label="Help" sub="Support" onClick={() => setActiveTab('support')} />
        </div>
      </section>

      {/* 4. Our Impact Section */}
      <section className="px-5">
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-[20px] p-4 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-[14px] font-[700] text-[#0F172A] tracking-tight">Our Impact</h3>
            <p className="text-[#64748B] text-[11px] font-[500] tracking-tight">Empowering abilities. Enabling inclusive India.</p>
          </div>
          
          <div className="flex items-center justify-between">
            <ImpactStat icon={<Users size={16} className="text-[#10B981]" fill="currentColor" />} value="25K+" label="Students" label2="Impacted" />
            <div className="w-[1px] h-6 bg-slate-200" />
            <ImpactStat icon={<User size={16} className="text-[#8B5CF6]" fill="currentColor" />} value="10K+" label="Expert" label2="Educators" />
            <div className="w-[1px] h-6 bg-slate-200" />
            <ImpactStat icon={<School size={16} className="text-[#F97316]" fill="currentColor" />} value="500+" label="Partner" label2="Schools" />
            <div className="w-[1px] h-6 bg-slate-200" />
            <ImpactStat icon={<Star size={16} className="text-[#3B82F6]" />} value="4.8" label="Average" label2="Rating" />
          </div>
        </div>
      </section>

      {/* 5. Featured Opportunities Section */}
      <section className="px-5 space-y-4 pb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[17px] font-bold text-[#0F172A]">Featured Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[14px] font-semibold text-[#2563EB]">
            View all
          </button>
        </div>
        
        {/* Custom Job Card perfectly matching the image */}
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          {/* Left Avatar */}
          <div className="w-[60px] h-[60px] bg-[#E0E7FF] rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
             <img src="https://img.freepik.com/free-vector/woman-avatar-profile-round-icon_24640-14042.jpg" alt="Avatar" className="w-[90%] h-[90%] object-cover rounded-xl" />
          </div>
          
          {/* Right Content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#10B981] text-[11px] font-semibold">Teaching Job</span>
              <span className="bg-[#D1FAE5] text-[#10B981] px-2 py-0.5 rounded text-[10px] font-bold">New</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-[#0F172A] leading-tight">Mathematics Teacher</h4>
                <p className="text-[#64748B] text-[12px] mt-0.5">8th - 10th Grade</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
            
            <div className="flex items-center gap-3 pt-1.5">
              <div className="flex items-center gap-1">
                 <MapPin size={12} className="text-slate-400" />
                 <span className="text-slate-500 text-[10px]">Raj Nagar Extension, Ghaziabad</span>
              </div>
              <div className="w-[1px] h-3 bg-slate-300" />
              <div className="flex items-center gap-1">
                 <span className="text-[#F97316] text-[12px] font-bold">₹</span>
                 <span className="text-slate-500 text-[10px]">₹15,000 - ₹25,000 / Month</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExploreCard({ icon, label, sub, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  sub: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex-shrink-0 bg-white p-2 rounded-[16px] flex flex-col items-center text-center gap-1 shadow-sm border border-slate-100 active:scale-95 transition-all flex-1 min-w-0"
    >
      <div className="mb-0.5">
        {icon}
      </div>
      <div className="space-y-0.5 w-full overflow-hidden">
        <span className="block text-[10px] font-[700] text-[#0F172A] truncate w-full tracking-tight">{label}</span>
        <span className="block text-[8px] text-[#64748B] font-[600] leading-none truncate w-full tracking-tighter opacity-80 uppercase">{sub}</span>
      </div>
    </button>
  );
}

function ImpactStat({ icon, value, label, label2 }: { icon: React.ReactNode; value: string; label: string; label2: string }) {
  return (
    <div className="flex flex-col items-center flex-1 text-center">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-[15px] font-[800] text-[#0F172A] tracking-tighter">{value}</span>
      </div>
      <div className="flex flex-col leading-tight">
         <span className="text-[9px] font-[700] text-[#64748B] tracking-tight uppercase opacity-70">{label}</span>
         <span className="text-[9px] font-[700] text-[#64748B] tracking-tight uppercase opacity-70">{label2}</span>
      </div>
    </div>
  );
}
