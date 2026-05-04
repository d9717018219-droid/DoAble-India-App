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
  ArrowRight
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
    <div className="flex flex-col gap-8 pb-32 bg-[#F7F9FC]">
      {/* Greeting Section */}
      <section className="px-6 pt-6 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-[900] text-slate-900 leading-tight">
            Welcome, {userName || (userType === 'teacher' ? 'Educator' : 'Parent')} 👋
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Good morning! Let’s create impact today.
          </p>
        </div>
        <button 
          onClick={() => { playTapSound(); setShowFilterDrawer(true); }}
          className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 text-slate-700 text-sm font-bold active:scale-95 transition-all"
        >
          <MapPin size={16} className="text-[#006754]" />
          {userCity}
          <ChevronRight size={14} className="rotate-90 text-slate-400" />
        </button>
      </section>

      {/* Main Banner */}
      <section className="px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-[40px] overflow-hidden bg-[#006754] text-white p-8 flex flex-col justify-center shadow-2xl"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-[65%] space-y-5">
            <h2 className="text-3xl sm:text-5xl font-[900] leading-[1.1] tracking-tight">
              Discovery Made<br/>
              <span className="text-[#FFE66D]">Simple & Live</span>
            </h2>
            <p className="text-white/85 text-[12px] sm:text-lg font-medium leading-relaxed max-w-sm">
              Connect with expert tutors & premium teaching opportunities.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }}
                className="bg-[#FFE66D] text-slate-900 px-6 py-4 rounded-full font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:shadow-[#FFE66D]/20 active:scale-95 transition-all"
              >
                Become a Tutor
              </button>
              <button 
                onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }}
                className="bg-transparent text-white border-2 border-white/40 px-6 py-4 rounded-full font-black text-xs uppercase flex items-center gap-2 active:scale-95 transition-all backdrop-blur-sm"
              >
                Book Free Trial
              </button>
            </div>
          </div>

          {/* Student Image */}
          <div className="absolute bottom-0 right-0 w-[45%] h-[95%] pointer-events-none flex items-end">
             <img 
              src="https://img.freepik.com/free-photo/young-student-woman-with-backpack-holding-books-pointing-up_1150-13611.jpg" 
              alt="Student" 
              className="w-full h-full object-contain object-bottom mix-blend-lighten opacity-95"
            />
          </div>
        </motion.div>
      </section>

      {/* Explore Section */}
      <section className="px-6 space-y-5">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-black text-slate-900">Explore Opportunities</h3>
          <button 
            onClick={() => setActiveTab('jobs')}
            className="text-[#006754] text-sm font-black flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          <CategoryIcon 
            icon={<Briefcase size={24} />} 
            label="Jobs" 
            color="bg-purple-100 text-purple-600"
            onClick={() => setActiveTab('jobs')}
          />
          <CategoryIcon 
            icon={<GraduationCap size={24} />} 
            label="Tutors" 
            color="bg-emerald-100 text-emerald-600"
            onClick={() => setActiveTab('tutors')}
          />
          <CategoryIcon 
            icon={<BookOpen size={24} />} 
            label="Subjects" 
            color="bg-orange-100 text-orange-600"
            onClick={() => setActiveTab('jobs')}
          />
          <CategoryIcon 
            icon={<Calendar size={24} />} 
            label="Free Trial" 
            color="bg-pink-100 text-pink-600"
            onClick={() => { setFormType('parent'); setShowFormModal(true); }}
          />
          <CategoryIcon 
            icon={<MessageSquare size={24} />} 
            label="Support" 
            color="bg-blue-100 text-blue-600"
            onClick={() => setActiveTab('support')}
          />
        </div>
      </section>

      {/* Impact Section */}
      <section className="px-6">
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">Our Impact</h3>
            <p className="text-slate-500 text-sm font-medium">Empowering abilities. Enabling inclusive India.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <StatCard icon={<Users className="text-emerald-500" />} value="25K+" label="Students" />
            <StatCard icon={<GraduationCap className="text-purple-500" />} value="3K+" label="Expert Tutors" />
            <StatCard icon={<School className="text-orange-500" />} value="500+" label="Partner Schools" />
            <StatCard icon={<Star className="text-blue-500" />} value="4.8" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="px-6 space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-black text-slate-900">Featured Jobs</h3>
          <button 
            onClick={() => setActiveTab('jobs')}
            className="text-[#006754] text-sm font-black flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="space-y-6">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={(job as any).id || job['Order ID']} job={job} />
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="text-slate-300" size={24} />
               </div>
               <p className="text-slate-400 text-sm font-medium italic">Finding premium opportunities for you...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryIcon({ icon, label, color, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  color: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center text-center gap-3 group transition-all active:scale-95"
    >
      <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all", color)}>
        {icon}
      </div>
      <span className="text-[11px] font-black text-slate-700 leading-tight">{label}</span>
    </button>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 bg-[#F8FBFA] p-4 rounded-3xl border border-slate-50">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-slate-900">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-[900] text-slate-900 leading-none">{value}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</span>
      </div>
    </div>
  );
}
