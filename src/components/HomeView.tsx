import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  GraduationCap,
  ChevronRight,
  Briefcase,
  BookMarked,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { JobLead, UserType } from '../types';
import { JobCard } from './JobCard';

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
  setActiveTab: (tab: any) => void;
  setShowFilterDrawer: (show: boolean) => void;
}

export default function HomeView({
  userName,
  userType,
  userCity,
  featuredJobs,
  playTapSound,
  setFormType,
  setShowFormModal,
  setActiveTab,
  setShowFilterDrawer
}: HomeViewProps) {

  const GREEN = "#1B7F5C";
  const YELLOW = "#F4C430";

  return (
    <div className="flex flex-col gap-6 pb-32 bg-[#F8F9FB]">

      {/* 🔹 HEADER TEXT */}
      <section className="px-6 pt-6">
        <div className="flex justify-between items-center">

          <div>
            <h1 className="text-[20px] font-semibold text-slate-900 flex items-center gap-1 whitespace-nowrap">
              Welcome, {userName || "Educator"} <span>👋</span>
            </h1>

            <p className="text-[13px] text-slate-500 whitespace-nowrap">
              Good morning! Let’s create impact today.
            </p>
          </div>

          <button
            onClick={() => setShowFilterDrawer(true)}
            className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border text-[12px]"
          >
            <MapPin size={14} color={GREEN} />
            Ghaziabad
          </button>

        </div>
      </section>

      {/* 🔹 MAIN BANNER */}
      <section className="px-5">
        <motion.div
          className="relative rounded-[24px] p-6 flex items-center justify-between overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${GREEN}, #125A41)`
          }}
        >

          {/* LEFT CONTENT */}
          <div className="z-10 max-w-[58%] space-y-3">

            <h2 className="text-[26px] font-semibold text-white whitespace-nowrap">
              Discovery Made
            </h2>

            <h2 className="text-[26px] font-semibold whitespace-nowrap"
                style={{ color: YELLOW }}>
              Simple & Live
            </h2>

            <div className="text-white/90 text-[13px]">
              <div>Connect with elite educators</div>
              <div>and premium teaching opportunities</div>
            </div>

            <div className="flex gap-2 pt-3 flex-wrap">

              <button
                onClick={() => {
                  setFormType('teacher');
                  setShowFormModal(true);
                }}
                className="px-4 py-2.5 rounded-full text-[10px] font-bold"
                style={{ background: YELLOW }}
              >
                Become a Tutor
              </button>

              <button
                onClick={() => {
                  setFormType('parent');
                  setShowFormModal(true);
                }}
                className="px-4 py-2.5 rounded-full text-[10px] font-bold border border-white text-white"
              >
                Book Free Trial
              </button>

            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="absolute right-0 bottom-0 w-[42%] h-full flex items-end">
            <img
              src="/icons/student.png"
              className="w-full object-contain"
            />
          </div>

        </motion.div>
      </section>

      {/* 🔹 EXPLORE */}
      <section className="px-6">

        <div className="flex justify-between mb-3">
          <h3 className="text-[18px] font-semibold">Explore Opportunities</h3>
          <span className="text-[12px] opacity-60">View all</span>
        </div>

        <div className="flex gap-3 overflow-x-auto">

          <ExploreCard icon={<Briefcase size={24} />} label="Jobs" sub="New openings" />
          <ExploreCard icon={<GraduationCap size={24} />} label="Tutors" sub="Find expert tutors" />
          <ExploreCard icon={<BookMarked size={24} />} label="Subjects" sub="Explore topics" />
          <ExploreCard icon={<Calendar size={24} />} label="Free Trial" sub="Book a session" />
          <ExploreCard icon={<MessageSquare size={24} />} label="Support" sub="Get help" />

        </div>

      </section>

      {/* 🔹 IMPACT */}
      <section className="px-6">
        <div className="bg-white rounded-xl p-4 flex justify-between text-center">

          <Stat value="25K+" label="Students" />
          <Stat value="3K+" label="Tutors" />
          <Stat value="500+" label="Schools" />
          <Stat value="4.8" label="Rating" />

        </div>
      </section>

      {/* 🔹 FEATURED */}
      <section className="px-6">

        <h3 className="text-[18px] font-semibold mb-3">
          Featured Opportunities
        </h3>

        {featuredJobs.length > 0 ? (
          featuredJobs.map(job => (
            <JobCard key={job['Order ID']} job={job} />
          ))
        ) : (
          <div className="bg-white p-4 rounded-xl text-sm">
            No jobs available
          </div>
        )}

      </section>

    </div>
  );
}

function ExploreCard({ icon, label, sub }: any) {
  return (
    <div className="bg-white p-3 rounded-xl w-[100px] text-center shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mx-auto mb-2">
        {icon}
      </div>
      <div className="text-[12px] font-semibold">{label}</div>
      <div className="text-[9px] text-gray-400">{sub}</div>
    </div>
  );
}

function Stat({ value, label }: any) {
  return (
    <div>
      <div className="font-bold text-[14px]">{value}</div>
      <div className="text-[9px] text-gray-400">{label}</div>
    </div>
  );
}
