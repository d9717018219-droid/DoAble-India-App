/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User as LucideUser, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap, ArrowRight, Navigation, Check, Sun, Cloud, Moon, Menu, CreditCard } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth as firebaseAuth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { JobLead, TutorProfile, UserType } from './types';
import { JobCard } from './components/JobCard';
import { TutorCard } from './components/TutorCard';
import AlertsView from './components/AlertsView';
import AdminPanel from './components/AdminPanel';
import { cn, getCityTheme } from './utils';
import { 
  CITIES_LIST, 
  CLASSES_LIST,
  CLASS_SUBJECTS_DATA,
  CLASS_GROUP_MAPPING,
  CITY_TO_LOCATIONS_DATA} from './constants';

// ─── Typewriter hook ────────────────────────────────────────────────
function useTypewriter(text: string, speed = 80) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
}

// ─── Dynamic greeting ───────────────────────────────────────────────
function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon 🌤️';
  return 'Good Evening 🌙';
}

// ─── Haptic-like tap sound & vibrate ───────────────────────────────
const TAP_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
const tapAudio = new Audio(TAP_SOUND_URL);
tapAudio.load();

function playTapSound() {
  try {
    tapAudio.currentTime = 0;
    tapAudio.volume = 0.4;
    tapAudio.play().catch(() => {});
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  } catch {}
}

export default function App() {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [firestoreLeads, setFirestoreLeads] = useState<JobLead[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [userCity, setUserCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userGender, setUserGender] = useState<string | null>(localStorage.getItem('userGender'));
  const [userType, setUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [userClasses, setUserClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  const [userTutorSubjects, setUserTutorSubjects] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorSubjects') || '[]'));
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'tutors' | 'alerts' | 'admin'>('home');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [themeMode] = useState<'light' | 'dark'>(localStorage.getItem('themeMode') as 'light' | 'dark' || 'light');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [visibleJobsCount, setVisibleJobsCount] = useState(10);
  const [visibleTutorsCount, setVisibleTutorsCount] = useState(10);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<'parent' | 'teacher'>('parent');
  const [editUserType, setEditUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [editCity, setEditCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [isPreferenceMode, setIsPreferenceMode] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Advanced Filters state
  const [showAdvancedFilterDrawer, setShowAdvancedFilterDrawer] = useState(false);
  const [tutorFilterID, setTutorFilterID] = useState('');
  const [tutorFilterName, setTutorFilterName] = useState('');
  const [tutorFilterGender, setTutorFilterGender] = useState('all');
  const [tutorFilterVehicle, setTutorFilterVehicle] = useState('all');
  const [tutorFilterExperience, setTutorFilterExperience] = useState('all');
  const [tutorFilterQualification, setTutorFilterQualification] = useState('all');
  const [tutorFilterTime, setTutorFilterTime] = useState('all');
  const [tutorFilterDate, setTutorFilterDate] = useState('all');
  const [tutorFilterDay, setTutorFilterDay] = useState('all');
  const [tutorFilterFee, setTutorFilterFee] = useState('all');
  const [tutorFilterStatus, setTutorFilterStatus] = useState('all');
  const [tutorFilterSchoolExp, setTutorFilterSchoolExp] = useState('all');

  const resetCounts = useCallback(() => { setVisibleJobsCount(10); setVisibleTutorsCount(10); }, []);

  const clearFilters = useCallback(() => {
    setSelectedLocalities([]); setTutorFilterID(''); setTutorFilterName(''); setTutorFilterGender('all');
    setTutorFilterVehicle('all'); setTutorFilterExperience('all'); setTutorFilterQualification('all');
    setTutorFilterTime('all'); setTutorFilterDate('all'); setTutorFilterDay('all'); setTutorFilterFee('all');
    setTutorFilterStatus('all'); setTutorFilterSchoolExp('all'); setUserClasses([]); setUserTutorSubjects([]);
    setSearchQuery(''); setCityFilter('all'); resetCounts();
  }, [resetCounts]);

  useEffect(() => { document.documentElement.classList.toggle('dark', themeMode === 'dark'); }, [themeMode]);
  useEffect(() => { const unsub = onAuthStateChanged(firebaseAuth, (u) => setCurrentUser(u)); return () => unsub(); }, []);
  useEffect(() => { if (currentUser?.email === 'd9717018219@gmail.com') setIsAdminUser(true); else setIsAdminUser(false); }, [currentUser]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(firebaseAuth, provider); } catch (err: any) { setError(err.message); }
  };

  useEffect(() => { loadData(); }, []);

  const parseDate = useCallback((dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const s = dateStr.toString().trim();
    const parts = s.split(/[\/\-\s:]/);
    if (parts.length >= 3) {
      let day, month, year;
      if (parts[0].length === 4) { year = parseInt(parts[0]); month = parseInt(parts[1]) - 1; day = parseInt(parts[2]); }
      else { day = parseInt(parts[0]); month = parseInt(parts[1]) - 1; year = parseInt(parts[2]); if (year < 100) year += 2000; }
      return new Date(year, month, day).getTime() || 0;
    }
    return new Date(s).getTime() || 0;
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [r1, r2] = await Promise.all([fetch('/api/leads'), fetch('/api/tutors')]);
      const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
      if (j1.status === 'success') {
        setLeads((j1.data as JobLead[]).filter(x => x['Internal Remark']?.toLowerCase() === 'searching').sort((a,b) => parseDate(b['Record Added']) - parseDate(a['Record Added'])));
      }
      setTutors((j2.data as TutorProfile[]).sort((a,b) => parseDate((b as any)['Record Added']) - parseDate((a as any)['Record Added'])));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const completeOnboarding = () => {
    const role = editUserType || userType;
    localStorage.setItem('userType', role || '');
    localStorage.setItem('userCity', editCity);
    setUserType(role); setUserCity(editCity); setCityFilter(editCity); setShowOnboarding(false);
    if (role === 'parent') setActiveTab('tutors'); else if (role === 'teacher') setActiveTab('jobs');
  };

  const isCityMatch = (city: string | undefined, filter: string) => {
    if (!city || filter.toLowerCase() === 'all') return true;
    return city.toLowerCase().includes(filter.toLowerCase());
  };

  const allLeads = useMemo(() => {
    const combined = [...firestoreLeads, ...leads];
    const unique = new Map();
    combined.forEach(l => { const id = l['Order ID'] || (l as any).id; if (id) unique.set(id, l); });
    return Array.from(unique.values());
  }, [leads, firestoreLeads]);

  const filteredJobs = useMemo(() => allLeads.filter(l => isCityMatch(l.City, cityFilter)), [allLeads, cityFilter]);
  const filteredTutors = useMemo(() => tutors.filter(t => isCityMatch((t as any)['Preferred City'], cityFilter)), [tutors, cityFilter]);

  const dynamicCities = useMemo(() => Array.from(new Set(CITIES_LIST)).sort(), []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans" ref={mainScrollRef}>
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-50 p-8 rounded-[40px] shadow-xl space-y-6">
              <h1 className="text-2xl font-black text-center">Setup Your Experience</h1>
              <div className="space-y-4">
                <select value={editUserType || ''} onChange={e => setEditUserType(e.target.value as UserType)} className="w-full p-4 rounded-xl border">
                  <option value="" disabled>I am a...</option>
                  <option value="parent">Parent</option>
                  <option value="teacher">Tutor</option>
                </select>
                <select value={editCity} onChange={e => setEditCity(e.target.value)} className="w-full p-4 rounded-xl border">
                  {['Ghaziabad', 'Noida', 'Delhi', 'Gurgaon', 'Faridabad'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={completeOnboarding} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Start Discovery</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenuDrawer && (
          <div className="fixed inset-0 z-[11000] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMenuDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-[300px] h-full p-8 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">Account</h2>
                <button onClick={() => setShowMenuDrawer(false)}><X /></button>
              </div>
              <div className="space-y-6 flex-1">
                <input type="text" value={userName || ''} onChange={e => { setUserName(e.target.value); localStorage.setItem('userName', e.target.value); }} placeholder="Full Name" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl" />
                <select value={userType || ''} onChange={e => { setUserType(e.target.value as UserType); localStorage.setItem('userType', e.target.value); }} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <option value="parent">Parent</option>
                  <option value="teacher">Tutor</option>
                </select>
                <select value={userCity} onChange={e => { setUserCity(e.target.value); localStorage.setItem('userCity', e.target.value); }} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {['Ghaziabad', 'Noida', 'Delhi', 'Gurgaon', 'Faridabad'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <button onClick={() => { firebaseAuth.signOut(); setShowMenuDrawer(false); }} className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-xl">Sign Out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className={cn("p-6 text-center border-b sticky top-0 z-50 bg-white/80 backdrop-blur-md")}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2"><button onClick={() => setShowMenuDrawer(true)} className="p-2"><Menu /></button></div>
        <h1 className="text-xl font-black">
          {activeTab === 'home' ? (userName ? `Hi, ${userName}` : 'DoAble India') : activeTab.toUpperCase()}
        </h1>
      </header>

      <main className="container mx-auto p-4 pb-32">
        {activeTab === 'home' && (
          <div className="space-y-6 py-10 text-center">
            <h2 className="text-4xl font-black">Discovery Simple.</h2>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setFormType('teacher'); setShowFormModal(true); }} className="p-6 bg-primary text-white rounded-3xl font-black">BECOME A TUTOR</button>
              <button onClick={() => { setFormType('parent'); setShowFormModal(true); }} className="p-6 border-2 rounded-3xl font-black">BOOK FREE TRIAL</button>
            </div>
          </div>
        )}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Ghaziabad', 'Noida', 'Delhi', 'Gurgaon'].map(c => (
                <button key={c} onClick={() => setCityFilter(c)} className={cn("px-6 py-2 rounded-full font-bold whitespace-nowrap", cityFilter === c ? "bg-slate-900 text-white" : "bg-slate-100")}>{c}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map(j => <JobCard key={j['Order ID']} job={j} />)}
            </div>
          </div>
        )}
        {activeTab === 'tutors' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTutors.map(t => <TutorCard key={(t as any)['Tutor ID']} tutor={t} />)}
            </div>
          </div>
        )}
        {activeTab === 'alerts' && <AlertsView city={userCity} userType={userType} showFormModal={showFormModal} setShowFormModal={setShowFormModal} setUserCity={setUserCity} setUserGender={setUserGender} setUserClasses={setUserClasses} setUserType={setUserType} />}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8000] w-[92%] max-w-[500px] bg-slate-900 text-white rounded-[32px] p-2 flex justify-around shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={cn("p-4 rounded-2xl", activeTab === 'home' && "bg-white text-slate-900")}><HomeIcon /></button>
        <button onClick={() => setActiveTab('jobs')} className={cn("p-4 rounded-2xl", activeTab === 'jobs' && "bg-white text-slate-900")}><FileText /></button>
        <button onClick={() => setActiveTab('tutors')} className={cn("p-4 rounded-2xl", activeTab === 'tutors' && "bg-white text-slate-900")}><GraduationCap /></button>
        <button onClick={() => setActiveTab('alerts')} className={cn("p-4 rounded-2xl", activeTab === 'alerts' && "bg-white text-slate-900")}><Bell /></button>
      </nav>

      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden h-[80vh]">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-black">Official Form</h3>
                <button onClick={() => setShowFormModal(false)}><X /></button>
              </div>
              <iframe className="w-full h-full" src={formType === 'teacher' ? 'https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8' : 'https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o'} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 py-3 px-5 rounded-2xl transition-all", active ? "bg-white text-slate-900 shadow-lg" : "text-white/40 hover:text-white")}>
      {icon}<span className="text-[9px] font-black uppercase">{label}</span>
    </button>
  );
}
