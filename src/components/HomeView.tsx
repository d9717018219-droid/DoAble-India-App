import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  ChevronRight, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  Users,
  School,
  Star,
  User
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
  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Welcome Section */}
      <section className="px-4 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {getDynamicGreeting()} Let's create impact today.
          </p>
        </div>
        <button 
          onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-100 text-slate-600 text-sm font-semibold"
        >
          <MapPin size={16} className="text-primary" />
          {userCity}
          <ChevronRight size={14} className="rotate-90" />
        </button>
      </section>

      {/* Hero Banner */}
      <section className="px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[32px] overflow-hidden bg-[#004D40] text-white p-6 sm:p-10 flex flex-col justify-center"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            {/* SVG or Image placeholder for Indian landmarks */}
            <img 
              src="https://images.unsplash.com/photo-1524492707947-519a51609c18?auto=format&fit=crop&q=80&w=800" 
              alt="Background Decor" 
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          
          <div className="relative z-10 max-w-[60%] space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black leading-tight">
              Discovery Made<br/>
              <span className="text-[#FFE66D]">Simple & Live</span>
            </h2>
            <p className="text-white/80 text-xs sm:text-base font-medium max-w-xs">
              Connect with elite educators and premium teaching opportunities.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="bg-[#FFE66D] text-slate-900 px-4 py-2.5 rounded-full font-bold text-xs uppercase flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <GraduationCap size={16} /> Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border-2 border-white/30 px-4 py-2.5 rounded-full font-bold text-xs uppercase flex items-center gap-2 shadow-lg active:scale-95 transition-all backdrop-blur-sm"
              >
                <Sparkles size={16} className="text-[#FFE66D]" /> Book Free Trial
              </button>
            </div>
          </div>

          {/* Teacher Image */}
          <div className="absolute bottom-0 right-4 w-[40%] h-[90%] pointer-events-none">
             <img 
              src="https://images.unsplash.com/photo-1544717297-fa95b3ee93c3?auto=format&fit=crop&q=80&w=400" 
              alt="Educator" 
              className="w-full h-full object-contain object-bottom"
            />
          </div>
        </motion.div>
      </section>

      {/* Explore Opportunities */}
      <section className="px-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Explore Opportunities</h3>
          <button 
            onClick={() => setActiveTab('jobs')}
            className="text-primary text-sm font-bold flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          <CategoryIcon 
            icon={<Briefcase size={24} />} 
            label="Jobs" 
            sublabel="New openings" 
            color="bg-purple-100 text-purple-600"
            onClick={() => setActiveTab('jobs')}
          />
          <CategoryIcon 
            icon={<GraduationCap size={24} />} 
            label="Tutors" 
            sublabel="Find expert" 
            color="bg-green-100 text-green-600"
            onClick={() => setActiveTab('tutors')}
          />
          <CategoryIcon 
            icon={<BookOpen size={24} />} 
            label="Subjects" 
            sublabel="Explore topics" 
            color="bg-orange-100 text-orange-600"
            onClick={() => setActiveTab('jobs')}
          />
          <CategoryIcon 
            icon={<Calendar size={24} />} 
            label="Free Trial" 
            sublabel="Book a session" 
            color="bg-pink-100 text-pink-600"
            onClick={() => { setFormType('parent'); setShowFormModal(true); }}
          />
          <CategoryIcon 
            icon={<MessageSquare size={24} />} 
            label="Support" 
            sublabel="Get help" 
            color="bg-blue-100 text-blue-600"
            onClick={() => setActiveTab('support')}
          />
        </div>
      </section>

      {/* Our Impact */}
      <section className="px-4">
        <div className="bg-slate-50 rounded-[32px] p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Our Impact</h3>
            <p className="text-slate-500 text-xs">Empowering abilities. Enabling inclusive India.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ImpactStat icon={<Users className="text-green-500" />} value="25K+" label="Students Impacted" />
            <ImpactStat icon={<User className="text-purple-500" />} value="3K+" label="Expert Educators" />
            <ImpactStat icon={<School className="text-orange-500" />} value="500+" label="Partner Schools" />
            <ImpactStat icon={<Star className="text-blue-500" />} value="4.8" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="px-4 space-y-4 pb-20">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Featured Opportunities</h3>
          <button 
            onClick={() => setActiveTab('jobs')}
            className="text-primary text-sm font-bold flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="space-y-4">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={(job as any).id || job['Order ID']} job={job} />
            ))
          ) : (
            <div className="py-10 text-center text-slate-400 text-sm italic">
              Loading amazing opportunities...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryIcon({ icon, label, sublabel, color, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel: string; 
  color: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center text-center gap-2 group transition-all active:scale-95"
    >
      <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all", color)}>
        {icon}
      </div>
      <div className="space-y-0.5">
        <span className="block text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">{label}</span>
        <span className="block text-[9px] text-slate-400 leading-tight hidden sm:block">{sublabel}</span>
      </div>
    </button>
  );
}

function ImpactStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <span className="block text-base font-black text-slate-900">{value}</span>
        <span className="block text-[10px] font-medium text-slate-500 leading-tight">{label}</span>
      </div>
    </div>
  );
}
