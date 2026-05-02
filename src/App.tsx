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
  CITY_TO_LOCATIONS_DATA 
} from './constants';

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
  const [userTutorLocations, setUserTutorLocations] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorLocations') || '[]'));

  // ─── UI state ────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState(localStorage.getItem('userCity') || 'Ghaziabad');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'tutors' | 'alerts' | 'admin'>('home');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [jobIndex, setJobIndex] = useState(0);
  const [tutorIndex, setTutorIndex] = useState(0);
  const [themeMode] = useState<'light' | 'dark'>(localStorage.getItem('themeMode') as 'light' | 'dark' || 'light');
  const [locationBypass, setLocationBypass] = useState<string | null>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // ─── Tutor Filters state ─────────────────────────────────────────
  const [showTutorFilterDrawer, setShowTutorFilterDrawer] = useState(false);
  const [tutorFilterID, setTutorFilterID] = useState('');
  const [tutorFilterName, setTutorFilterName] = useState('');
  const [tutorFilterGender, setTutorFilterGender] = useState('all');
  const [tutorFilterVehicle, setTutorFilterVehicle] = useState('all');
  const [tutorFilterExperience, setTutorFilterExperience] = useState('');
  const [tutorFilterQualification, setTutorFilterQualification] = useState('');
  const [tutorFilterTime, setTutorFilterTime] = useState('all');
  const [tutorFilterDate, setTutorFilterDate] = useState('');

  // ─── Onboarding ──────────────────────────────────────────────────

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSelectingCityOnly, setIsSelectingCityOnly] = useState(false);
  const [editName, setEditName] = useState(localStorage.getItem('userName') || '');
  const [editGender, setEditGender] = useState(localStorage.getItem('userGender') || '');
  const [editUserType, setEditUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [editTutorSubjects, setEditTutorSubjects] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorSubjects') || '[]'));
  const [editTutorLocations, setEditTutorLocations] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorLocations') || '[]'));
  const [areaSearch, setAreaSearch] = useState('');
  const [editClasses, setEditClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  const [editCity, setEditCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');

  // ─── PWA install prompt ──────────────────────────────────────────
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // ─── Typewriter for city ─────────────────────────────────────────
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

  // PWA install prompt capture
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
             const ta = new Date(a['Record Added'] || a['Updated Time'] || 0).getTime();
             const tb = new Date(b['Record Added'] || b['Updated Time'] || 0).getTime();
             return tb - ta;
          });
        setLeads(filteredJobs);
      } else {
        setLeads(leadsJson.data || []);
      }
      
      // Tutor sorting: 'Record Added' DESC
      const rawTutors: TutorProfile[] = tutorsJson.data || [];
      rawTutors.sort((a, b) => {
        const ta = new Date((a as any)['Record Added'] || 0).getTime();
        const tb = new Date((b as any)['Record Added'] || 0).getTime();
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
    localStorage.setItem('userName', editName);
    localStorage.setItem('userGender', editGender);
    localStorage.setItem('userClasses', JSON.stringify(editClasses));
    localStorage.setItem('userCity', editCity);
    localStorage.setItem('userTutorSubjects', JSON.stringify(editTutorSubjects));
    localStorage.setItem('userTutorLocations', JSON.stringify(editTutorLocations));
    setUserName(editName);
    setUserGender(editGender);
    setUserClasses(editClasses);
    setUserCity(editCity);
    setCityFilter(editCity);
    setUserTutorSubjects(editTutorSubjects);
    setUserTutorLocations(editTutorLocations);
    setShowOnboarding(false);
    setIsSelectingCityOnly(false);
    setLocationBypass(null);
    const resolved = editUserType || userType;
    if (resolved === 'parent') setActiveTab('tutors');
    else if (resolved === 'teacher') setActiveTab('jobs');
  };

  const getSubjects = useCallback((t: TutorProfile) => {
    return (t['Preferred Subject(s)'] || '').split(';').join(',').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  }, []);
  const getCityValue = useCallback((t: TutorProfile) => (t['Preferred City'] || 'Ghaziabad').trim().toLowerCase(), []);
  const isCityMatch = useCallback((city: string | undefined, filter: string) => {
    if (!city) return false;
    if (filter.toLowerCase() === 'all') return true;
    return city.toLowerCase().trim() === filter.toLowerCase().trim();
  }, []);
  const isLocationMatch = useCallback((locs: string | undefined, userLocs: string[]) => {
    if (!locs || userLocs.length === 0) return true;
    const leadArr = locs.toLowerCase().split(',').map(l => l.trim());
    return userLocs.map(l => l.toLowerCase().trim()).some(u => leadArr.some(l => l.includes(u) || u.includes(l)));
  }, []);
  const isClassMatch = useCallback((classes: string | undefined, uClasses: string[]) => {
    if (!classes || uClasses.length === 0) return true;
    const lc = classes.toLowerCase();
    return uClasses.some(c => lc.includes(c.toLowerCase()));
  }, []);

  const allLeads = useMemo(() => {
    const combined = [...firestoreLeads, ...leads];
    const unique = new Map<string, JobLead>();
    combined.forEach(l => { const id = l['Order ID'] || (l as any).id; if (id && !unique.has(id)) unique.set(id, l); });
    return Array.from(unique.values());
  }, [leads, firestoreLeads]);

  const cityJobLocationBreakdown = useMemo(() => {
    const cityJobs = allLeads.filter(l => {
      const remark = (l['Internal Remark'] || '').trim().toLowerCase();
      return remark === 'searching' && isCityMatch(l.City, cityFilter);
    });
    const counts = new Map<string, number>();
    cityJobs.forEach(j => {
      const locs = (j.Locations || '').split(',').map(s => s.trim()).filter(Boolean);
      const primary = locs[0] || j.City || '';
      if (primary) counts.set(primary, (counts.get(primary) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [allLeads, cityFilter, isCityMatch]);

  const cityTutorLocationBreakdown = useMemo(() => {
    const cityTutors = tutors.filter(t => isCityMatch(getCityValue(t), cityFilter));
    const counts = new Map<string, number>();
    cityTutors.forEach(t => {
      const locs = (t['Preferred Location(s)'] || '').split(',').map(s => s.trim()).filter(Boolean);
      const primary = locs[0] || getCityValue(t) || '';
      if (primary) counts.set(primary, (counts.get(primary) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [tutors, cityFilter, isCityMatch, getCityValue]);

  const filteredJobs = useMemo(() => {
    return allLeads.filter(l => {
      const remark = (l['Internal Remark'] || '').trim().toLowerCase();
      if (remark !== 'searching') return false;
      if (locationBypass) {
        return isCityMatch(l.City, cityFilter) && (l.Locations || '').toLowerCase().includes(locationBypass.toLowerCase());
      }
      if (!isCityMatch(l.City, cityFilter)) return false;
      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        if (!( l.Name?.toLowerCase().includes(sl) || l.subjects?.toLowerCase().includes(sl) || l['Order ID']?.toLowerCase().includes(sl))) return false;
      }
      if (userTutorLocations.length > 0 && !isLocationMatch(l.Locations, userTutorLocations)) return false;
      if (userTutorSubjects.length > 0) {
        const ls = (l.subjects || '').toLowerCase();
        if (!userTutorSubjects.some(s => ls.includes(s.toLowerCase()))) return false;
      }
      return true;
    });
  }, [allLeads, cityFilter, searchQuery, userTutorLocations, userTutorSubjects, isCityMatch, isLocationMatch, locationBypass]);

  const filteredTutors = useMemo(() => {
    const strictFilter = (t: TutorProfile) => {
      const tutorCity = getCityValue(t);
      const fc = cityFilter.toLowerCase().trim();
      if (fc !== 'all' && tutorCity !== fc) return false;

      // ID Filter
      if (tutorFilterID && !t['Tutor ID']?.toString().toLowerCase().includes(tutorFilterID.toLowerCase())) return false;
      
      // Name Filter
      if (tutorFilterName && !t.Name?.toLowerCase().includes(tutorFilterName.toLowerCase())) return false;

      // Gender Filter
      if (tutorFilterGender !== 'all' && t.Gender?.toLowerCase() !== tutorFilterGender.toLowerCase()) return false;

      // Vehicle Filter
      if (tutorFilterVehicle !== 'all') {
        const hasVehicle = (t['Have own Vehicle'] || '').toLowerCase() === 'yes';
        if (tutorFilterVehicle === 'yes' && !hasVehicle) return false;
        if (tutorFilterVehicle === 'no' && hasVehicle) return false;
      }

      // Experience Filter
      if (tutorFilterExperience && !t.Experience?.toLowerCase().includes(tutorFilterExperience.toLowerCase())) return false;

      // Qualification Filter
      if (tutorFilterQualification && !t['Qualification(s)']?.toLowerCase().includes(tutorFilterQualification.toLowerCase())) return false;

      // Time Filter
      if (tutorFilterTime !== 'all' && !t['Preferred Time']?.toLowerCase().includes(tutorFilterTime.toLowerCase())) return false;

      // Date Filter (Record Added)
      if (tutorFilterDate && !t['Record Added']?.toLowerCase().includes(tutorFilterDate.toLowerCase())) return false;

      if (locationBypass) {
        return (t['Preferred Location(s)'] || '').toLowerCase().includes(locationBypass.toLowerCase());
      }

      if (searchQuery) {
        const sl = searchQuery.toLowerCase();
        if (!( t.Name?.toLowerCase().includes(sl) || t['Tutor ID']?.toString().includes(sl) || t['Preferred Subject(s)']?.toLowerCase().includes(sl))) return false;
      }
      const hasPrefs = userClasses.length > 0 || userTutorSubjects.length > 0;
      if (hasPrefs) {
        if (userClasses.length > 0 && !isClassMatch(t['Preferred Class Group'], userClasses)) return false;
        if (userTutorSubjects.length > 0) {
          const tS = getSubjects(t);
          const uS = userTutorSubjects.map(s => s.toLowerCase().trim());
          if (!uS.some(us => tS.some(ts => ts === us || ts.includes(us) || us.includes(ts)))) return false;
        }
      }
      return true;
    };

    const strict = tutors.filter(strictFilter);
    if (strict.length > 0) return strict;

    return tutors.filter(t => {
      const tutorCity = getCityValue(t);
      const fc = cityFilter.toLowerCase().trim();
      if (fc !== 'all' && tutorCity !== fc) return false;
      if (locationBypass) {
        return (t['Preferred Location(s)'] || '').toLowerCase().includes(locationBypass.toLowerCase());
      }
      if (userClasses.length > 0 && !isClassMatch(t['Preferred Class Group'], userClasses)) return false;
      return true;
    });
  }, [tutors, cityFilter, searchQuery, userClasses, userTutorSubjects, getCityValue, isClassMatch, getSubjects, locationBypass, tutorFilterID, tutorFilterName, tutorFilterGender, tutorFilterVehicle, tutorFilterExperience, tutorFilterQualification, tutorFilterTime, tutorFilterDate]);

  const isFallbackTutors = useMemo(() => {
    const strictCount = tutors.filter(t => {
      const tutorCity = getCityValue(t);
      const fc = cityFilter.toLowerCase().trim();
      if (fc !== 'all' && tutorCity !== fc) return false;
      
      if (tutorFilterID && !t['Tutor ID']?.toString().toLowerCase().includes(tutorFilterID.toLowerCase())) return false;
      if (tutorFilterName && !t.Name?.toLowerCase().includes(tutorFilterName.toLowerCase())) return false;
      if (tutorFilterGender !== 'all' && t.Gender?.toLowerCase() !== tutorFilterGender.toLowerCase()) return false;
      if (tutorFilterVehicle !== 'all') {
        const hasVehicle = (t['Have own Vehicle'] || '').toLowerCase() === 'yes';
        if (tutorFilterVehicle === 'yes' && !hasVehicle) return false;
        if (tutorFilterVehicle === 'no' && hasVehicle) return false;
      }
      if (tutorFilterExperience && !t.Experience?.toLowerCase().includes(tutorFilterExperience.toLowerCase())) return false;
      if (tutorFilterQualification && !t['Qualification(s)']?.toLowerCase().includes(tutorFilterQualification.toLowerCase())) return false;
      if (tutorFilterTime !== 'all' && !t['Preferred Time']?.toLowerCase().includes(tutorFilterTime.toLowerCase())) return false;
      if (tutorFilterDate && !t['Record Added']?.toLowerCase().includes(tutorFilterDate.toLowerCase())) return false;

      if (locationBypass) {
        return (t['Preferred Location(s)'] || '').toLowerCase().includes(locationBypass.toLowerCase());
      }
      const hasPrefs = userClasses.length > 0 || userTutorSubjects.length > 0;
      if (!hasPrefs) return true;
      if (userClasses.length > 0 && !isClassMatch(t['Preferred Class Group'], userClasses)) return false;
      if (userTutorSubjects.length > 0) {
        const tS = getSubjects(t);
        const uS = userTutorSubjects.map(s => s.toLowerCase().trim());
        if (!uS.some(us => tS.some(ts => ts === us || ts.includes(us) || us.includes(ts)))) return false;
      }
      return true;
    }).length;
    return strictCount === 0 && filteredTutors.length > 0;
  }, [tutors, cityFilter, userClasses, userTutorSubjects, getCityValue, isClassMatch, getSubjects, filteredTutors, locationBypass, tutorFilterID, tutorFilterName, tutorFilterGender, tutorFilterVehicle, tutorFilterExperience, tutorFilterQualification, tutorFilterTime, tutorFilterDate]);

  const activeLeadsCount = useMemo(() => {
    return allLeads.filter(l => isCityMatch(l.City, userCity) && (l['Internal Remark'] || '').trim().toLowerCase() === 'searching').length;
  }, [allLeads, userCity, isCityMatch]);

  const activeTutorsCount = useMemo(() => tutors.filter(t => isCityMatch(getCityValue(t), userCity)).length, [tutors, userCity, isCityMatch, getCityValue]);

  const subjectsForSelectedClasses = useMemo(() => {
    const subjectSet = new Set<string>();
    editClasses.forEach(cls => {
      (CLASS_SUBJECTS_DATA[cls] || []).forEach(s => subjectSet.add(s));
    });
    return Array.from(subjectSet);
  }, [editClasses]);

  const cityLocations = CITY_TO_LOCATIONS_DATA[editCity] || [];

  useEffect(() => { setJobIndex(0); }, [filteredJobs.length]);
  useEffect(() => { setTutorIndex(0); }, [filteredTutors.length]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans" ref={mainScrollRef}>

      {/* Onboarding Overlay */}
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
                      <span className="text-[10px] sm:text-xs font-black uppercase">I'm Parent</span>
                    </button>
                    <button onClick={() => selectUserType('teacher')} className="bg-slate-900 text-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col items-center gap-2 sm:gap-3 active:scale-95">
                      <GraduationCap size={28} className="sm:w-8 sm:h-8 text-primary" />
                      <span className="text-[10px] sm:text-xs font-black uppercase">I'm Tutor</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-100 space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary"><User size={20} className="sm:w-6 sm:h-6" /></div>
                    <div><h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">Your Identity</h3><p className="text-[9px] sm:text-[10px] font-black text-primary uppercase">Update Details</p></div>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    <input className="w-full bg-slate-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl text-sm font-black shadow-inner outline-none border border-slate-100" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your Name" />
                    <div className="grid grid-cols-2 gap-2">
                      {['Male', 'Female'].map(g => (
                        <button key={g} onClick={() => setEditGender(g)} className={cn("p-4 sm:p-5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase transition-all", editGender === g ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>{g}</button>
                      ))}
                    </div>
                    <button onClick={() => setOnboardingStep(2)} className="w-full bg-primary text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase shadow-xl">Next Step</button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-100 space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary"><Sparkles size={20} className="sm:w-6 sm:h-6" /></div>
                    <div><h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">Select Classes</h3><p className="text-[9px] sm:text-[10px] font-black text-primary uppercase">Pick one or more</p></div>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto p-1 sm:p-2 custom-scrollbar">
                      {CLASSES_LIST.map(c => (
                        <button key={c} onClick={() => setEditClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className={cn("px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all", editClasses.includes(c) ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>{c}</button>
                      ))}
                    </div>
                    <button onClick={() => {
                      if ((editUserType || userType) === 'parent' && editClasses.length > 0) setOnboardingStep(25);
                      else setOnboardingStep(3);
                    }} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Continue</button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 25 && (
                <motion.div key="s25" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Sparkles size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase">Select Subjects</h3>
                      <p className="text-[10px] font-black text-primary uppercase">Based on your classes</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {subjectsForSelectedClasses.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto p-2 custom-scrollbar">
                        {subjectsForSelectedClasses.map(s => (
                          <button key={s} onClick={() => setEditTutorSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={cn("px-4 py-3 rounded-xl text-[10px] font-black uppercase", editTutorSubjects.includes(s) ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>{s}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-4">No subjects found for selected classes</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setOnboardingStep(2)} className="w-full bg-slate-200 text-slate-900 py-3 rounded-2xl font-black text-[10px] uppercase">Back</button>
                      <button onClick={() => setOnboardingStep(3)} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Continue</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><MapPin size={24} /></div>
                    <div><h3 className="text-xl font-black text-slate-900 uppercase">Your Territory</h3><p className="text-[10px] font-black text-primary uppercase">Select Primary City</p></div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-2 custom-scrollbar">
                      {CITIES_LIST.map(city => (
                        <button key={city} onClick={() => setEditCity(city)} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase", editCity === city ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>{city}</button>
                      ))}
                    </div>
                    {isSelectingCityOnly ? (
                      <button onClick={() => { localStorage.setItem('userCity', editCity); setUserCity(editCity); setCityFilter(editCity); setShowOnboarding(false); setIsSelectingCityOnly(false); }} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Confirm City</button>
                    ) : (
                      <button onClick={() => setOnboardingStep(4)} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Select Locations</button>
                    )}
                  </div>
                </motion.div>
              )}

              {onboardingStep === 4 && !isSelectingCityOnly && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><MapPin size={24} /></div>
                    <div><h3 className="text-xl font-black text-slate-900 uppercase">Your Areas</h3><p className="text-[10px] font-black text-primary uppercase">Locations in {editCity}</p></div>
                  </div>
                  <div className="space-y-6">
                    <input type="text" placeholder="Search locations..." value={areaSearch} onChange={e => setAreaSearch(e.target.value.toLowerCase())} className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold outline-none border border-slate-200" />
                    <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto p-2 custom-scrollbar">
                      {cityLocations.filter(l => l.toLowerCase().includes(areaSearch)).map(loc => (
                        <button key={loc} onClick={() => setEditTutorLocations(prev => prev.includes(loc) ? prev.filter(x => x !== loc) : [...prev, loc])} className={cn("px-3 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap", editTutorLocations.includes(loc) ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>{loc}</button>
                      ))}
                    </div>
                    {editTutorLocations.length === 0 && <p className="text-[12px] text-slate-400 text-center py-4">Select at least one location</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setOnboardingStep(3)} className="w-full bg-slate-200 text-slate-900 py-3 rounded-2xl font-black text-[10px] uppercase">Back</button>
                      <button onClick={completeOnboarding} disabled={editTutorLocations.length === 0} className={cn("w-full py-3 rounded-2xl font-black text-[10px] uppercase", editTutorLocations.length === 0 ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-slate-900 text-white")}>Complete Setup</button>
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
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] p-8 space-y-8 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Switch City</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="p-4 bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button onClick={() => { setCityFilter('all'); setLocationBypass(null); setShowFilterDrawer(false); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase", cityFilter === 'all' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>All Cities</button>
                {CITIES_LIST.map(c => (
                  <button key={c} onClick={() => { setCityFilter(c); setLocationBypass(null); setShowFilterDrawer(false); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase truncate", cityFilter === c ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>{c}</button>
                ))}
              </div>
              {isAdminUser && (
                <div className="pt-4 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => { setActiveTab('admin'); setShowFilterDrawer(false); }}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-xl group hover:bg-primary/5 transition-all w-full justify-center"
                  >
                    <Settings size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">System Setting Only for Admin Use</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && deferredPrompt && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} className="fixed top-0 left-0 right-0 z-[9999] bg-primary text-white px-4 py-3 flex items-center justify-between shadow-xl">
            <span className="text-[11px] font-black uppercase tracking-widest">📲 Install DoAble India for the best experience</span>
            <div className="flex gap-2">
              <button onClick={async () => { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; setShowInstallBanner(false); }} className="bg-white text-primary text-[10px] font-black uppercase px-3 py-1.5 rounded-xl">Install</button>
              <button onClick={() => setShowInstallBanner(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutor Filter Drawer */}
      <AnimatePresence>
        {showTutorFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTutorFilterDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Filter Tutors</h3>
                  <p className="text-[10px] font-black text-primary uppercase">Find your perfect match</p>
                </div>
                <button onClick={() => setShowTutorFilterDrawer(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-8 py-4">
                {/* Search by ID & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tutor ID</label>
                    <input type="text" placeholder="e.g. 12345" value={tutorFilterID} onChange={e => setTutorFilterID(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Name</label>
                    <input type="text" placeholder="e.g. John Doe" value={tutorFilterName} onChange={e => setTutorFilterName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700" />
                  </div>
                </div>

                {/* City Locations */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preferred Locations in {cityFilter}</label>
                  <div className="flex flex-wrap gap-2 max-h-[20vh] overflow-y-auto p-1">
                    <button onClick={() => setLocationBypass(null)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all", !locationBypass ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>All Areas</button>
                    {(CITY_TO_LOCATIONS_DATA[cityFilter] || []).map(loc => (
                      <button key={loc} onClick={() => setLocationBypass(loc)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all", locationBypass === loc ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>{loc}</button>
                    ))}
                  </div>
                </div>

                {/* Classes & Subjects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Classes</label>
                    <div className="flex flex-wrap gap-2 max-h-[20vh] overflow-y-auto p-1">
                      {CLASSES_LIST.map(c => (
                        <button key={c} onClick={() => setUserClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase border transition-all", userClasses.includes(c) ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subjects</label>
                    <div className="flex flex-wrap gap-2 max-h-[20vh] overflow-y-auto p-1">
                      {subjectsForSelectedClasses.map(s => (
                        <button key={s} onClick={() => setUserTutorSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase border transition-all", userTutorSubjects.includes(s) ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gender & Vehicle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Gender</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['all', 'male', 'female'].map(g => (
                        <button key={g} onClick={() => setTutorFilterGender(g)} className={cn("py-3 rounded-xl text-[10px] font-black uppercase border transition-all", tutorFilterGender === g ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Own Vehicle</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['all', 'yes', 'no'].map(v => (
                        <button key={v} onClick={() => setTutorFilterVehicle(v)} className={cn("py-3 rounded-xl text-[10px] font-black uppercase border transition-all", tutorFilterVehicle === v ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>{v}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experience & Qualification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Experience</label>
                    <input type="text" placeholder="e.g. 5 years" value={tutorFilterExperience} onChange={e => setTutorFilterExperience(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qualification</label>
                    <input type="text" placeholder="e.g. B.Ed, M.Sc" value={tutorFilterQualification} onChange={e => setTutorFilterQualification(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700" />
                  </div>
                </div>

                {/* Time & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preferred Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['all', 'Morning', 'Afternoon', 'Evening'].map(t => (
                        <button key={t} onClick={() => setTutorFilterTime(t)} className={cn("py-3 rounded-xl text-[10px] font-black uppercase border transition-all", tutorFilterTime === t ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Record Added Date</label>
                    <input type="text" placeholder="e.g. May 2026" value={tutorFilterDate} onChange={e => setTutorFilterDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold outline-none border border-slate-100 dark:border-slate-700" />
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button onClick={() => { setLocationBypass(null); setTutorFilterID(''); setTutorFilterName(''); setTutorFilterGender('all'); setTutorFilterVehicle('all'); setTutorFilterExperience(''); setTutorFilterQualification(''); setTutorFilterTime('all'); setTutorFilterDate(''); setUserClasses([]); setUserTutorSubjects([]); }} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">Reset All</button>
                  <button onClick={() => setShowTutorFilterDrawer(false)} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Apply Filters</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className={cn("p-[20px_16px] sm:p-[30px_20px] text-center border-b relative transition-all duration-500 overflow-hidden", userCity ? "text-white border-transparent" : "bg-white border-slate-50")} style={userCity ? { background: getCityTheme(userCity).grad } : {}}>
        {/* Weather Animations */}
        {userCity && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
             <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-4 left-[10%]"><Sun size={32} className="sm:w-10 sm:h-10" strokeWidth={1} /></motion.div>
             <motion.div animate={{ x: [0, 20, 0], y: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-4 right-[15%]"><Cloud size={40} className="sm:w-14 sm:h-14" strokeWidth={1} /></motion.div>
             <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 right-[25%]"><Moon size={20} className="sm:w-7 sm:h-7" strokeWidth={1} /></motion.div>
          </div>
        )}

        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10">
          {currentUser && <button onClick={() => firebaseAuth.signOut()} className="text-white/70 hover:text-white transition-colors"><LogOut size={18} className="sm:w-5 sm:h-5" /></button>}
        </div>
        
        <h1 className="text-[24px] sm:text-[32px] font-[900] tracking-tighter relative z-10">
          {activeTab === 'home' && (
            <div className="flex flex-col items-center">
               <span className="truncate max-w-[280px] sm:max-w-none">{userName ? `Welcome, ${userName}` : (userType === 'teacher' ? 'Welcome, Educator' : (userType === 'parent' ? 'Welcome, Parent' : 'DoAble India'))}</span>
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-80 mt-1 animate-pulse">{getGreeting()}</span>
            </div>
          )}
          {activeTab === 'jobs' && 'Jobs Portal'}
          {activeTab === 'tutors' && 'Expert Tutors'}
          {activeTab === 'alerts' && 'Broadcasts'}
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 relative z-10">
          <div className="bg-white/15 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 border border-white/10 max-w-[48%]">
            <span className="text-[10px] sm:text-xs">💼</span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-white truncate">{activeLeadsCount} Jobs</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 border border-white/10 max-w-[48%]">
            <span className="text-[10px] sm:text-xs">🎓</span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-white truncate">{activeTutorsCount} Tutors</span>
          </div>
        </div>
        <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wider sm:tracking-widest mt-2 text-white/70 relative z-10">
          {activeTab === 'home' && (userName ? `PERFECT MATCHES FOR YOUR PROFILE` : 'Premium Teaching Portal')}
          {activeTab === 'jobs' && 'Active Tuition Openings'}
          {activeTab === 'tutors' && 'Professional Educators'}
        </p>
      </header>

      <main className="container mx-auto p-3 sm:p-[10px] max-w-[1200px] pb-32">
        {activeTab === 'home' && (
          <div className="space-y-8 sm:space-y-12 py-4 sm:py-8 flex flex-col items-center">
            {/* Premium Hero Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-[94%] sm:w-full min-h-[45vh] sm:min-h-[400px] p-8 sm:p-16 rounded-[40px] sm:rounded-[56px] relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-white/10 mesh-gradient flex items-center"
            >
              {/* Glassmorphism Overlay */}
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-0" />
              
              {/* Weather Animations for Hero Card */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 text-white/40"><Sun size={150} strokeWidth={1} /></motion.div>
                 <motion.div animate={{ x: [-30, 30, -30], y: [-10, 10, -10] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-20 left-10 text-white/40"><Cloud size={120} strokeWidth={1} /></motion.div>
              </div>

              <div className="relative z-10 space-y-8 sm:space-y-10 w-full">
                 <div className="space-y-4">
                    <h3 className="text-3xl sm:text-6xl font-[900] text-white tracking-tighter leading-[1.1]">
                      Inspiring Success in<br/>
                      <span className="inline-block border-r-4 border-white/90 pr-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70" style={{ animation: 'typewriterBlink 1s step-end infinite' }}>
                        {typewriterCity}
                      </span>
                    </h3>
                    <p className="text-white/70 text-sm sm:text-lg font-medium leading-[1.6] max-w-2xl">
                      {!userName ? (
                        <>Welcome to DoAble India. Let's start by setting up your profile to match you with the best opportunities in <span className="text-white font-black">{userCity}</span>.</>
                      ) : (
                        userType === 'teacher' ? 
                          <>Hello <span className="text-white font-black">{userName}</span>, your expertise is igniting minds. Keep your profile updated for premium teaching opportunities in <span className="text-white font-black underline decoration-primary decoration-4 underline-offset-4">{userCity}</span>.</> : 
                          <>Hello <span className="text-white font-black">{userName}</span>, we've curated the most inspiring and qualified mentors for your requirements across <span className="text-white font-black underline decoration-primary decoration-4 underline-offset-4">{userCity}</span>.</>
                      )}
                    </p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {!userName ? (
                      <button 
                        onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} 
                        className="bg-white text-slate-900 px-10 py-6 rounded-[24px] font-[900] text-sm uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.05] active:scale-95 transition-all"
                      >
                        <Sparkles size={20} className="text-primary animate-pulse" /> Create App Profile
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} 
                          className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-8 sm:px-10 py-5 sm:py-6 rounded-[24px] font-black text-xs uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group"
                        >
                          <Settings size={18} className="text-white" /> App Preferences
                        </button>
                        <button 
                          onClick={() => setShowFormModal(true)} 
                          className="bg-white text-slate-900 px-8 sm:px-10 py-5 sm:py-6 rounded-[24px] font-black text-xs uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <FileText size={18} className="text-primary" /> {userType === 'teacher' ? 'Official Registration' : 'Post Requirement'}
                        </button>
                      </>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
        {activeTab === 'alerts' && (
          <AlertsView 
            city={userCity || 'All'} 
            userGender={userGender} 
            userClasses={userClasses} 
            userType={userType} 
            isAdminUser={isAdminUser} 
            onAdminClick={() => setActiveTab('admin')} 
            currentUser={currentUser}
            handleSignIn={handleSignIn}
            showFormModal={showFormModal}
            setShowFormModal={setShowFormModal}
          />
        )}
        {activeTab === 'admin' && isAdminUser && <AdminPanel currentCity={userCity || 'All'} />}

        {(activeTab === 'jobs' || activeTab === 'tutors') && (
          <div className="flex flex-col h-[calc(100dvh-180px)] overflow-hidden">

            {activeTab === 'jobs' && (
              <div className="sticky top-0 z-40 py-2 bg-slate-50/90 backdrop-blur-md space-y-2 shrink-0">
                <div className="bg-slate-100 p-1.5 rounded-[22px] flex gap-1 items-center justify-between mx-2">
                  <span className="px-4 py-3 text-[9px] font-black uppercase text-slate-500">
                    {locationBypass ? `📍 ${locationBypass}` : 'Searching Jobs'}
                  </span>
                  <div className="flex gap-2">
                    {locationBypass && (
                      <button onClick={() => setLocationBypass(null)} className="bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-[9px] font-black uppercase">Clear</button>
                    )}
                    <button onClick={() => setShowFilterDrawer(true)} className="bg-white p-3 rounded-xl text-primary"><Filter size={14} strokeWidth={3} /></button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tutors' && (
              <div className="sticky top-0 z-40 py-2 bg-slate-50/90 backdrop-blur-md space-y-2 shrink-0">
                <div className="bg-slate-100 p-1.5 rounded-[22px] flex gap-1 items-center justify-between mx-2">
                  <span className="px-4 py-3 text-[9px] font-black uppercase text-slate-500">
                    {locationBypass ? `📍 ${locationBypass}` : 'Expert Tutors'}
                  </span>
                  <div className="flex gap-2">
                    {(locationBypass || tutorFilterID || tutorFilterName || tutorFilterGender !== 'all' || tutorFilterVehicle !== 'all' || tutorFilterExperience || tutorFilterQualification || tutorFilterTime !== 'all' || tutorFilterDate) && (
                      <button onClick={() => { setLocationBypass(null); setTutorFilterID(''); setTutorFilterName(''); setTutorFilterGender('all'); setTutorFilterVehicle('all'); setTutorFilterExperience(''); setTutorFilterQualification(''); setTutorFilterTime('all'); setTutorFilterDate(''); }} className="bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-[9px] font-black uppercase">Clear</button>
                    )}
                    <button onClick={() => setShowTutorFilterDrawer(true)} className="bg-white p-3 rounded-xl text-primary"><Filter size={14} strokeWidth={3} /></button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative w-full max-w-[500px] mx-auto flex-1 flex items-center justify-center perspective-1000 overflow-hidden py-4 px-4 sm:px-0">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-40 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Finding your matches...</p>
                  </motion.div>
                ) : activeTab === 'jobs' ? (
                  filteredJobs.length > jobIndex ? (
                    <JobCard 
                      key={(filteredJobs[jobIndex] as any).id || filteredJobs[jobIndex]['Order ID']} 
                      job={filteredJobs[jobIndex]} 
                      onSwipe={() => setJobIndex(prev => prev + 1)} 
                    />
                  ) : (
                    <motion.div key="no-jobs" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-10 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-xl mx-4">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🏁</div>
                      <h3 className="font-[900] text-slate-900 dark:text-white uppercase tracking-tight text-lg">That's everyone!</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">No more jobs found in {cityFilter}. <br/> Check back later for new leads.</p>
                      <button 
                        onClick={() => setJobIndex(0)} 
                        className="mt-8 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                      >
                        🔄 Refresh Leads
                      </button>
                    </motion.div>
                  )
                ) : (
                  filteredTutors.length > tutorIndex ? (
                    <TutorCard 
                      key={(filteredTutors[tutorIndex] as any).id || filteredTutors[tutorIndex]['Tutor ID']} 
                      tutor={filteredTutors[tutorIndex]} 
                      onSwipe={() => setTutorIndex(prev => prev + 1)} 
                    />
                  ) : (
                    <motion.div key="no-tutors" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-10 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-xl mx-4">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🏁</div>
                      <h3 className="font-[900] text-slate-900 dark:text-white uppercase tracking-tight text-lg">All caught up!</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">No more expert tutors in {cityFilter}. <br/> Try clearing filters to see more.</p>
                      <button 
                        onClick={() => setTutorIndex(0)} 
                        className="mt-8 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                      >
                        🔄 Refresh Tutors
                      </button>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8000] w-[92%] max-w-[400px]">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[32px] p-2 flex items-center justify-between shadow-2xl border border-white/10 relative">
          <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} icon={<HomeIcon size={20} />} label="Home" />
          {userType === 'teacher' && <NavButton active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setLocationBypass(null); window.scrollTo(0,0); }} icon={<FileText size={20} />} label="Jobs" />}
          {userType === 'parent' && <NavButton active={activeTab === 'tutors'} onClick={() => { setActiveTab('tutors'); setLocationBypass(null); window.scrollTo(0,0); }} icon={<GraduationCap size={20} />} label="Tutors" />}
          {!userType && (
            <>
              <NavButton active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setLocationBypass(null); window.scrollTo(0,0); }} icon={<FileText size={20} />} label="Jobs" />
              <NavButton active={activeTab === 'tutors'} onClick={() => { setActiveTab('tutors'); setLocationBypass(null); window.scrollTo(0,0); }} icon={<GraduationCap size={20} />} label="Tutors" />
            </>
          )}
          <NavButton active={activeTab === 'alerts'} onClick={() => { setActiveTab('alerts'); window.scrollTo(0,0); }} icon={<Bell size={20} />} label="Alerts" />
          {isAdminUser && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={cn("absolute -top-16 right-0 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 transition-all active:scale-95", activeTab === 'admin' ? "bg-primary text-white" : "hover:bg-slate-50")}
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </nav>
      <style>{`
        @keyframes typewriterBlink {
          0%, 100% { border-color: rgba(255,255,255,0.8); }
          50% { border-color: transparent; }
        }
        @keyframes mesh {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .mesh-gradient {
          background: linear-gradient(-45deg, #22c55e, #3b82f6, #10b981, #2563eb);
          background-size: 400% 400%;
          animation: mesh 15s ease infinite;
        }
      `}</style>

      {/* Form Modal (Global) */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {userType === 'teacher' ? 'Official Registration' : 'Requirement Details'}
                  </h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">DoAble India Official Form</p>
                </div>
                <button 
                  onClick={() => setShowFormModal(false)}
                  className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:white transition-colors shadow-sm"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 bg-white">
                <div 
                  className="w-full h-full min-h-[600px]"
                  dangerouslySetInnerHTML={{ 
                    __html: userType === 'teacher' ? 
                      `<iframe aria-label='Tutor Onboarding Form' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8?zf_enablecamera=true' allow="camera;"></iframe>` : 
                      `<iframe aria-label='Share Your Requirement' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o' allow="geolocation;" allowfullscreen="true"></iframe>` 
                  }} 
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure connection established with doableindia.com</p>
              </div>
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
