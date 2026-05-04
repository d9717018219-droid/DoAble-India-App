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
  onJobClick: (job: JobLead) => void;
}

export default function HomeView({
  userName,
  userType,
  userCity,
  playTapSound,
  setFormType,
  setShowFormModal,
  setActiveTab,
  setShowFilterDrawer,
  getDynamicGreeting,
  featuredJobs,
  onJobClick
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
          className="relative w-full rounded-[24px] overflow-hidden p-4 shadow-md"
          style={{ background: '#575187' }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
               style={{
                 backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                 backgroundSize: "150px"
               }}>
          </div>

          <div className="relative z-10 max-w-[75%]">
            <div className="space-y-0.5 mb-2.5">
              <h2 className="text-[14px] font-[500] text-white/90 tracking-tight leading-tight">
                Discovery Made
              </h2>
              <h2 className="text-[20px] font-[800] text-[#FFD166] tracking-[-0.04em] leading-none">
                Simple & Live
              </h2>
            </div>
            
            <p className="text-white/80 text-[9px] font-[500] mb-3 leading-snug tracking-tight">
              Connect with elite educators and premium teaching opportunities instantly.
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="bg-[#FFD166] text-[#0F172A] px-2.5 py-1.5 rounded-full font-[800] text-[8px] flex items-center gap-1 active:scale-95 transition-all shadow-sm uppercase tracking-wide whitespace-nowrap"
              >
                <GraduationCap size={12} strokeWidth={2.5} /> Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-2.5 py-1.5 rounded-full font-[800] text-[8px] flex items-center gap-1 active:scale-95 transition-all uppercase tracking-wide whitespace-nowrap"
              >
                <Star size={12} strokeWidth={2.5} /> Free Trial
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
      <section className="px-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[#0F172A] tracking-tight">Explore Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[13px] font-[600] text-[#2563EB] tracking-tight">
            View all
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <ExploreCard icon={<Briefcase size={22} fill="currentColor" className="text-[#8B5CF6]" />} label="Jobs" sub="Find Openings" onClick={() => setActiveTab('jobs')} large />
          <ExploreCard icon={<GraduationCap size={22} fill="currentColor" className="text-[#10B981]" />} label="Tutors" sub="Expert Educators" onClick={() => setActiveTab('tutors')} large />
          <ExploreCard icon={<BookOpen size={22} fill="currentColor" className="text-[#F97316]" />} label="Subjects" sub="Popular Topics" onClick={() => setActiveTab('jobs')} large />
          <ExploreCard icon={<Calendar size={22} fill="currentColor" className="text-[#EC4899]" />} label="Trial" sub="Book Now" onClick={() => { setFormType('parent'); setShowFormModal(true); }} large />
          <div className="col-span-2">
            <ExploreCard icon={<MessageCircle size={22} fill="currentColor" className="text-[#3B82F6]" />} label="Help & Support" sub="24/7 Dedicated Assistance" onClick={() => setActiveTab('support')} horizontal />
          </div>
        </div>
      </section>

      {/* 4. Our Impact Section */}
      <section className="px-5">
        <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
          <div className="space-y-1 text-center">
            <h3 className="text-[20px] font-[800] text-[#0F172A] tracking-tight">Our Growing Impact</h3>
            <p className="text-[#64748B] text-[12px] font-[500] tracking-tight">Empowering abilities across inclusive India.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-y-7 gap-x-2">
            <ImpactStat icon={<Users size={18} className="text-[#10B981]" fill="currentColor" />} value="25K+" label="Students" label2="Impacted" />
            <ImpactStat icon={<User size={18} className="text-[#8B5CF6]" fill="currentColor" />} value="10K+" label="Expert" label2="Educators" />
            <ImpactStat icon={<School size={18} className="text-[#F97316]" fill="currentColor" />} value="500+" label="Partner" label2="Schools" />
            <div className="col-span-3 h-[1px] bg-slate-50" />
            <div className="col-span-3 flex justify-around">
               <ImpactStat icon={<MapPin size={18} className="text-[#EC4899]" fill="currentColor" />} value="100+" label="Cities" label2="In India" />
               <ImpactStat icon={<Star size={18} className="text-[#3B82F6]" fill="currentColor" />} value="4.8" label="Average" label2="Rating" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest Jobs Section */}
      <section className="px-5 space-y-4 pb-10">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold text-[#0F172A]">Latest Jobs</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[14px] font-semibold text-[#2563EB]">
            View all
          </button>
        </div>
        
        <div className="space-y-3">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job, idx) => (
              <motion.div 
                key={job['Order ID'] || idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onJobClick(job)}
                className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex items-center gap-4 active:scale-95 transition-all cursor-pointer group"
              >
                {/* Left Avatar/Emoji */}
                <div className="w-[54px] h-[54px] bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                   {job.Gender?.toLowerCase().includes('female') ? '👩‍🏫' : '👨‍🏫'}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[#10B981] text-[10px] font-bold uppercase tracking-wider">ID: {job['Order ID']}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-[14px] font-[800] text-[#0F172A] leading-tight truncate">
                    {job.subjects?.split(',')[0] || 'Tutor Required'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-slate-400" />
                      <span className="text-slate-500 text-[10px] font-medium truncate max-w-[100px]">{job.Locations?.split(',')[0] || job.City}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[#F97316] text-[10px] font-bold whitespace-nowrap">₹{formatCurrency(job.Fee || '0')}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
             <div className="py-10 text-center text-slate-400 text-sm italic bg-white rounded-3xl border border-dashed border-slate-200">
               No featured jobs available right now.
             </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ExploreCard({ icon, label, sub, onClick, large, horizontal }: { 
  icon: React.ReactNode; 
  label: string; 
  sub: string;
  onClick: () => void;
  large?: boolean;
  horizontal?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "bg-white rounded-[22px] shadow-sm border border-slate-100 active:scale-95 transition-all flex items-center justify-center",
        horizontal ? "p-5 flex-row gap-4 w-full" : "p-6 flex-col text-center gap-3 w-full"
      )}
    >
      <div className={cn(
        "rounded-2xl flex items-center justify-center",
        large ? "w-12 h-12 bg-slate-50" : "w-10 h-10 bg-slate-50"
      )}>
        {icon}
      </div>
      <div className={cn("min-w-0", horizontal ? "text-left" : "space-y-0.5")}>
        <span className={cn(
          "block font-[800] text-[#0F172A] tracking-tight",
          horizontal ? "text-[16px]" : "text-[15px]"
        )}>{label}</span>
        <span className={cn(
          "block text-[#64748B] font-[600] leading-none tracking-tight opacity-70",
          horizontal ? "text-[12px] mt-0.5" : "text-[11px]"
        )}>{sub}</span>
      </div>
      {horizontal && (
        <div className="ml-auto w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center">
           <ChevronRight size={14} className="text-slate-400" />
        </div>
      )}
    </button>
  );
}

function ImpactStat({ icon, value, label, label2 }: { icon: React.ReactNode; value: string; label: string; label2: string }) {
  return (
    <div className="flex flex-col items-center flex-1 text-center min-w-0">
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <span className="text-[16px] font-[800] text-[#0F172A] tracking-tighter whitespace-nowrap">{value}</span>
      </div>
      <div className="flex flex-col leading-[1.1]">
         <span className="text-[10px] font-[700] text-[#64748B] tracking-tight opacity-70 truncate">{label}</span>
         <span className="text-[10px] font-[700] text-[#64748B] tracking-tight opacity-70 truncate">{label2}</span>
      </div>
    </div>
  );
}
