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
    <div className="flex flex-col gap-8 pb-32 bg-white">
      {/* 1. Header Greeting Section */}
      <section className="px-6 pt-6 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
            Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
          </h1>
          <p className="text-slate-500 text-[14px] font-medium">
            Good morning! Let’s create impact today.
          </p>
        </div>
        <button 
          onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
          className="flex items-center gap-1.5 bg-slate-50 px-4 py-2 rounded-full text-slate-700 text-[13px] font-bold active:scale-95 transition-all"
        >
          <MapPin size={14} style={{ color: THEME_GREEN }} />
          {userCity}
          <ChevronRight size={14} className="rotate-90 text-slate-400" />
        </button>
      </section>

      {/* 2. Main Banner (Dribbble Quality) */}
      <section className="px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-[32px] overflow-hidden p-8 flex flex-col justify-center shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${THEME_GREEN} 0%, #115E42 100%)` }}
        >
          {/* Subtle Silhouette Background Decor */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 800 400" className="w-full h-full object-cover">
               <path d="M0 400 L0 300 Q100 250 200 300 T400 300 T600 300 T800 300 L800 400 Z" fill="white" />
               <path d="M100 300 L120 200 L140 300 Z" fill="white" />
               <path d="M300 300 L350 150 L400 300 Z" fill="white" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-[65%] space-y-5">
            <div className="space-y-1">
              <h2 className="text-[28px] sm:text-[42px] font-bold leading-tight text-white tracking-tight">
                Discovery Made
              </h2>
              <h2 className="text-[28px] sm:text-[42px] font-bold leading-tight tracking-tight" style={{ color: THEME_YELLOW }}>
                Simple & Live
              </h2>
            </div>
            
            <p className="text-white/90 text-[13px] sm:text-[18px] font-medium leading-relaxed max-w-[90%]">
              Connect with elite educators and premium teaching opportunities.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="px-6 py-3.5 rounded-full font-bold text-[12px] uppercase shadow-lg active:scale-95 transition-all"
                style={{ backgroundColor: THEME_YELLOW, color: '#1A202C' }}
              >
                Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border-2 border-white/40 px-6 py-3.5 rounded-full font-bold text-[12px] uppercase active:scale-95 transition-all backdrop-blur-sm"
              >
                Book Free Trial
              </button>
            </div>
          </div>

          {/* Realistic Student Image */}
          <div className="absolute bottom-0 right-0 w-[45%] h-[95%] pointer-events-none flex items-end">
             <img 
              src="https://img.freepik.com/free-photo/young-indian-student-woman-holding-books-smiling-against-white-background_1150-13611.jpg" 
              alt="Student" 
              className="w-full h-full object-contain object-bottom mix-blend-lighten opacity-95 scale-110 origin-bottom"
            />
          </div>
        </motion.div>
      </section>

      {/* 3. Explore Opportunities Section */}
      <section className="px-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">Explore Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[13px] font-bold flex items-center gap-1 text-slate-400">
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex justify-between gap-3 overflow-x-auto pb-4 no-scrollbar">
          <ExploreCard icon={<Briefcase size={22} />} label="Jobs" sub="New openings" color="#F3E8FF" iconColor="#9333EA" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<GraduationCap size={22} />} label="Tutors" sub="Find expert" color="#DCFCE7" iconColor="#16A34A" onClick={() => setActiveTab('tutors')} />
          <ExploreCard icon={<BookMarked size={22} />} label="Subjects" sub="Explore topics" color="#FFEDD5" iconColor="#EA580C" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<Calendar size={22} />} label="Trial" sub="Book session" color="#FCE7F3" iconColor="#DB2777" onClick={() => { setFormType('parent'); setShowFormModal(true); }} />
          <ExploreCard icon={<MessageSquare size={22} />} label="Support" sub="Get help" color="#DBEAFE" iconColor="#2563EB" onClick={() => setActiveTab('support')} />
        </div>
      </section>

      {/* 4. Our Impact Section */}
      <section className="px-6">
        <div className="bg-slate-50 rounded-[32px] p-8 space-y-8 border border-slate-100/50">
          <div className="space-y-1">
            <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">Our Impact</h3>
            <p className="text-slate-500 text-[13px] font-medium leading-relaxed">Empowering abilities. Enabling inclusive India.</p>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <ImpactStat value="25K+" label="Students Impacted" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat value="3K+" label="Expert Educators" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat value="500+" label="Partner Schools" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat value="4.8" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* 5. Featured Opportunities */}
      <section className="px-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">Featured Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[13px] font-bold flex items-center gap-1 text-slate-400">
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="space-y-6">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={(job as any).id || job['Order ID']} job={job} />
            ))
          ) : (
             <JobCard job={{
               Name: "Mathematics Teacher",
               Class: "8th-10th Grade",
               City: "Ghaziabad",
               Locations: "Raj Nagar Extension, Ghaziabad",
               Fee: "15000",
               subjects: "Mathematics",
               Notes: "New opportunity for experienced tutors.",
               Status: "Active",
               "Order ID": "MOCK-101",
               "Updated Time": "Today"
             } as any} />
          )}
        </div>
      </section>
    </div>
  );
}

function ExploreCard({ icon, label, sub, color, iconColor, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  sub: string;
  color: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex-shrink-0 bg-white p-4 rounded-[28px] flex flex-col items-center text-center gap-3 shadow-sm border border-slate-50 active:scale-95 transition-all w-[110px]"
    >
      <div 
        className="w-12 h-12 rounded-[20px] flex items-center justify-center shadow-sm"
        style={{ backgroundColor: color, color: iconColor }}
      >
        {icon}
      </div>
      <div className="space-y-0.5">
        <span className="block text-[12px] font-bold text-slate-900 leading-tight">{label}</span>
        <span className="block text-[9px] text-slate-400 font-medium leading-tight">{sub}</span>
      </div>
    </button>
  );
}

function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 text-center">
      <span className="text-[16px] font-bold text-slate-900">{value}</span>
      <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight max-w-[70px]">{label}</span>
    </div>
  );
}
