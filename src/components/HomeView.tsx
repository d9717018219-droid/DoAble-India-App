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
  Search,
  BookMarked,
  LayoutGrid
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
    <div className="flex flex-col gap-6 pb-32 bg-[#F8F9FB] font-sans">
      
      {/* 1. Greeting Section */}
      <section className="px-6 pt-6">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h1 className="text-[20px] font-medium text-slate-900 tracking-tight">
              Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
            </h1>
            <p className="text-slate-500 text-[13px] font-medium whitespace-nowrap">
              Good morning! Let’s create impact today.
            </p>
          </div>
          <button 
            onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
            className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-slate-100 text-slate-700 text-[12px] font-semibold active:scale-95 transition-all"
          >
            <MapPin size={14} style={{ color: THEME_GREEN }} />
            Ghaziabad
          </button>
        </div>
      </section>

      {/* 2. Main Banner (Strict Design) */}
      <section className="px-5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-[24px] overflow-hidden p-7 flex flex-col justify-center shadow-lg border border-white/10"
          style={{ background: `linear-gradient(135deg, ${THEME_GREEN} 0%, #125A41 100%)` }}
        >
          {/* Subtle India Theme Background Decor */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
            <svg viewBox="0 0 800 400" className="w-full h-full object-cover">
               <path d="M0 400 L0 320 Q100 280 200 320 T400 320 T600 320 T800 320 L800 400 Z" fill="white" />
               <path d="M150 320 L170 240 L190 320 Z" fill="white" />
               <path d="M350 320 L400 180 L450 320 Z" fill="white" />
            </svg>
          </div>

          <div className="relative z-10 max-w-[65%] space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-[26px] sm:text-[42px] font-medium leading-tight text-white tracking-tight uppercase">
                Discovery Made
              </h2>
              <h2 className="text-[26px] sm:text-[42px] font-medium leading-tight tracking-tight uppercase" style={{ color: THEME_YELLOW }}>
                Simple & Live
              </h2>
            </div>
            
            <div className="text-white/90 text-[12px] sm:text-[18px] font-medium leading-[1.4] tracking-tight">
              Connect with elite educators<br/>
              and premium teaching opportunities
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="px-5 py-3 rounded-full font-bold text-[11px] uppercase shadow-xl active:scale-95 transition-all"
                style={{ backgroundColor: THEME_YELLOW, color: '#1A202C' }}
              >
                Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border-2 border-white/30 px-5 py-3 rounded-full font-bold text-[11px] uppercase active:scale-95 transition-all backdrop-blur-sm"
              >
                Book Free Trial
              </button>
            </div>
          </div>

          {/* Student Illustration */}
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
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[18px] font-medium text-slate-900 tracking-tight">Explore Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[12px] font-bold opacity-60 flex items-center gap-0.5">
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
          <ExploreCard icon={<Briefcase size={22} />} label="Jobs" sub="New openings" color="#F3E8FF" iconColor="#9333EA" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<GraduationCap size={22} />} label="Tutors" sub="Find expert tutors" color="#DCFCE7" iconColor="#16A34A" onClick={() => setActiveTab('tutors')} />
          <ExploreCard icon={<BookMarked size={22} />} label="Subjects" sub="Explore topics" color="#FFEDD5" iconColor="#EA580C" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<Calendar size={22} />} label="Free Trial" sub="Book a session" color="#FCE7F3" iconColor="#DB2777" onClick={() => { setFormType('parent'); setShowFormModal(true); }} />
          <ExploreCard icon={<MessageSquare size={22} />} label="Support" sub="Get help" color="#DBEAFE" iconColor="#2563EB" onClick={() => setActiveTab('support')} />
        </div>
      </section>

      {/* 4. Impact Statistics - STRICT SINGLE ROW */}
      <section className="px-6">
        <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex items-center justify-between">
           <ImpactStat value="25K+" label="Students Impacted" />
           <div className="w-[1px] h-8 bg-slate-100 mx-1" />
           <ImpactStat value="3K+" label="Expert Educators" />
           <div className="w-[1px] h-8 bg-slate-100 mx-1" />
           <ImpactStat value="500+" label="Partner Schools" />
           <div className="w-[1px] h-8 bg-slate-100 mx-1" />
           <ImpactStat value="4.8" label="Average Rating" />
        </div>
      </section>

      {/* 5. Featured Opportunities Section */}
      <section className="px-6 space-y-6 pb-12">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[18px] font-medium text-slate-900 tracking-tight">Featured Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[12px] font-bold opacity-60">
            View all
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
               Notes: "New opportunity for experienced Mathematics teacher.",
               Status: "Active",
               "Order ID": "MOCK-MATH-101",
               "Updated Time": "Today",
               Gender: "Any",
               Board: "CBSE"
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
      className="flex-shrink-0 bg-white p-3.5 rounded-[20px] flex flex-col items-center text-center gap-2.5 shadow-sm border border-slate-50 active:scale-95 transition-all w-[105px]"
    >
      <div 
        className="w-11 h-11 rounded-[15px] flex items-center justify-center shadow-sm"
        style={{ backgroundColor: color, color: iconColor }}
      >
        {icon}
      </div>
      <div className="space-y-0.5">
        <span className="block text-[11.5px] font-bold text-slate-800 leading-tight">{label}</span>
        <span className="block text-[8px] text-slate-400 font-bold leading-tight uppercase tracking-tight">{sub}</span>
      </div>
    </button>
  );
}

function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 text-center">
      <span className="text-[14px] font-[900] text-slate-900 leading-none">{value}</span>
      <span className="text-[7.5px] font-black text-slate-400 uppercase leading-tight max-w-[50px]">{label}</span>
    </div>
  );
}
