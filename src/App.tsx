/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap, ArrowRight, Navigation, Check, Sun, Cloud, Moon } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth, auth as firebaseAuth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
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

// ─── Notification audio (singleton) ─────────────────────────────────
const ALERT_TONE_URL = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
function playNotificationTone() {
  try {
    const a = new Audio(ALERT_TONE_URL);
    a.volume = 0.6;
    a.play().catch(() => {});
  } catch {}
}

export default function App() {
  // ─── Core data ───────────────────────────────────────────────────
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [firestoreLeads, setFirestoreLeads] = useState<JobLead[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);

  // ─── User preferences ────────────────────────────────────────────
  const [userCity, setUserCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userGender, setUserGender] = useState<string | null>(localStorage.getItem('userGender'));
  const [userType, setUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [userClasses, setUserClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  const [userTutorSubjects, setUserTutorSubjects] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorSubjects') || '[]'));

  // ─── UI state ────────────────────────────────────────────────────
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

  const resetCounts = useCallback(() => {
    setVisibleJobsCount(10);
    setVisibleTutorsCount(10);
  }, []);

  // ─── Tutor Filters state ─────────────────────────────────────────
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

  // ... rest of the state ...

  // Update clear filters function to use resetCounts
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

  // Update all occurrences in JSX that reset counts to use resetCounts() or clearFilters()
  // This is a large change, let's do it carefully.
  // Actually, I'll just replace the whole Drawer JSX and the tab headers.

  // ─── Simplified Onboarding ───────────────────────────────────────
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSelectingCityOnly, setIsSelectingCityOnly] = useState(false);
  const [editUserType, setEditUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [editCity, setEditCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [areaSearch, setAreaSearch] = useState('');

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const typewriterCity = useTypewriter(userCity, 70);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

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
      console.error("Sign in error:", err);
      setError("Login failed: " + err.message);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler as any);
    return () => window.removeEventListener('beforeinstallprompt', handler as any);
  }, []);

  useEffect(() => {
    loadData();
    const qLeads = query(collection(db, 'leads'), orderBy('Updated Time', 'desc'), limit(50));
    const unsub = onSnapshot(qLeads, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any)) as JobLead[];
      setFirestoreLeads(data);
    });
    return () => unsub();
  }, []);

  // ─── Robust Date Parser ──────────────────────────────────────────
  const parseDate = useCallback((dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const s = dateStr.toString().trim();
    const parts = s.split(/[\/\-\s:]/);
    if (parts.length >= 3) {
      let day, month, year;
      if (parts[0].length === 4) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[2]);
      } else if (parts[2].length === 4 || parts[2].length === 2) {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
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
      const [leadsRes, tutorsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/tutors')
      ]);
      const [leadsJson, tutorsJson] = await Promise.all([leadsRes.json(), tutorsRes.json()]);
      if (leadsJson.status === 'success') {
        const filteredJobs = (leadsJson.data as JobLead[])
          .filter(x => x['Internal Remark']?.trim().toLowerCase() === 'searching')
          .sort((a, b) => {
             const ta = parseDate(a['Record Added'] || a['Updated Time']);
             const tb = parseDate(b['Record Added'] || b['Updated Time']);
             return tb - ta;
          });
        setLeads(filteredJobs);
      } else {
        setLeads(leadsJson.data || []);
      }
      
      const rawTutors: TutorProfile[] = tutorsJson.data || [];
      rawTutors.sort((a, b) => {
        const ta = parseDate((a as any)['Record Added'] || (a as any).recordAdded || (a as any)['Updated Time']);
        const tb = parseDate((b as any)['Record Added'] || (b as any).recordAdded || (b as any)['Updated Time']);
        return tb - ta;
      });
      setTutors(rawTutors);
      setError(null);
    } catch (err: any) {
      setError(`Failed to load data: ${err.message || 'Unknown Error'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectUserType = (type: UserType) => {
    playNotificationTone();
    setEditUserType(type);
    setUserType(type);
    localStorage.setItem('userType', type);
    setOnboardingStep(1);
  };

  const completeOnboarding = () => {
    localStorage.setItem('userType', editUserType || userType || '');
    localStorage.setItem('userCity', editCity);
    localStorage.removeItem('userClasses');
    localStorage.removeItem('userTutorSubjects');
    
    setUserType(editUserType || userType);
    setUserCity(editCity);
    setCityFilter(editCity);
    setUserClasses([]);
    setUserTutorSubjects([]);
    
    resetCounts();
    setLocationBypass(null);
    setShowOnboarding(false);
    setIsSelectingCityOnly(false);

    const resolved = editUserType || userType;
    if (resolved === 'parent') setActiveTab('tutors');
    else if (resolved === 'teacher') setActiveTab('jobs');
    else setActiveTab('home');
  };

  const getSubjects = useCallback((t: TutorProfile) => {
    const raw = (t['Preferred Subject(s)'] || (t as any).preferredSubjects || (t as any).subjects || '').toString();
    return raw.split(/[;,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  }, []);

  const getCityValue = useCallback((t: TutorProfile) => (t['Preferred City'] || (t as any).preferredCity || (t as any).City || (t as any).city || 'India').toString().trim().toLowerCase(), []);

  const isCityMatch = useCallback((city: string | undefined, filter: string) => {
    if (!city) return false;
    if (filter.toLowerCase() === 'all') return true;
    const c = city.toString().toLowerCase().trim();
    const f = filter.toLowerCase().trim();
    return c.includes(f) || f.includes(c);
  }, []);

  const isClassMatch = useCallback((classes: string | undefined, uClasses: string[]) => {
    if (!classes || uClasses.length === 0) return true;
    const lc = classes.toString().toLowerCase();
    
    return uClasses.some(uClass => {
      const luClass = uClass.toLowerCase();
      // Direct match
      if (lc.includes(luClass) || luClass.includes(lc)) return true;
      
      // Group match: if user selected a group, check if any class in that group matches the item's class
      const groupClasses = CLASS_GROUP_MAPPING[uClass] || [];
      if (groupClasses.some(gc => lc.includes(gc.toLowerCase()) || gc.toLowerCase().includes(lc))) return true;
      
      return false;
    });
  }, []);

  const allLeads = useMemo(() => {
    const combined = [...firestoreLeads, ...leads];
    const unique = new Map<string, JobLead>();
    combined.forEach(l => { const id = l['Order ID'] || (l as any).id; if (id && !unique.has(id)) unique.set(id, l); });
    return Array.from(unique.values());
  }, [leads, firestoreLeads]);

  const filteredJobs = useMemo(() => {
    return allLeads.filter(l => {
      const remark = (l['Internal Remark'] || '').trim().toLowerCase();
      if (remark !== 'searching') return false;
      
      if (!isCityMatch(l.City, cityFilter)) return false;

      if (selectedLocalities.length > 0) {
        const jLocs = (l.Locations || '').toLowerCase();
        if (!selectedLocalities.some(loc => jLocs.includes(loc.toLowerCase()))) return false;
      }

      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        const jSubj = (l.subjects || '').toLowerCase();
        const jName = (l.Name || '').toLowerCase();
        const jID = (l['Order ID'] || '').toLowerCase();
        if (!(jName.includes(sl) || jSubj.includes(sl) || jID.includes(sl))) return false;
      }

      if (userClasses.length > 0) {
        const jClass = (l['Class / Board'] || l.Class || '').toString();
        if (!isClassMatch(jClass, userClasses)) return false;
      }

      if (userTutorSubjects.length > 0) {
        const jSubj = (l.subjects || '').toLowerCase();
        const uS = userTutorSubjects.map(s => s.toLowerCase().trim());
        if (!uS.some(us => jSubj.includes(us))) return false;
      }

      return true;
    });
  }, [allLeads, cityFilter, searchQuery, isCityMatch, selectedLocalities, userClasses, userTutorSubjects, isClassMatch]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      if (!t) return false;
      
      const tCity = (t['Preferred City'] || (t as any).preferredCity || (t as any).City || (t as any).city || '').toString();
      
      if (!isCityMatch(tCity, cityFilter)) return false;

      if (selectedLocalities.length > 0) {
        const tLocs = (t['Preferred Location(s)'] || (t as any).preferredLocations || '').toString().toLowerCase();
        if (!selectedLocalities.some(loc => tLocs.includes(loc.toLowerCase()))) return false;
      }

      const tID = (t['Tutor ID'] || (t as any).tutorId || (t as any).id || '').toString().toLowerCase();
      if (tutorFilterID && !tID.includes(tutorFilterID.toLowerCase())) return false;
      const tName = (t.Name || (t as any).name || '').toString().toLowerCase();
      if (tutorFilterName && !tName.includes(tutorFilterName.toLowerCase())) return false;
      
      const tGender = (t.Gender || (t as any).gender || 'any').toString().toLowerCase().trim();
      if (tutorFilterGender !== 'all' && tGender !== tutorFilterGender.toLowerCase()) return false;
      
      if (tutorFilterVehicle !== 'all') {
        const vRaw = (t['Have own Vehicle'] || (t as any).haveOwnVehicle || '').toString().toLowerCase();
        const hasVehicle = vRaw.includes('yes') || vRaw === 'y';
        if (tutorFilterVehicle === 'yes' && !hasVehicle) return false;
        if (tutorFilterVehicle === 'no' && hasVehicle) return false;
      }

      if (tutorFilterSchoolExp !== 'all') {
        const sExp = (t['School Exp.'] || (t as any).schoolExp || '').toString().toLowerCase();
        const hasSExp = sExp.includes('yes') || (sExp !== 'no' && sExp.length > 1);
        if (tutorFilterSchoolExp === 'yes' && !hasSExp) return false;
        if (tutorFilterSchoolExp === 'no' && hasSExp) return false;
      }

      if (tutorFilterExperience !== 'all') {
         const exp = (t.Experience || (t as any).experience || '').toString().toLowerCase();
         if (tutorFilterExperience === 'fresher' && !exp.includes('fresher') && !exp.includes('0')) return false;
         if (tutorFilterExperience === '1-3' && !exp.includes('1') && !exp.includes('2') && !exp.includes('3')) return false;
         if (tutorFilterExperience === '3-5' && !exp.includes('3') && !exp.includes('4') && !exp.includes('5')) return false;
         if (tutorFilterExperience === '5+' && !exp.includes('5') && !exp.includes('6') && !exp.includes('more') && !exp.includes('10')) return false;
      }
      
      const tQual = (t['Qualification(s)'] || (t as any).qualifications || '').toString().toLowerCase();
      if (tutorFilterQualification !== 'all' && !tQual.includes(tutorFilterQualification.toLowerCase())) return false;
      
      const tTime = (t['Preferred Time'] || (t as any).preferredTime || '').toString().toLowerCase();
      if (tutorFilterTime !== 'all') {
         if (tutorFilterTime === 'Morning' && !tTime.includes('morning') && !tTime.includes('am')) return false;
         if (tutorFilterTime === 'Afternoon' && !tTime.includes('afternoon') && !tTime.includes('pm')) return false;
         if (tutorFilterTime === 'Evening' && !tTime.includes('evening') && !tTime.includes('pm')) return false;
      }

      if (tutorFilterDay !== 'all') {
        const tDays = (t['Mode of Teaching'] || (t as any).modeOfTeaching || '').toString().toLowerCase();
        if (tutorFilterDay === 'Weekdays' && !tDays.includes('weekday') && !tDays.includes('mon')) return false;
        if (tutorFilterDay === 'Weekend' && !tDays.includes('weekend') && !tDays.includes('sat')) return false;
      }

      if (tutorFilterFee !== 'all') {
        const fee = parseInt((t['Fee/Month'] || '0').toString().replace(/[^0-9]/g, '')) || 0;
        if (tutorFilterFee === '0-300' && (fee < 0 || fee > 300)) return false;
        if (tutorFilterFee === '300-600' && (fee < 300 || fee > 600)) return false;
        if (tutorFilterFee === '600-1000' && (fee < 600 || fee > 1000)) return false;
        if (tutorFilterFee === '1000+' && fee < 1000) return false;
      }

      if (tutorFilterStatus !== 'all') {
        const tStat = (t.Status || (t as any).status || 'active').toString().toLowerCase();
        if (tutorFilterStatus === 'active' && tStat !== 'active' && tStat !== 'searching') return false;
        if (tutorFilterStatus === 'notavailable' && tStat !== 'not available' && tStat !== 'busy' && tStat !== 'no') return false;
        if (tutorFilterStatus === 'suspended' && tStat !== 'suspended') return false;
      }

      if (tutorFilterDate !== 'all') {
         const added = parseDate(t['Record Added'] || (t as any).recordAdded);
         const diffDays = (Date.now() - added) / (1000 * 3600 * 24);
         const limitDays = parseInt(tutorFilterDate);
         if (diffDays > limitDays) return false;
      }

      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        const tSubj = (t['Preferred Subject(s)'] || (t as any).subjects || '').toString().toLowerCase();
        if (!(tName.includes(sl) || tID.includes(sl) || tSubj.includes(sl))) return false;
      }
      
      if (userClasses.length > 0) {
        const tClass = (t['Preferred Class Group'] || (t as any).classGroup || '').toString();
        if (!isClassMatch(tClass, userClasses)) return false;
      }
      if (userTutorSubjects.length > 0) {
        const tS = getSubjects(t);
        const uS = userTutorSubjects.map(s => s.toLowerCase().trim());
        if (!uS.some(us => tS.some(ts => ts === us || ts.includes(us)))) return false;
      }
      return true;
    });
  }, [tutors, cityFilter, searchQuery, userClasses, userTutorSubjects, isCityMatch, isClassMatch, getSubjects, selectedLocalities, tutorFilterID, tutorFilterName, tutorFilterGender, tutorFilterVehicle, tutorFilterExperience, tutorFilterQualification, tutorFilterTime, tutorFilterDate, tutorFilterDay, tutorFilterFee, tutorFilterStatus, tutorFilterSchoolExp, parseDate]);

  const activeLeadsCount = useMemo(() => filteredJobs.length, [filteredJobs]);
  const activeTutorsCount = useMemo(() => filteredTutors.length, [filteredTutors]);

  const subjectsForSelectedClasses = useMemo(() => {
    const subjectSet = new Set<string>();
    userClasses.forEach(cls => { (CLASS_SUBJECTS_DATA[cls] || []).forEach(s => subjectSet.add(s)); });
    return Array.from(subjectSet);
  }, [userClasses]);

  const dynamicCities = useMemo(() => {
    const citySet = new Set<string>(CITIES_LIST);
    tutors.forEach(t => {
      const c = (t['Preferred City'] || (t as any).preferredCity || (t as any).City || (t as any).city || '').toString().trim();
      if (c && c.toLowerCase() !== 'india') {
        const normalized = c.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        citySet.add(normalized);
      }
    });
    allLeads.forEach(l => {
      const c = (l.City || '').toString().trim();
      if (c && c.toLowerCase() !== 'india') {
        const normalized = c.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        citySet.add(normalized);
      }
    });
    return Array.from(citySet).sort();
  }, [tutors, allLeads]);
  const cityLocations = useMemo(() => {
    if (cityFilter === 'all') return [];
    
    // STRICTLY use mapping data from constants. Polluted raw data from DB is ignored here.
    const lcf = cityFilter.toLowerCase().trim();
    const dataKey = Object.keys(CITY_TO_LOCATIONS_DATA).find(k => k.toLowerCase().trim() === lcf);
    const locSet = new Set<string>(dataKey ? CITY_TO_LOCATIONS_DATA[dataKey] : []);

    return Array.from(locSet).sort();
  }, [cityFilter]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans" ref={mainScrollRef}>
      {/* Simplified 2-Step Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-4 sm:p-10 overflow-y-auto">
            <div className="w-full max-w-lg space-y-6 sm:space-y-10">
              {onboardingStep === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 sm:space-y-8">
                  <div className="flex flex-col items-center gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary text-white rounded-[30px] sm:rounded-[40px] flex items-center justify-center shadow-2xl shadow-primary/30 transform -rotate-6">
                      <Zap size={40} className="sm:w-12 sm:h-12 animate-pulse" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight sm:leading-none">Welcome to<br/>DoAbLe India</h1>
                      <p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">Premium Tuition Hub</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button onClick={() => selectUserType('parent')} className="bg-slate-50 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 active:scale-95 border border-slate-100">
                      <User size={28} className="sm:w-8 sm:h-8 text-primary/60" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">I'm Parent</span>
                    </button>
                    <button onClick={() => selectUserType('teacher')} className="bg-slate-900 text-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 active:scale-95">
                      <GraduationCap size={28} className="sm:w-8 sm:h-8 text-primary" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">I'm Tutor</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-10 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><MapPin size={24} /></div>
                    <div><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Territory</h3><p className="text-[10px] font-black text-primary uppercase">Select Primary City</p></div>
                  </div>
                  <div className="space-y-6">
                    <input type="text" placeholder="Search your city..." value={areaSearch} onChange={e => setAreaSearch(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100" />
                    <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-2 custom-scrollbar">
                      {dynamicCities.filter(c => c.toLowerCase().includes(areaSearch.toLowerCase())).map(city => (
                        <button key={city} onClick={() => setEditCity(city)} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase transition-all border", editCity === city ? "bg-primary text-white border-primary shadow-lg" : "bg-slate-50 text-slate-400 border-slate-100")}>{city}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {!isSelectingCityOnly && <button onClick={() => setOnboardingStep(0)} className="w-full bg-slate-100 text-slate-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">Change Role</button>}
                      <button onClick={completeOnboarding} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 active:scale-95 transition-all">Submit Preference</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* City Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] p-8 space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Switch City</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="p-4 bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-2">
                <button onClick={() => { setCityFilter('all'); setLocationBypass(null); resetCounts(); setShowFilterDrawer(false); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase", cityFilter === 'all' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>All Cities</button>
                {dynamicCities.map(c => (
                  <button key={c} onClick={() => { setCityFilter(c); setLocationBypass(null); resetCounts(); setShowFilterDrawer(false); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase truncate", cityFilter === c ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>{c}</button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Advanced Filter Drawer */}
      <AnimatePresence>
        {showAdvancedFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdvancedFilterDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] p-8 space-y-6 max-h-[90vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Advanced Filters</h3>
                    <p className="text-[10px] font-black text-primary uppercase">Precision {activeTab === 'tutors' ? 'tutor' : 'job'} search</p>
                  </div>
                  <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 flex flex-col items-center">
                    <span className="text-[14px] font-black text-primary leading-none">{activeTab === 'tutors' ? activeTutorsCount : activeLeadsCount}</span>
                    <span className="text-[8px] font-black text-primary/60 uppercase tracking-tighter">Matches</span>
                  </div>
                </div>
                <button onClick={() => setShowAdvancedFilterDrawer(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-8 py-4 pr-2">
                {/* 1. Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{activeTab === 'tutors' ? 'Tutor ID / Name' : 'Order ID / Subject'}</label>
                    <input type="text" placeholder={activeTab === 'tutors' ? "Search ID or Name..." : "Search ID or Subject..."} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); resetCounts(); }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700" />
                  </div>
                </div>

                {/* 2. City & Localities */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Primary City (Pick List)</label>
                    <div className="relative">
                      <select 
                        value={cityFilter} 
                        onChange={e => { setCityFilter(e.target.value); setSelectedLocalities([]); resetCounts(); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 pl-12 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none appearance-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value="all">All Cities</option>
                        {dynamicCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                    </div>
                  </div>
                  
                  {cityFilter !== 'all' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Localities in {cityFilter} (Multipick)</label>
                        {selectedLocalities.length > 0 && <button onClick={() => { setSelectedLocalities([]); resetCounts(); }} className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors">Clear All</button>}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-[32px] space-y-4 border border-slate-100 dark:border-slate-700 shadow-inner">
                        <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                           <button 
                             onClick={() => { setSelectedLocalities([]); resetCounts(); }} 
                             className={cn("px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all border shadow-sm", selectedLocalities.length === 0 ? "bg-slate-900 text-white border-slate-900" : "bg-white dark:bg-slate-700 text-slate-400 border-slate-100 dark:border-slate-600 hover:border-primary/50")}
                           >
                             📍 Whole City
                           </button>
                           {cityLocations.map(loc => {
                             const isActive = selectedLocalities.includes(loc);
                             return (
                               <button 
                                 key={loc} 
                                 onClick={() => { setSelectedLocalities(prev => isActive ? prev.filter(l => l !== loc) : [...prev, loc]); resetCounts(); }} 
                                 className={cn("px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all border flex items-center gap-2 shadow-sm active:scale-95", isActive ? "bg-primary text-white border-primary shadow-primary/20" : "bg-white dark:bg-slate-700 text-slate-400 border-slate-100 dark:border-slate-600 hover:border-primary/50")}
                               >
                                 {isActive ? <CheckCircle size={12} strokeWidth={4} /> : <div className="w-3 h-3 rounded-full border-2 border-slate-200 dark:border-slate-500" />}
                                 {loc}
                               </button>
                             );
                           })}
                        </div>
                        {selectedLocalities.length > 0 && (
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                             <p className="text-[9px] font-black text-primary uppercase text-center tracking-[0.1em]">{selectedLocalities.length} Areas Selected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Gender Requirement */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Gender Requirement (Pick List)</label>
                  <select 
                    value={tutorFilterGender} 
                    onChange={e => { setTutorFilterGender(e.target.value); resetCounts(); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                  >
                    <option value="all">Any Gender</option>
                    <option value="male">👨 Male</option>
                    <option value="female">👩 Female</option>
                  </select>
                </div>

                {/* 4. Classes & Subjects */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Class Group (Pick List)</label>
                    <div className="relative">
                      <select 
                        value={userClasses[0] || 'all'} 
                        onChange={e => { const val = e.target.value; setUserClasses(val === 'all' ? [] : [val]); setUserTutorSubjects([]); resetCounts(); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 pl-12 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value="all">All Classes</option>
                        {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                    </div>
                  </div>

                  {userClasses.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Subjects for {userClasses[0]} (Multipick)</label>
                        {userTutorSubjects.length > 0 && <button onClick={() => { setUserTutorSubjects([]); resetCounts(); }} className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors">Clear All</button>}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-[32px] space-y-4 border border-slate-100 dark:border-slate-700 shadow-inner">
                        <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                           <button 
                             onClick={() => { setUserTutorSubjects([]); resetCounts(); }} 
                             className={cn("px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all border shadow-sm", userTutorSubjects.length === 0 ? "bg-slate-900 text-white border-slate-900" : "bg-white dark:bg-slate-700 text-slate-400 border-slate-100 dark:border-slate-600 hover:border-primary/50")}
                           >
                             📚 All Subjects
                           </button>
                           {subjectsForSelectedClasses.map(s => {
                             const isActive = userTutorSubjects.includes(s);
                             return (
                               <button 
                                 key={s} 
                                 onClick={() => { setUserTutorSubjects(prev => isActive ? prev.filter(x => x !== s) : [...prev, s]); resetCounts(); }} 
                                 className={cn("px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all border flex items-center gap-2 shadow-sm active:scale-95", isActive ? "bg-primary text-white border-primary shadow-primary/20" : "bg-white dark:bg-slate-700 text-slate-400 border-slate-100 dark:border-slate-600 hover:border-primary/50")}
                               >
                                 {isActive ? <CheckCircle size={12} strokeWidth={4} /> : <div className="w-3 h-3 rounded-full border-2 border-slate-200 dark:border-slate-500" />}
                                 {s}
                               </button>
                             );
                           })}
                        </div>
                        {userTutorSubjects.length > 0 && (
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                             <p className="text-[9px] font-black text-primary uppercase text-center tracking-[0.1em]">{userTutorSubjects.length} Subjects Selected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {activeTab === 'tutors' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 5. Time Slot */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Time Slot (Pick List)</label>
                        <select 
                          value={tutorFilterTime} 
                          onChange={e => { setTutorFilterTime(e.target.value); resetCounts(); }}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                        >
                          <option value="all">Any Time</option>
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                        </select>
                      </div>

                      {/* 6. Day Groups */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Day Groups (Pick List)</label>
                        <select 
                          value={tutorFilterDay} 
                          onChange={e => { setTutorFilterDay(e.target.value); resetCounts(); }}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                        >
                          <option value="all">Any Days</option>
                          <option value="Weekdays">Weekdays</option>
                          <option value="Weekend">Weekend</option>
                        </select>
                      </div>
                    </div>

                    {/* 7. Fee Range */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Monthly Fee Range (Pick List)</label>
                      <select 
                        value={tutorFilterFee} 
                        onChange={e => { setTutorFilterFee(e.target.value); resetCounts(); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value="all">Any Fee</option>
                        <option value="0-300">₹0-300</option>
                        <option value="300-600">₹300-600</option>
                        <option value="600-1000">₹600-1000</option>
                        <option value="1000+">₹1000+</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 8. Experience */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Experience (Pick List)</label>
                        <select 
                          value={tutorFilterExperience} 
                          onChange={e => { setTutorFilterExperience(e.target.value); resetCounts(); }}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                        >
                          <option value="all">Any Experience</option>
                          <option value="fresher">Fresher (0 years)</option>
                          <option value="1-3">1-3 Years</option>
                          <option value="3-5">3-5 Years</option>
                          <option value="5+">5+ Years</option>
                        </select>
                      </div>

                      {/* 9. School Exp */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">School Exp. (Pick List)</label>
                        <select 
                          value={tutorFilterSchoolExp} 
                          onChange={e => { setTutorFilterSchoolExp(e.target.value); resetCounts(); }}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                        >
                          <option value="all">Any</option>
                          <option value="yes">With School Experience</option>
                          <option value="no">Without School Experience</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 10. Own Vehicle */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Own Vehicle (Pick List)</label>
                        <select 
                          value={tutorFilterVehicle} 
                          onChange={e => { setTutorFilterVehicle(e.target.value); resetCounts(); }}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                        >
                          <option value="all">Any</option>
                          <option value="yes">Has Own Vehicle</option>
                          <option value="no">No Vehicle</option>
                        </select>
                      </div>

                      {/* 11. Profile Recency */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Recency (Pick List)</label>
                        <select 
                          value={tutorFilterDate} 
                          onChange={e => { setTutorFilterDate(e.target.value); resetCounts(); }}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                        >
                          <option value="all">Anytime</option>
                          <option value="7">Last 7 Days</option>
                          <option value="30">Last 30 Days</option>
                          <option value="90">Last 90 Days</option>
                          <option value="180">Last 180 Days</option>
                        </select>
                      </div>
                    </div>

                    {/* 12. Account Status */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Account Status (Pick List)</label>
                      <select 
                        value={tutorFilterStatus} 
                        onChange={e => { setTutorFilterStatus(e.target.value); resetCounts(); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 appearance-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value="all">Any Status</option>
                        <option value="active">✅ Active</option>
                        <option value="notavailable">⏸️ Not Available</option>
                        <option value="suspended">🚫 Suspended</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-6 flex gap-3">
                  <button onClick={clearFilters} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">Clear All</button>
                  <button onClick={() => setShowAdvancedFilterDrawer(false)} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">Show {activeTab === 'tutors' ? activeTutorsCount : activeLeadsCount} {activeTab === 'tutors' ? 'Tutors' : 'Jobs'}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className={cn("p-[20px_16px] sm:p-[30px_20px] text-center border-b relative transition-all duration-500 overflow-hidden", userCity ? "text-white border-transparent" : "bg-white border-slate-50")} style={userCity ? { background: getCityTheme(userCity).grad } : {}}>
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10">{currentUser && <button onClick={() => firebaseAuth.signOut()} className="text-white/70 hover:text-white transition-colors"><LogOut size={18} className="sm:w-5 sm:h-5" /></button>}</div>
        <h1 className="text-[24px] sm:text-[32px] font-[900] tracking-tighter relative z-10">
          {activeTab === 'home' && (<div className="flex flex-col items-center"><span className="truncate max-w-[280px] sm:max-w-none">{userName ? `Welcome, ${userName}` : (userType === 'teacher' ? 'Welcome, Educator' : (userType === 'parent' ? 'Welcome, Parent' : 'DoAble India'))}</span><span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-80 mt-1 animate-pulse">{getGreeting()}</span></div>)}
          {activeTab === 'jobs' && 'Jobs Portal'}{activeTab === 'tutors' && 'Expert Tutors'}{activeTab === 'alerts' && 'Broadcasts'}
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 relative z-10">
          <div className="bg-white/15 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 border border-white/10 max-w-[48%]"><span className="text-[10px] sm:text-xs">💼</span><span className="text-[9px] sm:text-[10px] font-black uppercase text-white truncate">{activeLeadsCount} Jobs</span></div>
          <div className="bg-white/15 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 border border-white/10 max-w-[48%]"><span className="text-[10px] sm:text-xs">🎓</span><span className="text-[9px] sm:text-[10px] font-black uppercase text-white truncate">{activeTutorsCount} Tutors</span></div>
        </div>
      </header>

      <main className="container mx-auto p-0 sm:p-[10px] max-w-[1200px] pb-32">
        {activeTab === 'home' && (
          <div className="space-y-8 sm:space-y-12 py-4 sm:py-8 flex flex-col items-center px-3 sm:px-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-[94%] sm:w-full min-h-[45vh] sm:min-h-[400px] p-8 sm:p-16 rounded-[40px] sm:rounded-[56px] relative overflow-hidden shadow-2xl border border-white/10 mesh-gradient flex items-center">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-0" />
              <div className="relative z-10 space-y-8 sm:space-y-10 w-full">
                 <div className="space-y-4">
                    <h3 className="text-3xl sm:text-6xl font-[900] text-white tracking-tighter leading-[1.1]">Inspiring Success in<br/><span className="inline-block border-r-4 border-white/90 pr-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70" style={{ animation: 'typewriterBlink 1s step-end infinite' }}>{typewriterCity}</span></h3>
                    <p className="text-white/70 text-sm sm:text-lg font-medium leading-[1.6] max-w-2xl">{!userType ? <>Welcome to DoAble India. Let's start by setting up your profile to match you with the best opportunities in <span className="text-white font-black">{userCity}</span>.</> : userType === 'teacher' ? <>Hello Educator, your expertise is igniting minds. Keep your profile updated for premium teaching opportunities in <span className="text-white font-black underline decoration-primary decoration-4 underline-offset-4">{userCity}</span>.</> : <>Hello Parent, we've curated the most inspiring and qualified mentors for your requirements across <span className="text-white font-black underline decoration-primary decoration-4 underline-offset-4">{userCity}</span>.</>}</p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {!userType ? (
                      <button onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} className="bg-white text-slate-900 px-10 py-6 rounded-[24px] font-[900] text-sm uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.05] active:scale-95 transition-all"><Sparkles size={20} className="text-primary animate-pulse" /> Get Started</button>
                    ) : (
                      <><button onClick={() => { setShowOnboarding(true); setOnboardingStep(0); setAreaSearch(''); }} className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-8 sm:px-10 py-5 sm:py-6 rounded-[24px] font-black text-xs uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group"><Settings size={18} className="text-white" /> App Preferences</button><button onClick={() => setShowFormModal(true)} className="bg-white text-slate-900 px-8 sm:px-10 py-5 sm:py-6 rounded-[24px] font-black text-xs uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"><FileText size={18} className="text-primary" /> {userType === 'teacher' ? 'Official Registration' : 'Post Requirement'}</button></>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
        {activeTab === 'alerts' && <AlertsView city={userCity || 'All'} userGender={userGender} userClasses={userClasses} userType={userType} isAdminUser={isAdminUser} onAdminClick={() => setActiveTab('admin')} currentUser={currentUser} handleSignIn={handleSignIn} showFormModal={showFormModal} setShowFormModal={setShowFormModal} />}
        {activeTab === 'admin' && isAdminUser && <AdminPanel currentCity={userCity || 'All'} />}
        {(activeTab === 'jobs' || activeTab === 'tutors') && (
          <div className="flex flex-col space-y-4">
            <div className="sticky top-0 z-40 py-2 bg-slate-50/90 backdrop-blur-md space-y-2 shrink-0 border-b border-slate-100">
              <div className="bg-slate-100 p-1.5 rounded-[22px] flex gap-1 items-center justify-between mx-4">
                <span className="px-4 py-3 text-[9px] font-black uppercase text-slate-500">
                  {cityFilter !== 'all' ? (
                    selectedLocalities.length > 0 
                      ? `📍 ${selectedLocalities.length} Areas in ${cityFilter}`
                      : `📍 ${cityFilter} (Whole City)`
                  ) : (activeTab === 'jobs' ? 'Searching Jobs' : 'Expert Tutors')}
                </span>
                <div className="flex gap-2">
                  {(selectedLocalities.length > 0 || cityFilter !== 'all' || tutorFilterID || tutorFilterName || tutorFilterGender !== 'all' || tutorFilterVehicle !== 'all' || tutorFilterExperience !== 'all' || tutorFilterQualification !== 'all' || tutorFilterTime !== 'all' || tutorFilterDate !== 'all' || tutorFilterDay !== 'all' || tutorFilterFee !== 'all' || tutorFilterStatus !== 'all' || tutorFilterSchoolExp !== 'all' || userClasses.length > 0 || userTutorSubjects.length > 0 || searchQuery) && (
                    <button onClick={clearFilters} className="bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-[9px] font-black uppercase">Clear All</button>
                  )}
                  <button onClick={() => setShowAdvancedFilterDrawer(true)} className="bg-white p-3 rounded-xl text-primary shadow-sm"><Filter size={14} strokeWidth={3} /></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0 pb-10">
              {loading ? (<div className="col-span-full py-40 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /><p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Premium Data...</p></div>) : activeTab === 'jobs' ? (
                <>{filteredJobs.slice(0, visibleJobsCount).map((job) => (<JobCard key={(job as any).id || job['Order ID']} job={job} />))}{visibleJobsCount < filteredJobs.length && (<div className="col-span-full py-10 flex justify-center"><button onClick={() => setVisibleJobsCount(prev => prev + 10)} className="bg-white dark:bg-slate-900 border-2 border-primary text-primary px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">Load More Jobs ({filteredJobs.length - visibleJobsCount} Left)</button></div>)}{filteredJobs.length === 0 && (<div className="col-span-full py-20 text-center"><div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🏁</div><h3 className="font-[900] text-slate-900 dark:text-white uppercase tracking-tight text-lg">No Jobs Found</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Try changing your filters or location</p></div>)}</>
              ) : (
                <>{filteredTutors.slice(0, visibleTutorsCount).map((tutor) => (<TutorCard key={(tutor as any).id || (tutor as any)['Tutor ID']} tutor={tutor} />))}{visibleTutorsCount < filteredTutors.length && (<div className="col-span-full py-10 flex justify-center"><button onClick={() => setVisibleTutorsCount(prev => prev + 10)} className="bg-white dark:bg-slate-900 border-2 border-primary text-primary px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">Load More Tutors ({filteredTutors.length - visibleTutorsCount} Left)</button></div>)}{filteredTutors.length === 0 && (<div className="col-span-full py-20 text-center"><div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🏁</div><h3 className="font-[900] text-slate-900 dark:text-white uppercase tracking-tight text-lg">No Tutors Found</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">No expert tutors match your search</p></div>)}</>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8000] w-[92%] max-w-[400px]">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[32px] p-2 flex items-center justify-between shadow-2xl border border-white/10 relative">
          <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} icon={<HomeIcon size={20} />} label="Home" />
          {userType === 'teacher' && <NavButton active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); window.scrollTo(0,0); }} icon={<FileText size={20} />} label="Jobs" />}
          {userType === 'parent' && <NavButton active={activeTab === 'tutors'} onClick={() => { setActiveTab('tutors'); window.scrollTo(0,0); }} icon={<GraduationCap size={20} />} label="Tutors" />}
          {!userType && (<><NavButton active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); window.scrollTo(0,0); }} icon={<FileText size={20} />} label="Jobs" /><NavButton active={activeTab === 'tutors'} onClick={() => { setActiveTab('tutors'); window.scrollTo(0,0); }} icon={<GraduationCap size={20} />} label="Tutors" /></>)}
          <NavButton active={activeTab === 'alerts'} onClick={() => { setActiveTab('alerts'); window.scrollTo(0,0); }} icon={<Bell size={20} />} label="Alerts" />
          {isAdminUser && (<button onClick={() => setActiveTab('admin')} className={cn("absolute -top-16 right-0 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 transition-all active:scale-95", activeTab === 'admin' ? "bg-primary text-white" : "hover:bg-slate-50")}><Settings size={20} /></button>)}
        </div>
      </nav>
      <style>{`
        @keyframes typewriterBlink { 0%, 100% { border-color: rgba(255,255,255,0.8); } 50% { border-color: transparent; } }
        @keyframes mesh { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .mesh-gradient { background: linear-gradient(-45deg, #22c55e, #3b82f6, #10b981, #2563eb); background-size: 400% 400%; animation: mesh 15s ease infinite; }
      `}</style>

      {/* Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div><h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{userType === 'teacher' ? 'Official Registration' : 'Requirement Details'}</h3><p className="text-[10px] font-black text-primary uppercase tracking-widest">DoAble India Official Form</p></div>
                <button onClick={() => setShowFormModal(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:white transition-colors shadow-sm"><X size={20} strokeWidth={3} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-white"><div className="w-full h-full min-h-[600px]" dangerouslySetInnerHTML={{ __html: userType === 'teacher' ? `<iframe aria-label='Tutor Onboarding Form' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8?zf_enablecamera=true' allow="camera;" allowfullscreen="true"></iframe>` : `<iframe aria-label='Share Your Requirement' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o' allow="geolocation;" allowfullscreen="true"></iframe>` }} /></div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure connection established with doableindia.com</p></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 py-3 px-5 rounded-2xl transition-all duration-300", active ? "bg-white text-slate-900 scale-105 shadow-lg" : "text-white/40 hover:text-white")}>
      {icon}<span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
