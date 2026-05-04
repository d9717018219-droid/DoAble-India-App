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
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[19px] font-bold text-[#0F172A] tracking-tight">
            Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-[#64748B] text-[11px] font-medium whitespace-nowrap">
              Good morning! Let's create impact today.
            </p>
            <button 
              onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
              className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200 text-[#2563EB] text-[10px] font-bold shadow-sm active:scale-95 transition-all"
            >
              <MapPin size={11} />
              {userCity || 'City'}
              <ChevronDown size={11} className="text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Banner */}
      <section className="px-5">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full rounded-[24px] overflow-hidden p-5 shadow-md"
          style={{ background: `linear-gradient(135deg, #0F6B4C 0%, #188661 100%)` }}
        >
          {/* Backdrop Image matching India gate */}
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
               style={{
                 backgroundImage: "url('https://img.freepik.com/free-vector/india-skyline-silhouette-with-flag-colors_23-2147814402.jpg')",
                 backgroundSize: "cover",
                 backgroundPosition: "center right"
               }}>
          </div>

          <div className="relative z-10 max-w-[70%]">
            <div className="space-y-0.5 mb-3">
              <h2 className="text-[22px] font-medium text-white tracking-tight leading-tight">
                Discovery Made
              </h2>
              <h2 className="text-[26px] font-black text-[#FFD166] tracking-tighter leading-none italic">
                Simple & Live
              </h2>
            </div>
            
            <p className="text-white/90 text-[10px] font-medium mt-1.5 mb-4 leading-snug">
              Connect with elite educators and premium teaching opportunities.
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="bg-[#FFD166] text-[#0F172A] px-2.5 py-1.5 rounded-full font-bold text-[9px] flex items-center gap-1 active:scale-95 transition-all whitespace-nowrap shadow-sm"
              >
                <GraduationCap size={12} strokeWidth={2.5} /> Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border border-white/40 px-2.5 py-1.5 rounded-full font-bold text-[9px] flex items-center gap-1 active:scale-95 transition-all whitespace-nowrap"
              >
                <Star size={12} strokeWidth={2.5} /> Book Free Trial
              </button>
            </div>
          </div>

          {/* Smiling Student Image (Mixed with gradient) */}
          <div className="absolute bottom-0 right-0 w-[40%] h-[95%] pointer-events-none flex items-end justify-end">
             <img 
              src="/icons/student.png" 
              alt="Student" 
              className="w-full h-full object-contain object-bottom mix-blend-screen opacity-90 brightness-110"
            />
          </div>
        </motion.div>
      </section>

      {/* 3. Explore Opportunities Section */}
      <section className="px-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[16px] font-bold text-[#0F172A]">Explore Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[13px] font-semibold text-[#2563EB]">
            View all
          </button>
        </div>
        
        <div className="flex justify-between gap-1.5">
          <ExploreCard icon={<Briefcase size={18} fill="currentColor" className="text-[#8B5CF6]" />} label="Jobs" sub="Openings" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<GraduationCap size={18} fill="currentColor" className="text-[#10B981]" />} label="Tutors" sub="Experts" onClick={() => setActiveTab('tutors')} />
          <ExploreCard icon={<BookOpen size={18} fill="currentColor" className="text-[#F97316]" />} label="Subjects" sub="Topics" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<Calendar size={18} fill="currentColor" className="text-[#EC4899]" />} label="Trial" sub="Book now" onClick={() => { setFormType('parent'); setShowFormModal(true); }} />
          <ExploreCard icon={<MessageCircle size={18} fill="currentColor" className="text-[#3B82F6]" />} label="Help" sub="Support" onClick={() => setActiveTab('support')} />
        </div>
      </section>

      {/* 4. Our Impact Section */}
      <section className="px-5">
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-[24px] p-5 space-y-5">
          <div className="space-y-0.5">
            <h3 className="text-[17px] font-bold text-[#0F172A]">Our Impact</h3>
            <p className="text-[#64748B] text-[13px]">Empowering abilities. Enabling inclusive India.</p>
          </div>
          
          <div className="flex items-center justify-between">
            <ImpactStat icon={<Users size={20} className="text-[#10B981]" fill="currentColor" />} value="25K+" label="Students" label2="Impacted" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat icon={<User size={20} className="text-[#8B5CF6]" fill="currentColor" />} value="3K+" label="Expert" label2="Educators" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat icon={<School size={20} className="text-[#F97316]" fill="currentColor" />} value="500+" label="Partner" label2="Schools" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat icon={<Star size={20} className="text-[#3B82F6]" />} value="4.8" label="Average" label2="Rating" />
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
      className="flex-shrink-0 bg-white p-3.5 rounded-[20px] flex flex-col items-center text-center gap-2 shadow-sm border border-slate-100 active:scale-95 transition-all w-full max-w-[100px]"
    >
      <div className="mb-1">
        {icon}
      </div>
      <div className="space-y-0.5">
        <span className="block text-[12px] font-bold text-[#0F172A]">{label}</span>
        <span className="block text-[10px] text-[#64748B] leading-[1.1]">{sub}</span>
      </div>
    </button>
  );
}

function ImpactStat({ icon, value, label, label2 }: { icon: React.ReactNode; value: string; label: string; label2: string }) {
  return (
    <div className="flex flex-col items-center flex-1 text-center">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[17px] font-bold text-[#0F172A]">{value}</span>
      </div>
      <div className="flex flex-col">
         <span className="text-[11px] text-[#64748B]">{label}</span>
         <span className="text-[11px] text-[#64748B]">{label2}</span>
      </div>
    </div>
  );
}
