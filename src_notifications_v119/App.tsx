/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User as LucideUser, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap, ArrowRight, Navigation, Check, Sun, Cloud, Moon, Briefcase, BookText, ChevronDown, CreditCard, Heart, Volume2, Play, Terminal, Lock, Mail, UserCircle } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { motion, AnimatePresence } from 'framer-motion';
import { JobLead, TutorProfile, Alert, UserType } from './types';
import { JobCard } from './components/JobCard';
import { TutorCard } from './components/TutorCard';
import AlertsView from './components/AlertsView';
import SupportView from './components/SupportView';
import HomeView from './components/HomeView';
import useNotifications from './hooks/useNotifications';
import { cn, getCityTheme, formatCurrency, getCityPhone, toTitleCase, getJobId, getTutorId } from './utils';
import { 
  CITIES_LIST, 
  CLASSES_LIST,
  CLASS_SUBJECTS_DATA,
  CLASS_GROUP_MAPPING,
  CITY_TO_LOCATIONS_DATA} from './constants';

const IS_ADMIN_VERSION = false; 

function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon 🌤️';
  return 'Good Evening 🌙';
}

const TAP_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
const tapAudio = new Audio(TAP_SOUND_URL);
tapAudio.load();

function playTapSound() {
  try {
    tapAudio.currentTime = 0;
    tapAudio.volume = 0.4;
    tapAudio.play().catch(() => {});
  } catch {}
}

function DetailStat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-white p-3.5 rounded-2xl text-center border border-slate-100 shadow-sm transition-all duration-300">
      <div className="text-xl mb-1">{emoji}</div>
      <div className="text-[12px] font-black text-primary truncate leading-tight">{value}</div>
      <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1 opacity-70">{label}</div>
    </div>
  );
}

function ProfileField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">{icon}</div>
          <div className="text-left">
             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
             <div className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{value || 'Not Set'}</div>
          </div>
       </div>
    </div>
  );
}

export default function App() {
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize push notifications
  useNotifications();

  const [leads, setLeads] = useState<JobLead[]>([]);
  const [firestoreLeads, setFirestoreLeads] = useState<JobLead[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);

  const [userCity, setUserCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userGender, setUserGender] = useState<string | null>(localStorage.getItem('userGender'));
  const [userType, setUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [userClasses, setUserClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState(localStorage.getItem('lastSelectedCity') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileTab, setProfileTab] = useState<'edit' | 'matching'>('edit');
  const [unseenAlertsCount, setUnseenAlertsCount] = useState(0);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(JSON.parse(localStorage.getItem('shortlistedIds') || '[]'));
  
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'tutors' | 'alerts' | 'support' | 'payments'>('home');
  const [selectedJob, setSelectedJob] = useState<JobLead | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<'parent' | 'teacher'>('parent');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));

  const ALERT_JINGLE = '/blackberry.mp3';

  const parseDate = useCallback((dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const s = dateStr.toString().trim();
    const parts = s.split(/[\/\-\s:]/);
    if (parts.length >= 3) {
      let day, month, year;
      if (parts[0].length === 4) {
        year = parseInt(parts[0]); month = parseInt(parts[1]) - 1; day = parseInt(parts[2]);
      } else if (parts[2].length === 4 || parts[2].length === 2) {
        day = parseInt(parts[0]); month = parseInt(parts[1]) - 1; year = parseInt(parts[2]);
        if (year < 100) year += 2000;
      } else { return new Date(s).getTime() || 0; }
      const hour = parts[3] ? parseInt(parts[3]) : 0;
      const min = parts[4] ? parseInt(parts[4]) : 0;
      const date = new Date(year, month, day, hour, min);
      if (!isNaN(date.getTime())) return date.getTime();
    }
    const native = new Date(s).getTime();
    return isNaN(native) ? 0 : native;
  }, []);

  const loadData = async () => {
    try {
      if (leads.length === 0 && tutors.length === 0) setLoading(true);
      const LEADS_URL = 'https://doableindia.com/api_data.php';
      const TUTORS_URL = 'https://doableindia.com/api_data_copy.php';
      const [leadsRes, tutorsRes] = await Promise.all([fetch(LEADS_URL), fetch(TUTORS_URL)]);
      const [leadsJson, tutorsJson] = await Promise.all([leadsRes.json(), tutorsRes.json()]);
      if (leadsJson.status === 'success' && Array.isArray(leadsJson.data)) {
        const rawLeads = leadsJson.data.map((l: any) => ({ ...l, _timestamp: parseDate(l['Updated Time'] || l['Record Added']) }));
        setLeads(rawLeads.filter((x: any) => (x['Internal Remark'] || '').trim().toLowerCase() === 'searching').sort((a: any, b: any) => b._timestamp - a._timestamp));
      }
      if (tutorsJson.status === 'success' && Array.isArray(tutorsJson.data)) {
        const rawTutors = tutorsJson.data.map((t: any) => ({ ...t, _timestamp: parseDate(t['Updated Time'] || t['Record Added']) }));
        setTutors(rawTutors.sort((a: any, b: any) => b._timestamp - a._timestamp));
      }
    } catch (err: any) { console.error('Error loading data:', err); } finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
    const qLeads = query(collection(db, 'leads'), orderBy('Updated Time', 'desc'), limit(50));
    const unsub = onSnapshot(qLeads, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data(), _timestamp: parseDate((d.data() as any)['Updated Time'] || (d.data() as any)['Record Added']) } as JobLead));
      setFirestoreLeads(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => { setCurrentUser(user); });
    return () => unsubAuth();
  }, []);

  const isCityMatch = useCallback((city: string | undefined, filter: string) => {
    if (!city || filter.toLowerCase() === 'all') return true;
    const c = city.toString().toLowerCase().trim();
    const f = filter.toLowerCase().trim();
    return c.includes(f) || f.includes(c);
  }, []);

  const allLeads = useMemo(() => {
    const combined = [...firestoreLeads, ...leads];
    const unique = new Map<string, JobLead>();
    combined.forEach(l => { const id = l['Order ID'] || (l as any).id; if (id && !unique.has(id)) unique.set(id, l); });
    return Array.from(unique.values()).sort((a: any, b: any) => (b._timestamp || 0) - (a._timestamp || 0));
  }, [leads, firestoreLeads]);

  const filteredJobs = useMemo(() => {
    return allLeads.filter(l => {
      if ((l['Internal Remark'] || '').trim().toLowerCase() !== 'searching') return false;
      if (!isCityMatch(l.City, cityFilter)) return false;
      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        const jName = (l.Name || '').toLowerCase();
        const jID = (l['Order ID'] || '').toLowerCase();
        if (!(jName.includes(sl) || jID.includes(sl))) return false;
      }
      return true;
    });
  }, [allLeads, cityFilter, searchQuery]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      const cityVal = (t['Preferred City'] || (t as any).preferredCity || (t as any).City || (t as any).city || 'India').toString().toLowerCase();
      if (!isCityMatch(cityVal, cityFilter)) return false;
      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        const tName = (t['Full Name'] || (t as any).fullName || '').toLowerCase();
        const tID = (t['Tutor ID'] || (t as any).tutorId || '').toLowerCase();
        if (!(tName.includes(sl) || tID.includes(sl))) return false;
      }
      return true;
    });
  }, [tutors, cityFilter, searchQuery]);

  const featuredJobs = useMemo(() => filteredJobs.slice(0, 3), [filteredJobs]);
  const featuredTutors = useMemo(() => filteredTutors.slice(0, 5), [filteredTutors]);

  const toggleShortlist = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    setShortlistedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('shortlistedIds', JSON.stringify(next));
      return next;
    });
  }, []);

  const NavButton = ({ active, onClick, icon, label, activeColor }: any) => (
    <button onClick={onClick} className={cn("flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 active:scale-110", active ? "bg-slate-50 " + activeColor + " shadow-inner" : "text-slate-400 hover:text-slate-600")}>
      {icon}<span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none overflow-x-hidden" ref={mainScrollRef}>
      <audio ref={audioRef} preload="auto" />
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[9000] pt-[var(--safe-area-top)]">
        <div className="px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[20px] font-[800] text-slate-900 tracking-tighter leading-tight">DoAble India</span>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Empowering Abilities</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { playTapSound(); setActiveTab('alerts'); }} className="relative p-2.5 text-slate-800 hover:bg-slate-50 rounded-2xl transition-all active:scale-90">
              <Bell size={20} className={cn(unseenAlertsCount > 0 && "text-primary")} />
              {unseenAlertsCount > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">{unseenAlertsCount}</span>}
            </button>
            <button onClick={() => setShowProfileSetup(true)} className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm active:scale-90 transition-all overflow-hidden">
              {currentUser?.photoURL ? <img src={currentUser.photoURL} className="w-full h-full object-cover" /> : <LucideUser size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar pt-[calc(4rem+var(--safe-area-top))] pb-20 relative">
        {activeTab === 'home' && (
          <HomeView userName={userName} userType={userType} userCity={userCity} activeLeadsCount={filteredJobs.length} activeTutorsCount={filteredTutors.length} featuredJobs={featuredJobs} featuredTutors={featuredTutors} playTapSound={playTapSound} setFormType={setFormType} setShowFormModal={setShowFormModal} setActiveTab={setActiveTab} getDynamicGreeting={getDynamicGreeting} setShowFilterDrawer={setShowFilterDrawer} onJobClick={setSelectedJob} onTutorClick={setSelectedTutor} shortlistedIds={shortlistedIds} onShortlistToggle={toggleShortlist} setUserCity={setUserCity} setUserGender={setUserGender} setUserClasses={setUserClasses} setUserType={setUserType} setUserName={setUserName} />
        )}
        {activeTab === 'jobs' && (
          <section className="px-5 space-y-6 pt-4">
            <h2 className="text-[24px] font-[900] text-slate-900 tracking-tight">Active Jobs</h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.slice(0, 20).map(job => <JobCard key={getJobId(job)} job={job} onClick={setSelectedJob} onShortlistToggle={toggleShortlist} isShortlisted={shortlistedIds.includes(getJobId(job))} />)}
            </div>
          </section>
        )}
        {activeTab === 'tutors' && (
          <section className="px-5 space-y-6 pt-4">
            <h2 className="text-[24px] font-[900] text-slate-900 tracking-tight">Expert Tutors</h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredTutors.slice(0, 20).map(tutor => <TutorCard key={getTutorId(tutor)} tutor={tutor} onClick={setSelectedTutor} onShortlistToggle={toggleShortlist} isShortlisted={shortlistedIds.includes(getTutorId(tutor))} />)}
            </div>
          </section>
        )}
        {activeTab === 'alerts' && <AlertsView onBack={() => setActiveTab('home')} />}
        {activeTab === 'support' && <SupportView onBack={() => setActiveTab('home')} />}
        {activeTab === 'payments' && (
           <div className="px-6 py-10"><h2 className="text-2xl font-black text-slate-900 uppercase mb-4">Secure Payments</h2><a href="https://zohosecurepay.in/checkout/i9db4wt2-verz1l6gn6ogo/Make-a-secure-payment-now" target="_blank" rel="noreferrer" className="block w-full bg-emerald-600 text-white p-5 rounded-2xl font-black text-center shadow-lg uppercase tracking-widest">Proceed to Payment</a></div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[8000] w-[98%] max-w-[600px]">
        <div className="bg-white rounded-full p-2 flex items-center justify-between shadow-xl border border-slate-100 mx-4">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<HomeIcon size={18} />} label="Home" activeColor="text-[#1B7F5C]" />
          <NavButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={<FileText size={18} />} label="Jobs" activeColor="text-purple-600" />
          <NavButton active={activeTab === 'tutors'} onClick={() => setActiveTab('tutors')} icon={<GraduationCap size={18} />} label="Tutors" activeColor="text-emerald-600" />
          <NavButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<CreditCard size={18} />} label="Pay" activeColor="text-orange-600" />
          <NavButton active={activeTab === 'support'} onClick={() => setActiveTab('support')} icon={<MessageSquare size={18} />} label="Support" activeColor="text-blue-600" />
        </div>
      </nav>

      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[15000] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-[#F8FAFC] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
               <div className="p-8 text-center text-white relative shrink-0" style={{ background: getCityTheme(selectedJob.City).grad }}>
                  <button onClick={() => setSelectedJob(null)} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
                  <div className="text-[20px] font-[800] text-[#FFD166] mb-1">{selectedJob.Name || (selectedJob.subjects?.split(',')[0] || 'Tutor') + ' Required'}</div>
                  <div className="text-[11px] font-[600] opacity-80 uppercase tracking-widest">🆔 Order ID: {selectedJob['Order ID']}</div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailStat emoji="📍" label="Location" value={selectedJob.Locations || selectedJob.City} />
                    <DetailStat emoji="📚" label="Class" value={selectedJob.Class || 'General'} />
                    <DetailStat emoji="📖" label="Subjects" value={selectedJob.subjects || 'General'} />
                    <DetailStat emoji="💰" label="Fee" value={selectedJob.Fee ? `₹${formatCurrency(selectedJob.Fee)}` : 'Flexible'} />
                  </div>
                  <div className="space-y-3"><h4 className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Job Description</h4><div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm leading-relaxed text-sm text-slate-600 font-medium">{selectedJob.Notes || 'No additional details provided.'}</div></div>
                  <a href={`tel:${getCityPhone(selectedJob.City)}`} className="block w-full py-4 rounded-2xl bg-primary text-white font-black text-center shadow-xl uppercase tracking-widest active:scale-95 transition-all">Call Now</a>
               </div>
            </motion.div>
          </div>
        )}

        {selectedTutor && (
          <div className="fixed inset-0 z-[15000] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTutor(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-[#F8FAFC] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
              <div className="p-8 text-center text-white relative shrink-0" style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #2563EB 100%)' }}>
                <button onClick={() => setSelectedTutor(null)} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
                <div className="text-[20px] font-[800] text-white mb-1">{toTitleCase(selectedTutor.Name || (selectedTutor as any).fullName)}</div>
                <div className="text-[11px] font-[600] opacity-80 uppercase tracking-widest">🆔 Tutor ID: {selectedTutor['Tutor ID'] || (selectedTutor as any).tutorId}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <DetailStat emoji="📚" label="Exp" value={selectedTutor.Experience || '1-3 Yrs'} />
                  <DetailStat emoji="🎓" label="Qual" value={selectedTutor.Qualification || 'Graduate'} />
                  <DetailStat emoji="📖" label="Subjects" value={selectedTutor['Preferred Subject(s)'] || 'General'} />
                  <DetailStat emoji="💰" label="Fee" value={selectedTutor['Fee/Month'] || 'Flexible'} />
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-sm text-slate-600">{selectedTutor.About || "Dedicated educator committed to student success."}</div>
                <button onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }} className="w-full py-4 rounded-2xl bg-[#4ECDC4] text-white font-black uppercase shadow-xl active:scale-95 transition-all">Book a Free Demo</button>
              </div>
            </motion.div>
          </div>
        )}

        {showProfileSetup && (
          <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileSetup(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'tween', ease: "easeOut", duration: 0.15 }} className="relative bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-full mr-12">
                   {[
                     { id: 'edit', label: 'Profile', icon: LucideUser },
                     { id: 'matching', label: 'Matching', icon: Heart }
                   ].map(tab => (
                     <button key={tab.id} onClick={() => { setProfileTab(tab.id as any); playTapSound(); }} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all", profileTab === tab.id ? "bg-white text-primary shadow-sm" : "text-slate-400")}>
                       <tab.icon size={12} />
                       <span>{tab.label}</span>
                     </button>
                   ))}
                </div>
                <button onClick={() => setShowProfileSetup(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 pt-6">
                <AnimatePresence mode="wait">
                  {profileTab === 'edit' && (
                    <motion.div key="edit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                       <div className="space-y-4">
                          <ProfileField label="Identity" value={userType === 'teacher' ? 'Tutor' : 'Parent'} icon={<Briefcase size={16} />} />
                          <ProfileField label="Full Name" value={userName || 'Not Set'} icon={<UserCircle size={16} />} />
                          <ProfileField label="Gender" value={userGender || 'Not Set'} icon={<LucideUser size={16} />} />
                          <ProfileField label="City" value={userCity} icon={<MapPin size={16} />} />
                          <ProfileField label="Classes" value={userClasses.join(', ') || 'All'} icon={<GraduationCap size={16} />} />
                       </div>
                       <button onClick={() => { setShowOnboarding(true); setShowProfileSetup(false); playTapSound(); }} className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Update Profile</button>
                    </motion.div>
                  )}
                  {profileTab === 'matching' && (
                    <motion.div key="matching" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4 text-center py-20"><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No matching connections yet</p></motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}

        {showFormModal && (
          <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50"><h3 className="text-lg font-black uppercase">{formType === 'teacher' ? 'Tutor Registration' : 'Requirement Details'}</h3><button onClick={() => setShowFormModal(false)} className="p-3 bg-white rounded-2xl text-slate-400 shadow-sm"><X size={20} strokeWidth={3} /></button></div>
              <div className="flex-1 overflow-y-auto"><iframe className="w-full h-full min-h-[600px] border-none" src={formType === 'teacher' ? 'https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8' : 'https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o'} /></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
