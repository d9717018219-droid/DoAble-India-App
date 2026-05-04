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
  Heart
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
    <div className="flex flex-col gap-6 pb-24 bg-white">
      {/* Welcome Section */}
      <section className="px-5 pt-4 flex justify-between items-start">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
          </h1>
          <p className="text-slate-500 text-[13px] font-medium">
            Good morning! Let's create impact today.
          </p>
        </div>
        <button 
          onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-100 text-slate-600 text-[12px] font-bold"
        >
          <MapPin size={14} className="text-blue-500" />
          {userCity}
          <ChevronRight size={14} className="rotate-90 text-slate-400" />
        </button>
      </section>

      {/* Hero Banner */}
      <section className="px-5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-[16/10] rounded-[32px] overflow-hidden bg-[#006754] text-white p-6 sm:p-10"
        >
          {/* Circular Background Decor */}
          <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-[70%] h-[120%] opacity-30 pointer-events-none">
            <div className="w-full h-full rounded-full border-[40px] border-white/20 blur-sm" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-center space-y-4 max-w-[65%]">
            <h2 className="text-2xl sm:text-4xl font-black leading-[1.2] tracking-tight">
              Discovery Made<br/>
              <span className="text-[#FFE66D]">Simple & Live</span>
            </h2>
            <p className="text-white/90 text-[11px] sm:text-sm font-medium leading-relaxed">
              Connect with elite educators and premium teaching opportunities.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="bg-[#FFE66D] text-slate-900 px-5 py-3 rounded-full font-black text-[11px] uppercase flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <GraduationCap size={16} strokeWidth={2.5} /> Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border-2 border-white/30 px-5 py-3 rounded-full font-black text-[11px] uppercase flex items-center gap-2 shadow-lg active:scale-95 transition-all backdrop-blur-sm"
              >
                <Star size={16} strokeWidth={2.5} className="text-[#FFE66D]" /> Book Free Trial
              </button>
            </div>
          </div>

          {/* Teacher Placeholder */}
          <div className="absolute bottom-0 right-0 w-[45%] h-[90%] pointer-events-none">
             <img 
              src="https://img.freepik.com/free-photo/happy-young-indian-woman-pointing-up-isolated-white-background_1262-10874.jpg" 
              alt="Educator" 
              className="w-full h-full object-contain object-bottom mix-blend-lighten opacity-90"
            />
          </div>
        </motion.div>
      </section>

      {/* Explore Opportunities */}
      <section className="px-5 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[17px] font-black text-slate-900">Explore Opportunities</h3>
          <button 
            onClick={() => setActiveTab('jobs')}
            className="text-primary text-[13px] font-black"
          >
            View all
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          <CategoryCard 
            icon={<Briefcase size={22} />} 
            label="Jobs" 
            sublabel="New openings" 
            iconColor="text-purple-600"
            onClick={() => setActiveTab('jobs')}
          />
          <CategoryCard 
            icon={<GraduationCap size={22} />} 
            label="Tutors" 
            sublabel="Find expert" 
            iconColor="text-green-600"
            onClick={() => setActiveTab('tutors')}
          />
          <CategoryCard 
            icon={<BookOpen size={22} />} 
            label="Subjects" 
            sublabel="Explore topics" 
            iconColor="text-orange-600"
            onClick={() => setActiveTab('jobs')}
          />
          <CategoryCard 
            icon={<Calendar size={22} />} 
            label="Free Trial" 
            sublabel="Book a session" 
            iconColor="text-pink-600"
            onClick={() => { setFormType('parent'); setShowFormModal(true); }}
          />
          <CategoryCard 
            icon={<MessageSquare size={22} />} 
            label="Support" 
            sublabel="Get help" 
            iconColor="text-blue-600"
            onClick={() => setActiveTab('support')}
          />
        </div>
      </section>

      {/* Our Impact */}
      <section className="px-5">
        <div className="bg-[#F8FBFA] border border-slate-100 rounded-[28px] p-6 space-y-6">
          <div className="space-y-0.5">
            <h3 className="text-[17px] font-black text-slate-900">Our Impact</h3>
            <p className="text-slate-500 text-[12px] font-medium">Empowering abilities. Enabling inclusive India.</p>
          </div>
          
          <div className="flex items-center justify-between">
            <ImpactStat icon={<Users size={20} className="text-green-600" />} value="25K+" label="Students" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat icon={<User size={20} className="text-purple-600" />} value="3K+" label="Expert" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat icon={<School size={20} className="text-orange-600" />} value="500+" label="Partner" />
            <div className="w-[1px] h-10 bg-slate-200" />
            <ImpactStat icon={<Star size={20} className="text-blue-600" />} value="4.8" label="Rating" />
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="px-5 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[17px] font-black text-slate-900">Featured Opportunities</h3>
          <button 
            onClick={() => setActiveTab('jobs')}
            className="text-primary text-[13px] font-black"
          >
            View all
          </button>
        </div>
        
        <div className="space-y-4">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={(job as any).id || job['Order ID']} job={job} />
            ))
          ) : (
            <div className="py-10 text-center text-slate-400 text-[13px] font-medium italic">
              Loading amazing opportunities...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ icon, label, sublabel, iconColor, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel: string; 
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-2 rounded-[20px] flex flex-col items-center text-center gap-2 shadow-sm border border-slate-50 hover:shadow-md transition-all active:scale-95"
    >
      <div className={cn("w-10 h-10 flex items-center justify-center", iconColor)}>
        {icon}
      </div>
      <div className="space-y-0.5">
        <span className="block text-[11px] font-black text-slate-900 leading-tight">{label}</span>
        <p className="text-[8px] text-slate-400 font-medium leading-tight line-clamp-2">{sublabel}</p>
      </div>
    </button>
  );
}

function ImpactStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[15px] font-black text-slate-900">{value}</span>
      </div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

