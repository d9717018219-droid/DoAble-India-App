/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User as LucideUser, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap, ArrowRight, Navigation, Check, Sun, Cloud, Moon, Briefcase, BookText, ChevronDown } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth, auth as firebaseAuth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { JobLead, TutorProfile, Alert, UserType } from './types';
import { JobCard } from './components/JobCard';
import { TutorCard } from './components/TutorCard';
import AlertsView from './components/AlertsView';
import AdminPanel from './components/AdminPanel';
import SupportView from './components/SupportView';
import HomeView from './components/HomeView';
import { cn, getCityTheme, formatCurrency, getCityPhone } from './utils';
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

  const featuredJobs = useMemo(() => {
    return firestoreLeads.filter(l => l.Status === 'Active').slice(0, 3);
  }, [firestoreLeads]);

  const [userCity, setUserCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userGender, setUserGender] = useState<string | null>(localStorage.getItem('userGender'));
  const [userType, setUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [userClasses, setUserClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  const [userTutorSubjects, setUserTutorSubjects] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorSubjects') || '[]'));

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState(localStorage.getItem('lastSelectedCity') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist City Filter
  useEffect(() => {
    localStorage.setItem('lastSelectedCity', cityFilter);
  }, [cityFilter]);
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'tutors' | 'alerts' | 'admin' | 'support'>('home');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [visibleJobsCount, setVisibleJobsCount] = useState(10);
  const [visibleTutorsCount, setVisibleTutorsCount] = useState(10);
  const mainScrollRef = useRef<HTMLDivElement>(null);

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
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));
  const [selectedJob, setSelectedJob] = useState<JobLead | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<'parent' | 'teacher'>('parent');
  const [editUserType, setEditUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [editCity, setEditCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [isPreferenceMode, setIsPreferenceMode] = useState(false);
  const [alertsInitialTab, setAlertsInitialTab] = useState<'feed' | 'support' | 'setup'>('feed');

  const resetCounts = useCallback(() => {
    setVisibleJobsCount(10);
    setVisibleTutorsCount(10);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedLocalities([]);
    setTutorFilterID('');
    setTutorFilterName('');
    setTutorFilterGender('all');
    setTutorFilterVehicle('all');
    setTutorFilterExperience('all');
    setTutorFilterQualification('all');
    setTutorFilterTime('all');
    setTutorFilterDate('all');
    setTutorFilterDay('all');
    setTutorFilterFee('all');
    setTutorFilterStatus('all');
    setTutorFilterSchoolExp('all');
    setUserClasses([]);
    setUserTutorSubjects([]);
    setSearchQuery('');
    setCityFilter('all');
    resetCounts();
  }, [resetCounts]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (currentUser?.email === 'd9717018219@gmail.com') setIsAdminUser(true);
    else setIsAdminUser(false);
  }, [currentUser]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
    const qLeads = query(collection(db, 'leads'), orderBy('Updated Time', 'desc'), limit(50));
    const unsub = onSnapshot(qLeads, (snap) => {
      const data = snap.docs.map(d => {
        const item = { id: d.id, ...d.data() } as any;
        return {
          ...item,
          _timestamp: parseDate(item['Updated Time'] || item['Record Added'])
        };
      }) as JobLead[];
      setFirestoreLeads(data);
    });
    return () => unsub();
  }, []);

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
      } else {
        return new Date(s).getTime() || 0;
      }
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
      // Don't show full loader if we already have some data
      if (leads.length === 0 && tutors.length === 0) setLoading(true);
      
      const [leadsRes, tutorsRes] = await Promise.all([fetch('/api/leads'), fetch('/api/tutors')]);
      const [leadsJson, tutorsJson] = await Promise.all([leadsRes.json(), tutorsRes.json()]);
      
      if (leadsJson.status === 'success') {
        const rawLeads = (leadsJson.data as JobLead[]).map(l => ({
          ...l,
          _timestamp: parseDate(l['Updated Time'] || l['Record Added'])
        }));
        
        const filteredJobs = rawLeads
          .filter(x => x['Internal Remark']?.trim().toLowerCase() === 'searching')
          .sort((a, b) => (b as any)._timestamp - (a as any)._timestamp);
        setLeads(filteredJobs);
      }
      
      const rawTutors = (tutorsJson.data || []).map((t: any) => ({
        ...t,
        _timestamp: parseDate(t['Updated Time'] || t['Record Added'])
      }));
      
      rawTutors.sort((a: any, b: any) => b._timestamp - a._timestamp);
      setTutors(rawTutors);
    } catch (err: any) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = () => {
    const finalRole = editUserType || userType;
    localStorage.setItem('userType', finalRole || '');
    localStorage.setItem('userCity', editCity);
    setUserType(finalRole);
    setUserCity(editCity);
    setCityFilter(editCity);
    setShowOnboarding(false);
    if (finalRole === 'parent') setActiveTab('tutors');
    else if (finalRole === 'teacher') setActiveTab('jobs');
    window.scrollTo(0, 0);
  };

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
    return Array.from(unique.values()).sort((a: any, b: any) => 
      (b._timestamp || 0) - (a._timestamp || 0)
    );
  }, [leads, firestoreLeads]);

  const filteredJobs = useMemo(() => {
    return allLeads.filter(l => {
      if ((l['Internal Remark'] || '').trim().toLowerCase() !== 'searching') return false;
      if (!isCityMatch(l.City, cityFilter)) return false;
      if (selectedLocalities.length > 0) {
        const jLocs = (l.Locations || '').toLowerCase();
        if (!selectedLocalities.some(loc => jLocs.includes(loc.toLowerCase()))) return false;
      }
      
      // Precision Gender Filter for Jobs
      const jobGender = (l.Gender || '').toLowerCase();
      const filterGender = (activeTab === 'jobs' ? tutorFilterGender : userGender || 'any').toLowerCase();
      if (filterGender !== 'all' && filterGender !== 'any' && jobGender !== 'any' && jobGender !== filterGender) return false;
      
      if (userClasses.length > 0) {
        const jClass = (l.Class || l.subjects || l['Class / Board'] || '').toLowerCase();
        const matches = userClasses.some(uc => {
          if (jClass.includes(uc.toLowerCase())) return true;
          const mapped = CLASS_GROUP_MAPPING[uc];
          if (mapped && mapped.some(m => jClass.includes(m.toLowerCase()))) return true;
          return false;
        });
        if (!matches) return false;
      }

      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        const jSubj = (l.subjects || '').toLowerCase();
        const jName = (l.Name || '').toLowerCase();
        const jID = (l['Order ID'] || '').toLowerCase();
        if (!(jName.includes(sl) || jSubj.includes(sl) || jID.includes(sl))) return false;
      }
      return true;
    });
  }, [allLeads, cityFilter, searchQuery, selectedLocalities, userGender, userClasses, tutorFilterGender, activeTab]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      const cityVal = (t['Preferred City'] || (t as any).preferredCity || (t as any).City || (t as any).city || 'India').toString().toLowerCase();
      if (!isCityMatch(cityVal, cityFilter)) return false;

      // Precision Filters
      if (tutorFilterID && !(t['Tutor ID'] || (t as any).tutorId || '').toString().toLowerCase().includes(tutorFilterID.toLowerCase())) return false;
      if (tutorFilterName && !(t['Full Name'] || (t as any).fullName || '').toString().toLowerCase().includes(tutorFilterName.toLowerCase())) return false;
      
      const tGender = (t.Gender || (t as any).gender || '').toString().toLowerCase();
      if (tutorFilterGender !== 'all' && tutorFilterGender !== 'any' && tGender !== tutorFilterGender.toLowerCase()) return false;
      
      const tVehicle = (t['Own Vehicle'] || (t as any).ownVehicle || '').toString().toLowerCase();
      if (tutorFilterVehicle !== 'all' && tVehicle !== tutorFilterVehicle.toLowerCase()) return false;

      const tExp = parseInt((t['Teaching Experience'] || (t as any).experience || '0').toString());
      if (tutorFilterExperience !== 'all') {
        const filterExp = parseInt(tutorFilterExperience);
        if (filterExp === 5 && tExp < 5) return false;
        if (filterExp === 3 && (tExp < 3 || tExp >= 5)) return false;
        if (filterExp === 1 && (tExp < 1 || tExp >= 3)) return false;
        if (filterExp === 0 && tExp >= 1) return false;
      }

      const tQual = (t.Qualification || (t as any).qualification || '').toString().toLowerCase();
      if (tutorFilterQualification !== 'all' && !tQual.includes(tutorFilterQualification)) return false;

      const tTime = (t['Preferred Timing'] || (t as any).preferredTiming || '').toString().toLowerCase();
      if (tutorFilterTime !== 'all' && !tTime.includes(tutorFilterTime.toLowerCase())) return false;

      const tStatus = (t.Status || (t as any).status || '').toString().toLowerCase();
      if (tutorFilterStatus !== 'all' && !tStatus.includes(tutorFilterStatus.toLowerCase())) return false;

      if (userClasses.length > 0) {
        const tClass = (t['Preferred Class Group'] || (t as any).classGroup || '').toString().toLowerCase();
        const matches = userClasses.some(uc => {
          if (tClass.includes(uc.toLowerCase())) return true;
          const mapped = CLASS_GROUP_MAPPING[uc];
          if (mapped && mapped.some(m => tClass.includes(m.toLowerCase()))) return true;
          return false;
        });
        if (!matches) return false;
      }

      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        const tName = (t['Full Name'] || (t as any).fullName || '').toString().toLowerCase();
        const tID = (t['Tutor ID'] || (t as any).tutorId || '').toString().toLowerCase();
        const tSubj = (t['Preferred Subject(s)'] || (t as any).preferredSubjects || '').toString().toLowerCase();
        if (!(tName.includes(sl) || tID.includes(sl) || tSubj.includes(sl))) return false;
      }
      return true;
    });
  }, [tutors, cityFilter, searchQuery, tutorFilterID, tutorFilterName, tutorFilterGender, tutorFilterVehicle, tutorFilterExperience, tutorFilterQualification, tutorFilterTime, tutorFilterStatus, userClasses]);

  const activeLeadsCount = filteredJobs.length;
  const activeTutorsCount = filteredTutors.length;

  const dynamicCities = useMemo(() => {
    const citySet = new Set<string>(CITIES_LIST);
    [...tutors, ...allLeads].forEach(item => {
      const c = ( (item as any)['Preferred City'] || (item as any).City || '' ).toString().trim();
      if (c && c.toLowerCase() !== 'india') {
        citySet.add(c.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '));
      }
    });
    return Array.from(citySet).sort();
  }, [tutors, allLeads]);

  const cityLocations = useMemo(() => {
    if (cityFilter === 'all') return [];
    const lcf = cityFilter.toLowerCase().trim();
    const dataKey = Object.keys(CITY_TO_LOCATIONS_DATA).find(k => k.toLowerCase().trim() === lcf);
    return Array.from(new Set<string>(dataKey ? CITY_TO_LOCATIONS_DATA[dataKey] : [])).sort();
  }, [cityFilter]);

  return (
    <div className="min-h-screen bg-white font-sans" ref={mainScrollRef}>
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg space-y-10 py-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto transform -rotate-6"><Zap size={32} /></div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Application Setup</h1>
                </div>

                <div className="bg-slate-50 p-8 rounded-[40px] space-y-8 border border-slate-100 shadow-xl">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-2"><LucideUser size={14} className="text-primary" /> Select Role</label>
                    <div className="relative">
                      <select value={editUserType || ''} onChange={e => setEditUserType(e.target.value as UserType)} className="w-full bg-white p-5 pl-14 rounded-2xl text-sm font-black outline-none border-2 border-transparent focus:border-primary appearance-none cursor-pointer shadow-sm">
                        <option value="" disabled>Choose your role...</option>
                        <option value="parent">👨 Parent</option>
                        <option value="teacher">🎓 Tutor</option>
                      </select>
                      <LucideUser size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-xs">▼</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-2"><MapPin size={14} className="text-primary" /> Select City</label>
                    <div className="relative">
                      <select value={editCity} onChange={e => setEditCity(e.target.value)} className="w-full bg-white p-5 pl-14 rounded-2xl text-sm font-black outline-none border-2 border-transparent focus:border-primary appearance-none cursor-pointer shadow-sm">
                        {dynamicCities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                      <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-xs">▼</div>
                    </div>
                  </div>
                  <button onClick={completeOnboarding} disabled={!editUserType} className={cn("w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] transition-all", editUserType ? "bg-slate-900 text-white shadow-2xl" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>Establish Preference</button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-2xl rounded-t-[48px] p-8 space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-slate-900 uppercase">Switch City</h3>
                  <div className="bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                    <span className="text-[11px] font-black text-primary uppercase">{dynamicCities.length} Cities</span>
                  </div>
                </div>
                <button onClick={() => { setShowFilterDrawer(false); setCitySearchQuery(''); }} className="p-4 bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search your city..." 
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    className="w-full bg-slate-50 p-5 pl-14 rounded-2xl text-sm font-bold outline-none border border-slate-100 focus:border-primary transition-all"
                  />
                  <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  {citySearchQuery && (
                    <button onClick={() => setCitySearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-10">
                  <button onClick={() => { setCityFilter('all'); setUserCity('All'); localStorage.setItem('userCity', 'All'); setSelectedLocalities([]); resetCounts(); setShowFilterDrawer(false); setCitySearchQuery(''); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase transition-all", cityFilter === 'all' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>0. All Cities</button>
                  {dynamicCities
                    .filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()))
                    .map((c, idx) => (
                      <button 
                        key={c} 
                        onClick={() => { setCityFilter(c); setUserCity(c); localStorage.setItem('userCity', c); setSelectedLocalities([]); resetCounts(); setShowFilterDrawer(false); setCitySearchQuery(''); }} 
                        className={cn("p-4 rounded-2xl text-[10px] font-black uppercase truncate transition-all text-left flex items-center gap-2", cityFilter === c ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}
                      >
                        <span className="opacity-50 shrink-0">{idx + 1}.</span>
                        <span className="truncate">{c}</span>
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdvancedFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdvancedFilterDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-2xl rounded-t-[48px] p-8 space-y-6 max-h-[90vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Precision Filters</h3>
                  <div className="bg-primary/10 px-3 py-1 rounded-xl border border-primary/20"><span className="text-[11px] font-black text-primary uppercase">{activeTab === 'tutors' ? activeTutorsCount : activeLeadsCount} Matches</span></div>
                </div>
                <button onClick={() => setShowAdvancedFilterDrawer(false)} className="p-4 bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-8 py-4 pr-2">
                {/* 1. Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{activeTab === 'tutors' ? 'Tutor ID' : 'Order ID'}</label>
                    <input type="text" placeholder="Search ID..." value={activeTab === 'tutors' ? tutorFilterID : searchQuery} onChange={e => { activeTab === 'tutors' ? setTutorFilterID(e.target.value) : setSearchQuery(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100" />
                  </div>
                  {activeTab === 'tutors' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Name Search</label>
                      <input type="text" placeholder="Search Name..." value={tutorFilterName} onChange={e => { setTutorFilterName(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100" />
                    </div>
                  )}
                  {activeTab === 'jobs' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Job Subject / Board</label>
                      <input type="text" placeholder="e.g. Maths, CBSE..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100" />
                    </div>
                  )}
                </div>

                {cityFilter !== 'all' && cityLocations.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Specific Areas in {cityFilter}</label>
                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {cityLocations.map(loc => {
                        const isSelected = selectedLocalities.includes(loc);
                        return (
                          <button
                            key={loc}
                            onClick={() => {
                              setSelectedLocalities(prev => isSelected ? prev.filter(x => x !== loc) : [...prev, loc]);
                              resetCounts();
                            }}
                            className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all border", isSelected ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-100")}
                          >
                            {loc}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Gender</label>
                    <select value={tutorFilterGender} onChange={e => { setTutorFilterGender(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100">
                      <option value="all">Any Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  {activeTab === 'tutors' && (
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Own Vehicle</label><select value={tutorFilterVehicle} onChange={e => { setTutorFilterVehicle(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100"><option value="all">Any</option><option value="yes">Yes</option><option value="no">No</option></select></div>
                  )}
                  {activeTab === 'jobs' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Experience Required</label>
                      <select value={tutorFilterExperience} onChange={e => { setTutorFilterExperience(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100">
                        <option value="all">Any Experience</option>
                        <option value="0">Fresher</option>
                        <option value="1">1-2 Yrs</option>
                        <option value="3">3-5 Yrs</option>
                        <option value="5">5+ Yrs</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Target Class Group</label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSES_LIST.map(cls => {
                      const isSelected = userClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          onClick={() => {
                            const nextClasses = isSelected ? userClasses.filter(x => x !== cls) : [...userClasses, cls];
                            setUserClasses(nextClasses);
                            localStorage.setItem('userClasses', JSON.stringify(nextClasses));
                            resetCounts();
                          }}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all border", isSelected ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-100")}
                        >
                          {cls}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeTab === 'tutors' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Experience</label><select value={tutorFilterExperience} onChange={e => { setTutorFilterExperience(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100"><option value="all">Any Exp</option><option value="0">Fresher</option><option value="1">1-2 Yrs</option><option value="3">3-5 Yrs</option><option value="5">5+ Yrs</option></select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qualification</label><select value={tutorFilterQualification} onChange={e => { setTutorFilterQualification(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100"><option value="all">Any</option><option value="graduate">Graduate</option><option value="postgraduate">Post-Graduate</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Shift</label><select value={tutorFilterTime} onChange={e => { setTutorFilterTime(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100"><option value="all">Any Time</option><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option></select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Status</label><select value={tutorFilterStatus} onChange={e => { setTutorFilterStatus(e.target.value); resetCounts(); }} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100"><option value="all">Any Status</option><option value="active">✅ Active</option><option value="suspended">🚫 Suspended</option></select></div>
                    </div>

                    {userClasses.length > 0 && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subjects (Matching Selection)</label>
                        <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                           {Array.from(new Set(userClasses.flatMap(c => CLASS_SUBJECTS_DATA[c] || []))).sort().map(subj => {
                             const isSelected = userTutorSubjects.includes(subj);
                             return (
                               <button
                                 key={subj}
                                 onClick={() => {
                                   const nextSubjs = isSelected ? userTutorSubjects.filter(x => x !== subj) : [...userTutorSubjects, subj];
                                   setUserTutorSubjects(nextSubjs);
                                   localStorage.setItem('userTutorSubjects', JSON.stringify(nextSubjs));
                                   resetCounts();
                                 }}
                                 className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all border", isSelected ? "bg-[#0FE8F2] text-slate-900 border-[#0FE8F2]" : "bg-white text-slate-500 border-slate-100")}
                               >
                                 {subj}
                               </button>
                             );
                           })}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button onClick={clearFilters} className="flex-1 bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">Clear</button>
                  <button onClick={() => setShowAdvancedFilterDrawer(false)} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Apply</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-[100] bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100/60 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center">
          <span className="text-[20px] font-bold text-slate-900 tracking-tight">DoAble India</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playTapSound(); setAlertsInitialTab('feed'); setActiveTab('alerts'); }}
            className="relative p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-all active:scale-90"
          >
            <Bell size={24} strokeWidth={2.2} />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">3</span>
          </button>
          <button onClick={() => { playTapSound(); setAlertsInitialTab('setup'); setActiveTab('alerts'); }} className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm active:scale-90 transition-all">
             {currentUser?.photoURL ? (
               <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs"><LucideUser size={18} /></div>
             )}
          </button>
        </div>
      </header>

      <main className="container mx-auto p-0 sm:p-[10px] max-w-[1200px] pb-32">
       {activeTab === 'home' && (
  <HomeView 
    userName={userName}
    userType={userType}
    userCity={userCity}
    activeLeadsCount={firestoreLeads.filter(l => l.Status === 'Active').length}
    activeTutorsCount={tutors.length}
    featuredJobs={featuredJobs}
    playTapSound={playTapSound}
    setFormType={setFormType}
    setShowFormModal={setShowFormModal}
    setActiveTab={setActiveTab}
    setShowFilterDrawer={setShowFilterDrawer}
    getDynamicGreeting={getDynamicGreeting} // 🔥 FIX
    onJobClick={setSelectedJob}
  />
)}
        {activeTab === 'alerts' && (
          <AlertsView
            city={userCity || 'All'} userGender={userGender} userClasses={userClasses} userType={userType}
            setUserCity={setUserCity} setUserGender={setUserGender} setUserClasses={setUserClasses} setUserType={setUserType}
            isAdminUser={isAdminUser} onAdminClick={() => setActiveTab('admin')} currentUser={currentUser}
            handleSignIn={handleSignIn} showFormModal={showFormModal} setShowFormModal={setShowFormModal}
            userName={userName} setUserName={setUserName} initialTab={alertsInitialTab}
          />
        )}
        {activeTab === 'support' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SupportView jobsCount={activeLeadsCount} tutorsCount={activeTutorsCount} />
          </div>
        )}
        {activeTab === 'admin' && isAdminUser && <AdminPanel currentCity={userCity || 'All'} />}        {(activeTab === 'jobs' || activeTab === 'tutors') && (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'jobs' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'jobs' ? 10 : -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col space-y-3 px-5 pb-20"
          >
              {/* Jobs Portal Header */}
              <div className="pt-4 pb-2 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h2 className="text-[28px] font-[800] text-[#0F172A] tracking-tight">
                      {activeTab === 'jobs' ? 'Jobs Portal' : 'Tutors Portal'}
                    </h2>
                    <p className="text-[#64748B] text-[11px] font-[500] leading-tight max-w-[250px]">
                      {activeTab === 'jobs' 
                        ? 'Find teaching opportunities that match your skills and passion.'
                        : 'Discover elite educators ready to help you achieve your goals.'}
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-white border border-slate-100 rounded-[16px] px-3.5 py-2 flex items-center gap-2 shadow-sm focus-within:border-primary transition-colors">
                    <Search size={14} className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search title, subject, location..." 
                      className="bg-transparent border-none outline-none text-[11px] w-full text-slate-700 font-medium"
                    />
                  </div>
                  <button onClick={() => setShowAdvancedFilterDrawer(true)} className="bg-white border border-slate-100 rounded-[16px] px-3 py-2 flex items-center gap-1.5 shadow-sm font-bold text-[11px] text-slate-700 active:scale-95 transition-all">
                    <Navigation size={14} className="text-primary" />
                    <span className="hidden sm:inline">Distance</span>
                    <Filter size={14} className="text-slate-400" />
                  </button>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <FilterChip label="Gender" icon={<LucideUser size={10} />} active={tutorFilterGender !== 'all'} onClick={() => setShowAdvancedFilterDrawer(true)} />
                  <FilterChip label="Class" icon={<GraduationCap size={10} />} active={userClasses.length > 0} onClick={() => setShowAdvancedFilterDrawer(true)} />
                  <FilterChip label="City" icon={<HomeIcon size={10} />} active={cityFilter !== 'all'} onClick={() => setShowFilterDrawer(true)} />
                  {cityFilter !== 'all' && (
                    <FilterChip label="Localities" icon={<MapPin size={10} />} active={selectedLocalities.length > 0} onClick={() => setShowAdvancedFilterDrawer(true)} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && leads.length === 0 && tutors.length === 0 ? (
                  <div className="col-span-full py-40 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /></div>
                ) : activeTab === 'jobs' ? (
                  <>{filteredJobs.slice(0, visibleJobsCount).map((job) => (<JobCard key={(job as any).id || job['Order ID']} job={job} onClick={setSelectedJob} />))}{visibleJobsCount < filteredJobs.length && (<div className="col-span-full py-10 flex justify-center"><button onClick={() => setVisibleJobsCount(prev => prev + 10)} className="bg-primary text-white px-10 py-4 rounded-2xl font-[800] text-[12px] uppercase shadow-xl active:scale-95 transition-all">Load More Jobs</button></div>)}</>
                ) : (
                  <>{filteredTutors.slice(0, visibleTutorsCount).map((tutor) => (<TutorCard key={(tutor as any).id || (tutor as any)['Tutor ID']} tutor={tutor} onClick={setSelectedTutor} />))}{visibleTutorsCount < filteredTutors.length && (<div className="col-span-full py-10 flex justify-center"><button onClick={() => setVisibleTutorsCount(prev => prev + 10)} className="bg-primary text-white px-10 py-4 rounded-2xl font-[800] text-[12px] uppercase shadow-xl active:scale-95 transition-all">Load More Tutors</button></div>)}</>
                )}
              </div>

              {/* Don't find the right job section */}
              {!loading && (
                <div className="mt-6 bg-white border border-slate-100 rounded-[24px] p-3.5 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-[#F8FAFC] rounded-xl flex items-center justify-center shrink-0 text-lg">
                      {activeTab === 'jobs' ? '💼' : '🎓'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-[800] text-[#0F172A] tracking-tight leading-none whitespace-nowrap">
                        Don't find the right {activeTab === 'jobs' ? 'job' : 'tutor'}?
                      </h3>
                      <p className="text-[#64748B] text-[9px] font-[600] leading-tight mt-1 whitespace-nowrap truncate">
                        {activeTab === 'jobs' ? 'Share your profile and let students find you.' : 'Post your requirement and let experts reach out.'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { playTapSound(); setFormType(activeTab === 'jobs' ? 'teacher' : 'parent'); setShowFormModal(true); }}
                    className="bg-[#0F172A] text-white px-3.5 py-2.5 rounded-xl font-black text-[8px] uppercase tracking-widest whitespace-nowrap active:scale-95 transition-all shadow-md shrink-0"
                  >
                    {activeTab === 'jobs' ? 'Create Profile' : 'Post Requirement'}
                  </button>
                </div>
              )}
          </motion.div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[8000] w-[92%] max-w-[500px]">
        <div className="bg-white rounded-full p-2 flex items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 relative">
          <NavButton active={activeTab === 'home'} onClick={() => { playTapSound(); setActiveTab('home'); window.scrollTo(0,0); }} icon={<HomeIcon size={22} />} label="Home" activeColor="text-[#1B7F5C]" />
          <NavButton active={activeTab === 'jobs'} onClick={() => { playTapSound(); setActiveTab('jobs'); window.scrollTo(0,0); }} icon={<FileText size={22} />} label="Jobs" activeColor="text-purple-600" />
          <NavButton active={activeTab === 'tutors'} onClick={() => { playTapSound(); setActiveTab('tutors'); window.scrollTo(0,0); }} icon={<GraduationCap size={22} />} label="Tutors" activeColor="text-emerald-600" />
          <NavButton active={activeTab === 'support'} onClick={() => { playTapSound(); setActiveTab('support'); window.scrollTo(0,0); }} icon={<MessageSquare size={22} />} label="Support" activeColor="text-blue-600" />
          {isAdminUser && (<button onClick={() => { playTapSound(); setActiveTab('admin'); }} className={cn("absolute -top-16 right-0 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 transition-all active:scale-95", activeTab === 'admin' ? "bg-primary text-white" : "hover:bg-slate-50")}><Settings size={20} /></button>)}
        </div>
      </nav>
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[11000] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              className="relative bg-[#F8FAFC] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
            >
              {/* Premium Header */}
              <div 
                className="p-8 text-center text-white relative shrink-0"
                style={{ background: getCityTheme(selectedJob.City).grad }}
              >
                <button onClick={() => setSelectedJob(null)} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
                <div className="text-[20px] font-[800] text-[#FFD166] mb-1">
                   {selectedJob.Gender?.toLowerCase().includes('female') ? '👩‍🏫' : '👨‍🏫'} {selectedJob.Name || (selectedJob.subjects?.split(',')[0] || 'Tutor') + ' Required'}
                </div>
                <div className="text-[11px] font-[600] opacity-80 uppercase tracking-widest">🆔 Order ID: {selectedJob['Order ID']}</div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 p-5 bg-white/50 border-b border-slate-100">
                  <DetailStat emoji={selectedJob.Gender?.toLowerCase().includes('female') ? '👩‍🏫' : '👨‍🏫'} label="Gender" value={selectedJob.Gender || 'Any'} />
                  <DetailStat emoji="📍" label="Location" value={selectedJob.Locations?.split(',')[0] || selectedJob.City || 'India'} />
                  <DetailStat emoji="📖" label="Class/Board" value={selectedJob['Class / Board'] || (selectedJob.Class || 'General')} />
                  <DetailStat emoji="💰" label="Fee" value={`₹${formatCurrency(selectedJob.Fee || '0')}/Mo`} />
                </div>

                {/* Parent Note */}
                <div className="m-5 p-4 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
                  <span className="text-[10px] font-black uppercase text-orange-600 mb-2 block tracking-widest">📝 Parent Note</span>
                  <p className="text-[12px] text-slate-700 font-medium leading-relaxed">{selectedJob.Notes || 'No specific requirements mentioned.'}</p>
                </div>

                {/* Content Sections */}
                <div className="p-6 space-y-6 bg-white">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Subjects to Teach</span>
                    <div className="flex flex-wrap gap-2">
                      {(selectedJob.subjects || 'General').split(',').map((s, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700">📖 {s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Class Location</span>
                    <div 
                      className="p-4 bg-slate-50 rounded-2xl border-l-4 border-primary shadow-sm cursor-pointer group"
                      onClick={() => {
                        const dest = encodeURIComponent(`${(selectedJob as any).residency || 'Student Home'}, ${selectedJob.Locations || selectedJob.City}`);
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                      }}
                    >
                      <div className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={14} className="text-primary" />
                        {(selectedJob as any).residency || 'Student Home Address'}, {selectedJob.Locations?.split(',')[0] || selectedJob.City}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-tight group-hover:text-primary transition-colors">Tap to check route on Google Maps →</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Schedule & Availability</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700">⏳ {(selectedJob as any).duration || '1 Hr/Day'}</span>
                      <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700">📅 {(selectedJob as any).days || 'Regular'}</span>
                      <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700">🕒 {(selectedJob as any).time || 'Flexible'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                <a 
                  href={`tel:${getCityPhone(selectedJob.City)}`}
                  className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center border-2 border-primary text-primary active:scale-95 transition-all"
                >
                  📞 Call
                </a>
                <a 
                  href={`https://wa.me/91${getCityPhone(selectedJob.City)}?text=${encodeURIComponent(`Hello Sir/Ma'am,\n\nExtremely interested in applying for *Order ID: ${selectedJob['Order ID']}*.\n\nI have carefully reviewed all the requirements. The preferred student time (${(selectedJob as any).time || 'Flexible'}), duration (${(selectedJob as any).duration || '1 hr'}), and the schedule (${(selectedJob as any).days || 'Regular'}) match my availability.\n\nWaiting for your positive response!\n\nThank you.`)}`}
                  target="_blank"
                  className="flex-[1.5] py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center bg-primary text-white shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  style={{ background: getCityTheme(selectedJob.City).grad }}
                >
                  💬 Apply Now
                </a>
              </div>
            </motion.div>
          </div>
        )}

        {selectedTutor && (
          <div className="fixed inset-0 z-[11000] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTutor(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              className="relative bg-[#F8FAFC] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
            >
              {/* Premium Header */}
              <div 
                className="p-8 text-center text-white relative shrink-0"
                style={{ background: `linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)` }}
              >
                <button onClick={() => setSelectedTutor(null)} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
                <div className="text-[20px] font-[800] text-[#FFD166] mb-1">
                   ✨ {selectedTutor['Full Name'] || (selectedTutor as any).fullName || 'Premium Tutor'}
                </div>
                <div className="text-[11px] font-[600] opacity-80 uppercase tracking-widest">🆔 Tutor ID: {selectedTutor['Tutor ID'] || (selectedTutor as any).tutorId || 'N/A'}</div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 p-5 bg-white/50 border-b border-slate-100">
                  <DetailStat emoji="🎂" label="Age" value={(selectedTutor as any).Age || (selectedTutor as any).age || '–'} />
                  <DetailStat emoji="👥" label="Gender" value={selectedTutor.Gender || (selectedTutor as any).gender || '–'} />
                  <DetailStat emoji="📍" label="City" value={selectedTutor['Preferred City'] || (selectedTutor as any).preferredCity || 'India'} />
                  <DetailStat emoji="💰" label="Fee" value={selectedTutor['Fee/Month'] || (selectedTutor as any).feeMonth || 'Flexible'} />
                </div>

                {/* About Me */}
                <div className="m-5 p-4 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
                  <span className="text-[10px] font-black uppercase text-emerald-600 mb-2 block tracking-widest">ℹ️ About Me</span>
                  <p className="text-[12px] text-slate-700 font-medium leading-relaxed">
                    {selectedTutor.About || (selectedTutor as any).about || (selectedTutor as any).Notes || 'Professional educator dedicated to student success.'}
                  </p>
                </div>

                {/* Content Sections */}
                <div className="p-6 space-y-6 bg-white">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Qualification</span>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTutor.Qualification || (selectedTutor as any).qualification || 'Graduate').split(',').map((q, i) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-bold text-blue-700">🎓 {q.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Expert Subjects</span>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTutor['Preferred Subject(s)'] || (selectedTutor as any).preferredSubjects || 'All Subjects').split(/[;,]/).map((s, i) => (
                        <span key={i} className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-700">📖 {s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Experience</span>
                      <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-[11px] font-bold text-purple-700 inline-block">
                        📚 {selectedTutor['Teaching Experience'] || (selectedTutor as any).experience || '1-3 Years'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Vehicle</span>
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700 inline-block">
                        🚗 {selectedTutor['Have own Vehicle'] || (selectedTutor as any).haveOwnVehicle || 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                <a 
                  href="tel:9971969197"
                  className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center border-2 border-[#FF6B6B] text-[#FF6B6B] active:scale-95 transition-all"
                >
                  📞 Call
                </a>
                <a 
                  href={`https://wa.me/919717018219?text=${encodeURIComponent(`Hi, I'm interested in Tutor: ${selectedTutor['Full Name'] || (selectedTutor as any).fullName}\nID: ${selectedTutor['Tutor ID'] || (selectedTutor as any).tutorId}`)}`}
                  target="_blank"
                  className="flex-[1.5] py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center bg-[#4ECDC4] text-white shadow-xl shadow-[#4ECDC4]/20 active:scale-95 transition-all"
                >
                  💬 Chat
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes mesh { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .mesh-gradient { background: linear-gradient(-45deg, #22c55e, #3b82f6, #10b981, #2563eb); background-size: 400% 400%; animation: mesh 15s ease infinite; }
        .dark select, .dark input[type="text"], .dark .stat-value { color: #0FE8F2 !important; }
      `}</style>

      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-black uppercase">{formType === 'teacher' ? 'Tutor Registration' : 'Requirement Details'}</h3>
                <button onClick={() => setShowFormModal(false)} className="p-3 bg-white rounded-2xl text-slate-400 shadow-sm"><X size={20} strokeWidth={3} /></button>
              </div>
              <div className="flex-1 overflow-y-auto"><iframe className="w-full h-full min-h-[600px] border-none" src={formType === 'teacher' ? 'https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8' : 'https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o'} /></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, icon, active = false, onClick }: { label: string; icon: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap active:scale-95",
      active 
        ? "bg-[#D1FAE5] text-[#10B981] border-[#10B981]" 
        : "bg-white text-slate-600 border-slate-100 hover:border-slate-200"
    )}>
      {icon}
      {label}
    </button>
  );
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

function NavButton({ active, onClick, icon, label, activeColor }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeColor: string }) {
  return (
    <button onClick={onClick} className={cn("flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 active:scale-110", active ? "bg-slate-50 " + activeColor + " shadow-inner" : "text-slate-400 hover:text-slate-600")}>
      {icon}<span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
