/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User as LucideUser, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap, ArrowRight, Navigation, Check, Sun, Cloud, Moon } from 'lucide-react';
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

  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<'parent' | 'teacher'>('parent');
  const [editUserType, setEditUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [editCity, setEditCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [isPreferenceMode, setIsPreferenceMode] = useState(false);

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
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

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
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any)) as JobLead[];
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
      setLoading(true);
      const [leadsRes, tutorsRes] = await Promise.all([fetch('/api/leads'), fetch('/api/tutors')]);
      const [leadsJson, tutorsJson] = await Promise.all([leadsRes.json(), tutorsRes.json()]);
      if (leadsJson.status === 'success') {
        const filteredJobs = (leadsJson.data as JobLead[])
          .filter(x => x['Internal Remark']?.trim().toLowerCase() === 'searching')
          .sort((a, b) => parseDate(b['Record Added'] || b['Updated Time']) - parseDate(a['Record Added'] || a['Updated Time']));
        setLeads(filteredJobs);
      } else {
        setLeads(leadsJson.data || []);
      }
      const rawTutors: TutorProfile[] = tutorsJson.data || [];
      rawTutors.sort((a, b) => parseDate((b as any)['Record Added'] || (b as any)['Updated Time']) - parseDate((a as any)['Record Added'] || (a as any)['Updated Time']));
      setTutors(rawTutors);
    } catch (err: any) {
      setError(err.message);
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
    return Array.from(unique.values());
  }, [leads, firestoreLeads]);

  const filteredJobs = useMemo(() => {
    return allLeads.filter(l => {
      if ((l['Internal Remark'] || '').trim().toLowerCase() !== 'searching') return false;
      if (!isCityMatch(l.City, cityFilter)) return false;
      if (selectedLocalities.length > 0) {
        const jLocs = (l.Locations || '').toLowerCase();
        if (!selectedLocalities.some(loc => jLocs.includes(loc.toLowerCase()))) return false;
      }
      
      // Preference Filters
      if (userGender && userGender !== 'any' && (l.Gender || '').toLowerCase() !== 'any' && (l.Gender || '').toLowerCase() !== userGender.toLowerCase()) return false;
      
      if (userClasses.length > 0) {
        const jClass = (l.Class || l.subjects || '').toLowerCase();
        if (!userClasses.some(uc => jClass.includes(uc.toLowerCase()))) return false;
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
  }, [allLeads, cityFilter, searchQuery, selectedLocalities, userGender, userClasses]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      const cityVal = (t['Preferred City'] || (t as any).preferredCity || (t as any).City || (t as any).city || 'India').toString().toLowerCase();
      if (!isCityMatch(cityVal, cityFilter)) return false;

      // Precision Filters
      if (tutorFilterID && !(t['Tutor ID'] || (t as any).tutorId || '').toString().toLowerCase().includes(tutorFilterID.toLowerCase())) return false;
      if (tutorFilterName && !(t['Full Name'] || (t as any).fullName || '').toString().toLowerCase().includes(tutorFilterName.toLowerCase())) return false;
      
      const tGender = (t.Gender || (t as any).gender || '').toString().toLowerCase();
      if (tutorFilterGender !== 'all' && tGender !== tutorFilterGender.toLowerCase()) return false;
      
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
        if (!userClasses.some(uc => tClass.includes(uc.toLowerCase()))) return false;
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
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans" ref={mainScrollRef}>
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg space-y-10 py-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto transform -rotate-6"><Zap size={32} /></div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Application Setup</h1>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[40px] space-y-8 border border-slate-100 dark:border-slate-700 shadow-xl">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-2"><LucideUser size={14} className="text-primary" /> Select Role</label>
                    <div className="relative">
                      <select value={editUserType || ''} onChange={e => setEditUserType(e.target.value as UserType)} className="w-full bg-white dark:bg-slate-900 p-5 pl-14 rounded-2xl text-sm font-black outline-none border-2 border-transparent focus:border-primary appearance-none cursor-pointer shadow-sm">
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
                      <select value={editCity} onChange={e => setEditCity(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-5 pl-14 rounded-2xl text-sm font-black outline-none border-2 border-transparent focus:border-primary appearance-none cursor-pointer shadow-sm">
                        {['Ghaziabad', 'Noida', 'Delhi', 'Gurgaon', 'Faridabad'].map(city => <option key={city} value={city}>{city}</option>)}
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
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] p-8 space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center"><h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Switch City</h3><button onClick={() => setShowFilterDrawer(false)} className="p-4 bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button onClick={() => { setCityFilter('all'); setSelectedLocalities([]); resetCounts(); setShowFilterDrawer(false); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase transition-all", cityFilter === 'all' ? "bg-slate-900 dark:bg-[#0FE8F2]/10 text-white dark:text-[#0FE8F2]" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>All Cities</button>
                {dynamicCities.slice(0, 100).map(c => (
                  <button key={c} onClick={() => { setCityFilter(c); setSelectedLocalities([]); resetCounts(); setShowFilterDrawer(false); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase truncate transition-all", cityFilter === c ? "bg-primary text-white dark:text-[#0FE8F2]" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>{c}</button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdvancedFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdvancedFilterDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] p-8 space-y-6 max-h-[90vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Precision Filters</h3>
                  <div className="bg-primary/10 px-3 py-1 rounded-xl border border-primary/20"><span className="text-[11px] font-black text-primary uppercase">{activeTab === 'tutors' ? activeTutorsCount : activeLeadsCount} Matches</span></div>
                </div>
                <button onClick={() => setShowAdvancedFilterDrawer(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-8 py-4 pr-2">
                {/* 1. Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{activeTab === 'tutors' ? 'Tutor ID' : 'Order ID'}</label>
                    <input type="text" placeholder="Search ID..." value={activeTab === 'tutors' ? tutorFilterID : searchQuery} onChange={e => { activeTab === 'tutors' ? setTutorFilterID(e.target.value) : setSearchQuery(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]" />
                  </div>
                  {activeTab === 'tutors' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Name Search</label>
                      <input type="text" placeholder="Search Name..." value={tutorFilterName} onChange={e => { setTutorFilterName(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]" />
                    </div>
                  )}
                  {activeTab === 'jobs' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Job Subject / Board</label>
                      <input type="text" placeholder="e.g. Maths, CBSE..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]" />
                    </div>
                  )}
                </div>

                {activeTab === 'jobs' && cityFilter !== 'all' && cityLocations.length > 0 && (
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
                            className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all border", isSelected ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700")}
                          >
                            {loc}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'tutors' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Gender</label><select value={tutorFilterGender} onChange={e => { setTutorFilterGender(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]"><option value="all">Any</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Own Vehicle</label><select value={tutorFilterVehicle} onChange={e => { setTutorFilterVehicle(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]"><option value="all">Any</option><option value="yes">Yes</option><option value="no">No</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Experience</label><select value={tutorFilterExperience} onChange={e => { setTutorFilterExperience(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]"><option value="all">Any Exp</option><option value="0">Fresher</option><option value="1">1-2 Yrs</option><option value="3">3-5 Yrs</option><option value="5">5+ Yrs</option></select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qualification</label><select value={tutorFilterQualification} onChange={e => { setTutorFilterQualification(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]"><option value="all">Any</option><option value="graduate">Graduate</option><option value="postgraduate">Post-Graduate</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Shift</label><select value={tutorFilterTime} onChange={e => { setTutorFilterTime(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]"><option value="all">Any Time</option><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option></select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Status</label><select value={tutorFilterStatus} onChange={e => { setTutorFilterStatus(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-[#0FE8F2]"><option value="all">Any Status</option><option value="active">✅ Active</option><option value="suspended">🚫 Suspended</option></select></div>
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
                                setUserClasses(prev => isSelected ? prev.filter(x => x !== cls) : [...prev, cls]);
                                resetCounts();
                              }}
                              className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all border", isSelected ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700")}
                            >
                              {cls}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                  <button onClick={clearFilters} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">Clear</button>
                  <button onClick={() => setShowAdvancedFilterDrawer(false)} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Apply</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className={cn("p-[20px_16px] sm:p-[30px_20px] text-center border-b relative transition-all duration-500 overflow-hidden", userCity ? "text-white border-transparent" : "bg-white border-slate-50")} style={userCity ? { background: getCityTheme(userCity).grad } : {}}>
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10">{currentUser && <button onClick={() => firebaseAuth.signOut()} className="text-white/70 hover:text-white transition-colors"><LogOut size={18} /></button>}</div>
        <h1 className="text-[24px] sm:text-[32px] font-[900] tracking-tighter relative z-10">
          {activeTab === 'home' && (<div className="flex flex-col items-center"><span className="truncate max-w-[280px] sm:max-w-none">{userName ? `Welcome, ${userName}` : (userType === 'teacher' ? 'Welcome, Educator' : (userType === 'parent' ? 'Welcome, Parent' : 'DoAble India'))}</span><span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-80 mt-1 animate-pulse">{getDynamicGreeting()}</span></div>)}
          {activeTab === 'jobs' && 'Jobs Portal'}{activeTab === 'tutors' && 'Expert Tutors'}{activeTab === 'alerts' && 'Broadcasts'}
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 relative z-10">
          <div className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10"><span className="text-[9px] font-black uppercase text-white">{activeLeadsCount} Jobs</span></div>
          <div className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10"><span className="text-[9px] font-black uppercase text-white">{activeTutorsCount} Tutors</span></div>
        </div>
      </header>

      <main className="container mx-auto p-0 sm:p-[10px] max-w-[1200px] pb-32">
        {activeTab === 'home' && (
          <div className="space-y-12 py-6 flex flex-col items-center px-4 sm:px-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full min-h-[45vh] sm:min-h-[450px] p-8 sm:p-20 rounded-[48px] sm:rounded-[64px] relative overflow-hidden shadow-2xl border border-white/10 mesh-gradient flex items-center">
              <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] z-0" />
              <div className="relative z-10 space-y-10 w-full">
                 <div className="space-y-6 text-center sm:text-left">
                    <h3 className="text-4xl sm:text-7xl font-[900] text-white tracking-tighter leading-[1.05]">Discovery Made<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE66D] to-white">Simple & Live</span></h3>
                    <p className="text-white/85 text-sm sm:text-xl font-medium leading-[1.6] max-w-2xl">Connect with elite educators and premium teaching opportunities.</p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-5">
                    <button onClick={() => { playTapSound(); setFormType('teacher'); setShowFormModal(true); }} className="bg-[#FFE66D] text-slate-900 px-10 py-6 rounded-[28px] font-[900] text-sm uppercase flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all group"><GraduationCap size={22} /> Become a Tutor</button>
                    <button onClick={() => { playTapSound(); setFormType('parent'); setShowFormModal(true); }} className="bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 px-10 py-6 rounded-[28px] font-[900] text-sm uppercase flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all group"><Sparkles size={20} className="text-[#FFE66D]" /> Book Free Trial</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
        {activeTab === 'alerts' && (
          <AlertsView 
            city={userCity || 'All'} userGender={userGender} userClasses={userClasses} userType={userType} 
            setUserCity={setUserCity} setUserGender={setUserGender} setUserClasses={setUserClasses} setUserType={setUserType}
            isAdminUser={isAdminUser} onAdminClick={() => setActiveTab('admin')} currentUser={currentUser} 
            handleSignIn={handleSignIn} showFormModal={showFormModal} setShowFormModal={setShowFormModal}
            userName={userName} setUserName={setUserName}
          />
        )}
        {activeTab === 'admin' && isAdminUser && <AdminPanel currentCity={userCity || 'All'} />}
        {(activeTab === 'jobs' || activeTab === 'tutors') && (
          <div className="flex flex-col space-y-4">
              <div className="sticky top-0 z-40 py-2 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md space-y-2 shrink-0 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] flex gap-1 items-center justify-between mx-4">
                  <span className="px-4 py-3 text-[9px] font-black uppercase text-slate-500 dark:text-[#0FE8F2]">
                    {cityFilter !== 'all' ? `📍 ${cityFilter}` : (activeTab === 'jobs' ? 'Searching Jobs' : 'Expert Tutors')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setShowFilterDrawer(true)} className="bg-white dark:bg-slate-900 p-3 rounded-xl text-primary shadow-sm"><MapPin size={14} /></button>
                    <button onClick={() => setShowAdvancedFilterDrawer(true)} className="bg-white dark:bg-slate-900 p-3 rounded-xl text-primary shadow-sm"><Filter size={14} /></button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0 pb-10">
                {loading ? (<div className="col-span-full py-40 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /></div>) : activeTab === 'jobs' ? (
                  <>{filteredJobs.slice(0, visibleJobsCount).map((job) => (<JobCard key={(job as any).id || job['Order ID']} job={job} />))}{visibleJobsCount < filteredJobs.length && (<div className="col-span-full py-10 flex justify-center"><button onClick={() => setVisibleJobsCount(prev => prev + 10)} className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all">Load More Jobs</button></div>)}</>
                ) : (
                  <>{filteredTutors.slice(0, visibleTutorsCount).map((tutor) => (<TutorCard key={(tutor as any).id || (tutor as any)['Tutor ID']} tutor={tutor} />))}{visibleTutorsCount < filteredTutors.length && (<div className="col-span-full py-10 flex justify-center"><button onClick={() => setVisibleTutorsCount(prev => prev + 10)} className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all">Load More Tutors</button></div>)}</>
                )}
              </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8000] w-[92%] max-w-[500px]">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[32px] p-2 flex items-center justify-between shadow-2xl border border-white/10 relative">
          <NavButton active={activeTab === 'home'} onClick={() => { playTapSound(); setActiveTab('home'); window.scrollTo(0,0); }} icon={<HomeIcon size={20} />} label="Home" />
          <NavButton active={activeTab === 'jobs'} onClick={() => { playTapSound(); setActiveTab('jobs'); window.scrollTo(0,0); }} icon={<FileText size={20} />} label="Jobs" />
          <NavButton active={activeTab === 'tutors'} onClick={() => { playTapSound(); setActiveTab('tutors'); window.scrollTo(0,0); }} icon={<GraduationCap size={20} />} label="Tutors" />
          <NavButton active={activeTab === 'alerts'} onClick={() => { playTapSound(); setActiveTab('alerts'); window.scrollTo(0,0); }} icon={<Bell size={20} />} label="Alerts" />
          {isAdminUser && (<button onClick={() => { playTapSound(); setActiveTab('admin'); }} className={cn("absolute -top-16 right-0 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 transition-all active:scale-95", activeTab === 'admin' ? "bg-primary text-white" : "hover:bg-slate-50")}><Settings size={20} /></button>)}
        </div>
      </nav>
      <style>{`
        @keyframes mesh { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .mesh-gradient { background: linear-gradient(-45deg, #22c55e, #3b82f6, #10b981, #2563eb); background-size: 400% 400%; animation: mesh 15s ease infinite; }
        .dark select, .dark input[type="text"], .dark .stat-value { color: #0FE8F2 !important; }
      `}</style>

      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
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

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 py-3 px-5 rounded-2xl transition-all duration-300 active:scale-110", active ? "bg-white text-slate-900 shadow-lg" : "text-white/40 hover:text-white")}>
      {icon}<span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
