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
  Award
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
    <div className="flex flex-col gap-8 pb-32 bg-[#F8FAFC]">
      {/* 1. Header & Greeting */}
      <section className="px-6 pt-6 flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-[22px] font-[900] text-slate-900 leading-tight tracking-tight">
            Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
          </h1>
          <p className="text-slate-500 text-[14px] font-medium">
            Good morning! Let’s create impact today.
          </p>
        </div>
        <button 
          onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
          className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full shadow-sm border border-slate-100 text-slate-700 text-[13px] font-bold active:scale-95 transition-all"
        >
          <MapPin size={14} style={{ color: THEME_GREEN }} />
          {userCity}
        </button>
      </section>

      {/* 2. Main Banner (Green Gradient) */}
      <section className="px-5">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-[32px] overflow-hidden p-8 flex flex-col justify-center shadow-xl border border-white/10"
          style={{ background: `linear-gradient(135deg, ${THEME_GREEN} 0%, #145E44 100%)` }}
        >
          {/* Subtle Abstract Background Element */}
          <div className="absolute top-0 right-0 w-[60%] h-full opacity-10 pointer-events-none overflow-hidden">
             <div className="w-[150%] h-[150%] border-[40px] border-white rounded-full -mr-[50%] -mt-[20%]" />
          </div>
          
          <div className="relative z-10 max-w-[62%] space-y-4">
            <h2 className="text-[26px] sm:text-[42px] font-[900] leading-[1.15] tracking-tight text-white">
              Discovery Made<br/>
              <span style={{ color: THEME_YELLOW }}>Simple & Live</span>
            </h2>
            <p className="text-white/85 text-[13px] sm:text-[18px] font-medium leading-relaxed">
              Connect with expert tutors and premium teaching opportunities
            </p>
            
            <div className="flex flex-wrap gap-3 pt-3">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="px-6 py-3.5 rounded-full font-black text-[12px] uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center"
                style={{ backgroundColor: THEME_YELLOW, color: '#1A202C' }}
              >
                Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border-2 border-white/30 px-6 py-3.5 rounded-full font-black text-[12px] uppercase active:scale-95 transition-all backdrop-blur-sm"
              >
                Book Free Trial
              </button>
            </div>
          </div>

          {/* Clean Student Illustration/Photo */}
          <div className="absolute bottom-0 right-0 w-[42%] h-[95%] pointer-events-none flex items-end">
             <img 
              src="https://img.freepik.com/free-photo/young-indian-student-woman-holding-books-smiling-against-white-background_1150-13611.jpg" 
              alt="Student" 
              className="w-full h-full object-contain object-bottom mix-blend-lighten opacity-90 scale-110 origin-bottom"
            />
          </div>
        </motion.div>
      </section>

      {/* 3. Explore Section */}
      <section className="px-6 space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[19px] font-[900] text-slate-900 tracking-tight">Explore Opportunities</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[13px] font-[800] flex items-center gap-1 opacity-80" style={{ color: THEME_GREEN }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex justify-between items-start gap-2">
          <ExploreCard icon={<Briefcase size={22} />} label="Jobs" color="#F3E8FF" iconColor="#9333EA" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<GraduationCap size={22} />} label="Tutors" color="#DCFCE7" iconColor="#16A34A" onClick={() => setActiveTab('tutors')} />
          <ExploreCard icon={<BookOpen size={22} />} label="Subjects" color="#FFEDD5" iconColor="#EA580C" onClick={() => setActiveTab('jobs')} />
          <ExploreCard icon={<Star size={22} />} label="Trial" color="#FCE7F3" iconColor="#DB2777" onClick={() => { setFormType('parent'); setShowFormModal(true); }} />
          <ExploreCard icon={<MessageSquare size={22} />} label="Support" color="#DBEAFE" iconColor="#2563EB" onClick={() => setActiveTab('support')} />
        </div>
      </section>

      {/* 4. Impact Statistics */}
      <section className="px-6">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-8">
           <div className="flex justify-between items-center">
             <div className="space-y-1">
                <h3 className="text-[18px] font-[900] text-slate-900 tracking-tight">Our Impact</h3>
                <p className="text-slate-400 text-[12px] font-semibold">Empowering inclusive education in India.</p>
             </div>
             <div className="bg-[#1B7F5C]/10 p-2.5 rounded-2xl">
               <TrendingUp size={20} style={{ color: THEME_GREEN }} />
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Users size={20} /></div>
               <div className="flex flex-col"><span className="text-[17px] font-[900] text-slate-900">25K+</span><span className="text-[10px] font-bold text-slate-400 uppercase">Students</span></div>
             </div>
             <div className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600"><Award size={20} /></div>
               <div className="flex flex-col"><span className="text-[17px] font-[900] text-slate-900">3K+</span><span className="text-[10px] font-bold text-slate-400 uppercase">Tutors</span></div>
             </div>
             <div className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600"><School size={20} /></div>
               <div className="flex flex-col"><span className="text-[17px] font-[900] text-slate-900">500+</span><span className="text-[10px] font-bold text-slate-400 uppercase">Schools</span></div>
             </div>
             <div className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600"><Star size={20} /></div>
               <div className="flex flex-col"><span className="text-[17px] font-[900] text-slate-900">4.8</span><span className="text-[10px] font-bold text-slate-400 uppercase">Rating</span></div>
             </div>
           </div>
        </div>
      </section>

      {/* 5. Featured Jobs */}
      <section className="px-6 space-y-6 pb-12">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[19px] font-[900] text-slate-900 tracking-tight">Featured Jobs</h3>
          <button onClick={() => setActiveTab('jobs')} className="text-[13px] font-[800] flex items-center gap-1 opacity-80" style={{ color: THEME_GREEN }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="space-y-6">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={(job as any).id || job['Order ID']} job={job} />
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
               <Search className="text-slate-200 mx-auto mb-3" size={32} />
               <p className="text-slate-400 text-[14px] font-medium italic">Discovering new opportunities...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ExploreCard({ icon, label, color, iconColor, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  color: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-3 transition-all active:scale-90 group"
    >
      <div 
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all border border-white"
        style={{ backgroundColor: color, color: iconColor }}
      >
        {icon}
      </div>
      <span className="text-[12px] font-[800] text-slate-700 leading-tight">{label}</span>
    </button>
  );
}
