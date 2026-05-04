import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  MapPin, 
  GraduationCap, 
  Star, 
  ChevronRight, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  Users,
  School,
  User,
  Search,
  ArrowRight,
  TrendingUp,
  Award,
  BookMarked,
  LifeBuoy
} from 'lucide-react';
import { JobLead, UserType } from '../types';
import { JobCard } from './JobCard';
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
  activeLeadsCount,
  activeTutorsCount,
  featuredJobs,
  playTapSound,
  setFormType,
  setShowFormModal,
  setActiveTab,
  getDynamicGreeting,
  setShowFilterDrawer
}: HomeViewProps) {
  const THEME_GREEN = "#1B7F5C";
  const THEME_YELLOW = "#F4C430";

  return (
    <div className="flex flex-col gap-7 pb-32 bg-[#F8FAFC]">
      {/* 1. Header & Greeting */}
      <section className="px-5 pt-6 flex justify-between items-end">
        <div className="space-y-0.5">
          <h1 className="text-[20px] font-[900] text-slate-900 tracking-tight">
            Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
          </h1>
          <p className="text-slate-500 text-[13px] font-medium whitespace-nowrap">
            Good morning! Let’s create impact today.
          </p>
        </div>
        <button 
          onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
          className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 text-slate-700 text-[12px] font-bold active:scale-95 transition-all mb-0.5"
        >
          <MapPin size={13} style={{ color: THEME_GREEN }} />
          {userCity}
        </button>
      </section>

      {/* 2. Main Banner (Green Gradient) */}
      <section className="px-5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-[28px] overflow-hidden p-7 flex flex-col justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${THEME_GREEN} 0%, #145E44 100%)` }}
        >
          <div className="relative z-10 space-y-4 max-w-[65%]">
            <div className="space-y-0">
              <h2 className="text-[24px] sm:text-[38px] font-[900] leading-tight tracking-tight text-white uppercase">
                Discovery Made
              </h2>
              <h2 className="text-[24px] sm:text-[38px] font-[900] leading-tight tracking-tight uppercase" style={{ color: THEME_YELLOW }}>
                Simple & Live
              </h2>
            </div>
            
            <div className="text-white/90 text-[11px] sm:text-[16px] font-semibold leading-[1.4] tracking-tight">
              Connect with elite educators<br/>
              and premium teaching opportunities
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="px-4 py-2.5 rounded-full font-black text-[10px] uppercase shadow-md active:scale-95 transition-all whitespace-nowrap"
                style={{ backgroundColor: THEME_YELLOW, color: '#1A202C' }}
              >
                Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border-2 border-white/30 px-4 py-2.5 rounded-full font-black text-[10px] uppercase active:scale-95 transition-all backdrop-blur-sm whitespace-nowrap"
              >
                Book Free Trial
              </button>
            </div>
          </div>

          {/* Student Photo */}
          <div className="absolute bottom-0 right-0 w-[42%] h-[92%] pointer-events-none flex items-end">
             <img 
              src="https://img.freepik.com/free-photo/young-indian-student-woman-holding-books-smiling-against-white-background_1150-13611.jpg" 
              alt="Student" 
              className="w-full h-full object-contain object-bottom mix-blend-lighten opacity-95 scale-110 origin-bottom"
            />
          </div>
        </motion.div>
      </section>

      {/* 3. Explore Section */}
      <section className="px-5 space-y-5">
        <h3 className="text-[17px] font-[900] text-slate-900 tracking-tight px-1">Explore Opportunities</h3>
        
        <div className="flex justify-between items-start">
          <ExploreItem icon={<Briefcase size={22} />} label="Jobs" color="#F3E8FF" iconColor="#9333EA" onClick={() => setActiveTab('jobs')} />
          <ExploreItem icon={<GraduationCap size={22} />} label="Tutors" color="#DCFCE7" iconColor="#16A34A" onClick={() => setActiveTab('tutors')} />
          <ExploreItem icon={<BookMarked size={22} />} label="Subjects" color="#FFEDD5" iconColor="#EA580C" onClick={() => setActiveTab('jobs')} />
          <ExploreItem icon={<Calendar size={22} />} label="Trial" color="#FCE7F3" iconColor="#DB2777" onClick={() => { setFormType('parent'); setShowFormModal(true); }} />
          <ExploreItem icon={<LifeBuoy size={22} />} label="Support" color="#DBEAFE" iconColor="#2563EB" onClick={() => setActiveTab('support')} />
        </div>
      </section>

      {/* 4. Impact Statistics - SINGLE ROW */}
      <section className="px-5">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex items-center justify-between">
           <ImpactStat value="25K+" label="Students" iconColor="text-emerald-500" />
           <div className="w-[1px] h-8 bg-slate-100" />
           <ImpactStat value="3K+" label="Tutors" iconColor="text-purple-500" />
           <div className="w-[1px] h-8 bg-slate-100" />
           <ImpactStat value="500+" label="Schools" iconColor="text-orange-500" />
           <div className="w-[1px] h-8 bg-slate-100" />
           <ImpactStat value="4.8" label="Rating" iconColor="text-blue-500" />
        </div>
      </section>

      {/* 5. Featured Jobs */}
      <section className="px-5 space-y-5 pb-10">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[17px] font-[900] text-slate-900 tracking-tight">Featured Jobs</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[12px] font-[800] opacity-80" style={{ color: THEME_GREEN }}>
            View all
          </button>
        </div>
        
        <div className="space-y-5">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={(job as any).id || job['Order ID']} job={job} />
            ))
          ) : (
            <div className="py-12 text-center bg-white rounded-[24px] border border-slate-50 shadow-sm px-6">
               <Search className="text-slate-200 mx-auto mb-3" size={28} />
               <p className="text-slate-400 text-[13px] font-medium">No active jobs found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ExploreItem({ icon, label, color, iconColor, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  color: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 transition-all active:scale-90"
    >
      <div 
        className="w-13 h-13 rounded-[18px] flex items-center justify-center shadow-sm border border-white"
        style={{ backgroundColor: color, color: iconColor }}
      >
        {icon}
      </div>
      <span className="text-[11px] font-[800] text-slate-600 leading-tight">{label}</span>
    </button>
  );
}

function ImpactStat({ value, label, iconColor }: { value: string; label: string; iconColor: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn("text-[14px] font-[900] text-slate-900", iconColor)}>{value}</span>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
    </div>
  );
}
