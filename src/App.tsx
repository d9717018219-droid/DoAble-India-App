/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, Zap } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth, auth as firebaseAuth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { JobLead, TutorProfile, Alert, UserType } from './types';
import { JobCard } from './components/JobCard';
import { TutorCard } from './components/TutorCard';
import AlertsView from './components/AlertsView';
import AdminPanel from './components/AdminPanel';
import { cn, getCityTheme } from './utils';
import { CITIES_LIST, CLASSES_LIST, CLASS_SUBJECTS_DATA, CITY_TO_LOCATIONS_DATA, TIME_PERIODS_DATA, DAY_GROUPS_DATA } from './constants';

export default function App() {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [firestoreLeads, setFirestoreLeads] = useState<JobLead[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [userCity, setUserCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userGender, setUserGender] = useState<string | null>(localStorage.getItem('userGender'));
  const [userType, setUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [userTutorGenderPref, setUserTutorGenderPref] = useState<string>(localStorage.getItem('userTutorGenderPref') || 'Any');
  const [userTutorArea, setUserTutorArea] = useState<string>(localStorage.getItem('userTutorArea') || '');
  const [userClasses, setUserClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState(localStorage.getItem('userCity') || 'Ghaziabad');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'tutors' | 'alerts' | 'admin'>('home');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('Checking...');
  const [jobLimit, setJobLimit] = useState(15);
  const [tutorLimit, setTutorLimit] = useState(15);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(localStorage.getItem('themeMode') as 'light' | 'dark' || 'light');
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (currentUser?.email === 'd9717018219@gmail.com') {
      setIsAdminUser(true);
      setAdminStatus('Admin Session Active');
    } else {
      setIsAdminUser(false);
      setAdminStatus(currentUser ? 'Standard User' : 'Not Signed In');
    }
  }, [currentUser]);

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));
  const [isSelectingCityOnly, setIsSelectingCityOnly] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showTutorForm, setShowTutorForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(!localStorage.getItem('userName'));
  const [editName, setEditName] = useState(localStorage.getItem('userName') || '');
  const [editGender, setEditGender] = useState(localStorage.getItem('userGender') || '');
  const [editUserType, setEditUserType] = useState<UserType | null>(localStorage.getItem('userType') as UserType);
  const [editTutorGenderPref, setEditTutorGenderPref] = useState(localStorage.getItem('userTutorGenderPref') || 'Any');
  const [editTutorArea, setEditTutorArea] = useState(localStorage.getItem('userTutorArea') || '');
  const [editTutorSubjects, setEditTutorSubjects] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorSubjects') || '[]'));
  const [editTutorLocations, setEditTutorLocations] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorLocations') || '[]'));
  const [areaSearch, setAreaSearch] = useState('');
  const [editTutorTimes, setEditTutorTimes] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorTimes') || '[]'));
  const [editTutorDays, setEditTutorDays] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorDays') || '[]'));
  const [editTutorFee, setEditTutorFee] = useState<string>(localStorage.getItem('userTutorFee') || '');
  const [editTutorSchoolExp, setEditTutorSchoolExp] = useState<string>(localStorage.getItem('userTutorSchoolExp') || '');
  const [editTutorVehicle, setEditTutorVehicle] = useState<string>(localStorage.getItem('userTutorVehicle') || '');
  const [editTutorLastUpdated, setEditTutorLastUpdated] = useState<string>(localStorage.getItem('userTutorLastUpdated') || '');
  const [editTutorStatus, setEditTutorStatus] = useState<string>(localStorage.getItem('userTutorStatus') || '');
  const [editClasses, setEditClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  const [editCity, setEditCity] = useState<string>(localStorage.getItem('userCity') || 'Ghaziabad');
  const [userTutorSubjects, setUserTutorSubjects] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorSubjects') || '[]'));
  const [userTutorLocations, setUserTutorLocations] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorLocations') || '[]'));

  const getSubjects = useCallback((t: TutorProfile) => {
    const subjects = t['Preferred Subject(s)'] || '';
    return subjects.split(';').join(',').split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');
  }, []);

  const getCityValue = useCallback((t: TutorProfile) => {
    return (t['Preferred City'] || 'Ghaziabad').trim().toLowerCase();
  }, []);

  const getGenderValue = useCallback((t: TutorProfile) => {
    return (t.Gender || 'Male').trim();
  }, []);

  const isCityMatch = useCallback((leadCity: string | undefined, filterCity: string) => {
    if (!leadCity) return false;
    const filterCityLower = filterCity.toLowerCase().trim();
    if (filterCityLower === 'all') return true;
    return leadCity.toLowerCase().trim() === filterCityLower;
  }, []);

  const isLocationMatch = useCallback((leadLocs: string | undefined, userLocs: string[]) => {
    if (!leadLocs || userLocs.length === 0) return true;
    const leadLocArray = leadLocs.toLowerCase().split(',').map(l => l.trim());
    const userLocArray = userLocs.map(l => l.toLowerCase().trim());
    return userLocArray.some(u => leadLocArray.some(l => l.includes(u) || u.includes(l)));
  }, []);

  const isClassMatch = useCallback((leadClasses: string | undefined, userClasses: string[]) => {
    if (!leadClasses || userClasses.length === 0) return true;
    const lc = leadClasses.toLowerCase();
    return userClasses.some(uc => lc.includes(uc.toLowerCase()));
  }, []);

  useEffect(() => {
    loadData();
    const qLeads = query(collection(db, 'leads'), orderBy('Updated Time', 'desc'), limit(50));
    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setFirestoreLeads(data as JobLead[]);
    });
    return () => unsubscribeLeads();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, tutorsRes] = await Promise.all([
        fetch('https://doabletutors.com/api/leads'),
        fetch('https://doabletutors.com/api/tutors')
      ]);
      const [leadsJson, tutorsJson] = await Promise.all([leadsRes.json(), tutorsRes.json()]);
      if (leadsJson.status === 'success') {
        const filteredJobs = leadsJson.data
          .filter((x: JobLead) => x['Internal Remark']?.trim().toLowerCase() === 'searching')
          .sort((a: JobLead, b: JobLead) => new Date(b['Updated Time']).getTime() - new Date(a['Updated Time']).getTime());
        setLeads(filteredJobs);
      } else {
        setLeads(leadsJson.data || []);
      }
      setTutors(tutorsJson.data || []);
      setError(null);
    } catch (err: any) {
      setError(`Failed to load data: ${err.message || 'Unknown Error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Role-based: select user type and navigate accordingly
  const selectUserType = (type: UserType) => {
    setEditUserType(type);
    setUserType(type);
    localStorage.setItem('userType', type);
    setOnboardingStep(1);
  };

  // Complete onboarding/preference update and navigate based on role
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
    // Role-based redirect after preference update
    const resolvedType = editUserType || userType;
    if (resolvedType === 'parent') {
      setActiveTab('tutors');
    } else if (resolvedType === 'teacher') {
      setActiveTab('jobs');
    }
  };

  const allLeads = useMemo(() => {
    const combined = [...firestoreLeads, ...leads];
    const unique = new Map();
    combined.forEach(l => {
      const id = l['Order ID'] || l.id;
      if (id && !unique.has(id)) unique.set(id, l);
    });
    return Array.from(unique.values());
  }, [leads, firestoreLeads]);

  // Jobs (formerly leads): always filter to 'Searching' status from API + apply location/subject prefs
  const filteredJobs = useMemo(() => {
    return allLeads.filter(l => {
      // Only show Searching jobs (already filtered at API level, but double-check)
      const remark = (l['Internal Remark'] || '').trim().toLowerCase();
      if (remark !== 'searching') return false;
      if (!isCityMatch(l.City, cityFilter)) return false;
      const searchLower = searchQuery.toLowerCase();
      if (searchQuery && !(
        l.Name?.toLowerCase().includes(searchLower) ||
        l.subjects?.toLowerCase().includes(searchLower) ||
        l['Order ID']?.toLowerCase().includes(searchLower)
      )) return false;
      const hasPrefs = userTutorLocations.length > 0 || userTutorSubjects.length > 0;
      if (hasPrefs) {
        if (userTutorLocations.length > 0 && !isLocationMatch(l.Locations, userTutorLocations)) return false;
        if (userTutorSubjects.length > 0) {
          const leadSubjs = (l.subjects || '').toLowerCase();
          if (!userTutorSubjects.some(s => leadSubjs.includes(s.toLowerCase()))) return false;
        }
      }
      return true;
    });
  }, [allLeads, cityFilter, searchQuery, userTutorLocations, userTutorSubjects, isCityMatch, isLocationMatch]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      const tutorCityLower = getCityValue(t);
      const filterCityLower = cityFilter.toLowerCase().trim();
      if (filterCityLower !== 'all' && tutorCityLower !== filterCityLower) return false;
      const searchLower = searchQuery.toLowerCase();
      if (searchQuery && !(
        t.Name?.toLowerCase().includes(searchLower) ||
        t['Tutor ID']?.toString().toLowerCase().includes(searchLower) ||
        t['Preferred Subject(s)']?.toLowerCase().includes(searchLower)
      )) return false;
      const hasPrefs = userClasses.length > 0 || userTutorSubjects.length > 0;
      if (hasPrefs) {
        if (userClasses.length > 0 && !isClassMatch(t['Preferred Class Group'], userClasses)) return false;
        if (userTutorSubjects.length > 0) {
          const tSubjs = getSubjects(t);
          const userSubjsNormalized = userTutorSubjects.map(s => s.toLowerCase().trim());
          const hasMatchingSubject = userSubjsNormalized.some(us =>
            tSubjs.some(ts => ts === us || ts.includes(us) || us.includes(ts))
          );
          if (!hasMatchingSubject) return false;
        }
      }
      return true;
    });
  }, [tutors, cityFilter, searchQuery, userClasses, userTutorSubjects, getCityValue, isClassMatch, getSubjects]);

  const activeLeadsCount = useMemo(() => {
    return allLeads.filter(l => {
      const remark = (l['Internal Remark'] || '').trim().toLowerCase();
      return isCityMatch(l.City, userCity) && remark === 'searching';
    }).length;
  }, [allLeads, userCity, isCityMatch]);

  const activeTutorsCount = useMemo(() => {
    return tutors.filter(t => isCityMatch(getCityValue(t), userCity)).length;
  }, [tutors, userCity, isCityMatch, getCityValue]);

  // Get locations for selected city
  const cityLocations = CITY_TO_LOCATIONS_DATA[editCity] || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-primary selection:text-white" ref={mainScrollRef}>
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-lg space-y-10">
              {onboardingStep === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-primary text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-primary/30 transform -rotate-6">
                      <Zap size={48} className="animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Welcome to<br/>DoAbLe India</h1>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Premium Tuition Hub</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => selectUserType('parent')} className="bg-slate-50 p-6 rounded-[32px] flex flex-col items-center gap-3 active:scale-95 group">
                      <User size={32} className="text-primary/60" />
                      <span className="text-xs font-black uppercase">I'm Parent</span>
                    </button>
                    <button onClick={() => selectUserType('teacher')} className="bg-slate-900 text-white p-6 rounded-[32px] flex flex-col items-center gap-3 active:scale-95 group">
                      <GraduationCap size={32} className="text-primary" />
                      <span className="text-xs font-black uppercase">I'm Tutor</span>
                    </button>
                  </div>
                </motion.div>
              )}
              {onboardingStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><User size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase">Your Identity</h3>
                      <p className="text-[10px] font-black text-primary uppercase">Update Details</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <input className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-black shadow-inner outline-none" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your Name" />
                    <div className="grid grid-cols-2 gap-2">
                      {['Male', 'Female'].map(g => (
                        <button key={g} onClick={() => setEditGender(g)} className={cn("p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest", editGender === g ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                          {g}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setOnboardingStep(2)} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Next Step</button>
                  </div>
                </motion.div>
              )}
              {onboardingStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Sparkles size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase">Your Expertise</h3>
                      <p className="text-[10px] font-black text-primary uppercase">Select Classes</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto p-2 custom-scrollbar">
                      {CLASSES_LIST.map(c => (
                        <button key={c} onClick={() => setEditClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className={cn("px-4 py-3 rounded-xl text-[10px] font-black uppercase", editClasses.includes(c) ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setOnboardingStep(3)} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Continue</button>
                  </div>
                </motion.div>
              )}
              {/* Step 3: City Selection - Only city, no location sub-step for Change City flow */}
              {onboardingStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><MapPin size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase">Your Territory</h3>
                      <p className="text-[10px] font-black text-primary uppercase">Select Primary City</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-2 custom-scrollbar">
                      {CITIES_LIST.map(city => (
                        <button key={city} onClick={() => setEditCity(city)} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase", editCity === city ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                          {city}
                        </button>
                      ))}
                    </div>
                    {isSelectingCityOnly ? (
                      /* Change City flow: selecting city is the final step - no location prompt */
                      <button
                        onClick={() => {
                          localStorage.setItem('userCity', editCity);
                          setUserCity(editCity);
                          setCityFilter(editCity);
                          setShowOnboarding(false);
                          setIsSelectingCityOnly(false);
                        }}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl"
                      >
                        Confirm City
                      </button>
                    ) : (
                      <button onClick={() => setOnboardingStep(4)} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Select Locations</button>
                    )}
                  </div>
                </motion.div>
              )}
              {/* Step 4: Locations (only shown during full preference setup, not Change City) */}
              {onboardingStep === 4 && !isSelectingCityOnly && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><MapPin size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase">Your Areas</h3>
                      <p className="text-[10px] font-black text-primary uppercase">Select Preferred Locations in {editCity}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <input type="text" placeholder="Search locations..." value={areaSearch} onChange={(e) => setAreaSearch(e.target.value.toLowerCase())} className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold outline-none border border-slate-200" />
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto p-2 custom-scrollbar">
                      {cityLocations.filter(loc => loc.toLowerCase().includes(areaSearch)).map((location) => (
                        <button key={location} onClick={() => setEditTutorLocations(prev => prev.includes(location) ? prev.filter(x => x !== location) : [...prev, location])} className={cn("px-3 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap", editTutorLocations.includes(location) ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                          {location}
                        </button>
                      ))}
                    </div>
                    {editTutorLocations.length === 0 && (
                      <p className="text-[12px] text-slate-400 text-center py-4">Select at least one location to continue</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setOnboardingStep(3)} className="w-full bg-slate-200 text-slate-900 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">Back</button>
                      <button onClick={completeOnboarding} disabled={editTutorLocations.length === 0} className={cn("w-full py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg", editTutorLocations.length === 0 ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-slate-900 text-white")}>
                        Complete Setup
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter / Switch City Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] p-8 space-y-8 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Switch City</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button onClick={() => setCityFilter('all')} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase", cityFilter === 'all' ? "bg-slate-900 text-white shadow-xl" : "bg-slate-100 text-slate-400")}>
                  All Cities
                </button>
                {CITIES_LIST.map(c => (
                  <button key={c} onClick={() => { setCityFilter(c); setShowFilterDrawer(false); }} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase truncate", cityFilter === c ? "bg-primary text-white shadow-xl" : "bg-slate-100 text-slate-400")}>
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className={cn("p-[30px_20px] text-center border-b relative transition-all duration-500", userCity ? "text-white border-transparent" : "bg-white border-slate-50")} style={userCity ? { background: getCityTheme(userCity).grad } : {}}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          {currentUser && <button onClick={() => firebaseAuth.signOut()} className="text-white/70 hover:text-white transition-colors"><LogOut size={20} /></button>}
        </div>
        <h1 className="text-[32px] font-[900] tracking-tighter">
          {activeTab === 'home' && (userName ? `Welcome, ${userName}` : (userType === 'teacher' ? 'Welcome, Educator' : (userType === 'parent' ? 'Welcome, Parent' : 'DoAble India')))}
          {activeTab === 'jobs' && 'Jobs Portal'}
          {activeTab === 'tutors' && 'Expert Tutors'}
          {activeTab === 'alerts' && 'Broadcasts'}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 max-w-[45%]">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-white truncate">{activeLeadsCount} Jobs in {userCity}</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 max-w-[45%]">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-white truncate">{activeTutorsCount} Tutors</span>
          </div>
        </div>
        <p className="text-[13px] font-bold uppercase tracking-widest mt-2 text-white/70">
          {activeTab === 'home' && (userName ? `PERFECT MATCHES FOR YOUR PROFILE` : 'Premium Teaching Portal')}
          {activeTab === 'jobs' && 'Active Tuition Openings'}
          {activeTab === 'tutors' && 'Professional Educators'}
        </p>
      </header>

      <main className="container mx-auto p-[10px] max-w-[1200px] pb-32">
        {activeTab === 'home' && (
          <div className="space-y-10 py-8">
            <div className="p-10 rounded-[48px] relative overflow-hidden shadow-2xl border border-primary/5" style={{ background: getCityTheme(userCity).grad }}>
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">Inspiring Success in<br/> {userCity}</h3>
                  <p className="text-white/80 text-[13px] font-bold leading-relaxed max-w-md">
                    {userType === 'teacher'
                      ? <>Your knowledge has the power to ignite minds. Discover elite opportunities in <span className="text-secondary">{userCity}</span>.</>
                      : <>Your child deserves the best education. Find verified tutors in <span className="text-secondary">{userCity}</span>.</>}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Change City: only prompts for city selection, no location step */}
                  <button
                    onClick={() => {
                      setIsSelectingCityOnly(true);
                      setShowOnboarding(true);
                      setOnboardingStep(3);
                    }}
                    className="bg-white text-slate-900 px-8 py-5 rounded-[28px] font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <MapPin size={18} className="text-primary" />
                    Change City
                  </button>
                  {/* Update Preference: full onboarding flow with location step */}
                  <button
                    onClick={() => {
                      setIsSelectingCityOnly(false);
                      setShowOnboarding(true);
                      setOnboardingStep(0);
                    }}
                    className="bg-primary text-white p-5 rounded-[28px] font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <Settings size={18} />
                    Update Preference
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && <AlertsView city={userCity || 'All'} userGender={userGender} userClasses={userClasses} userType={userType} />}
        {activeTab === 'admin' && isAdminUser && <AdminPanel currentCity={userCity || 'All'} />}

        {(activeTab === 'jobs' || activeTab === 'tutors') && (
          <div className="space-y-6">
            {activeTab === 'jobs' && (
              <div className="sticky top-0 z-40 py-4 bg-slate-50/80 backdrop-blur-md">
                <div className="bg-slate-100 p-1.5 rounded-[22px] flex gap-1 overflow-x-auto no-scrollbar items-center justify-between">
                  <span className="px-4 py-3 text-[9px] font-black uppercase text-slate-500">Searching Jobs</span>
                  <button onClick={() => setShowFilterDrawer(true)} className="bg-white p-3 rounded-xl text-primary ml-2"><Filter size={14} strokeWidth={3} /></button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? <div className="col-span-full py-40 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
                : activeTab === 'jobs'
                  ? (filteredJobs.length === 0
                    ? <div className="col-span-full py-40 text-center text-slate-400 font-bold uppercase text-xs">No jobs found in {cityFilter}</div>
                    : filteredJobs.map(job => <JobCard key={job.id || job['Order ID']} job={job} />))
                  : (filteredTutors.length === 0
                    ? <div className="col-span-full py-40 text-center text-slate-400 font-bold uppercase text-xs">No tutors found in {cityFilter}</div>
                    : filteredTutors.map(tutor => <TutorCard key={tutor.id || tutor['Tutor ID']} tutor={tutor} />))
              }
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Role-Based Dynamic Menu */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8000] w-[92%] max-w-[400px]">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[32px] p-2 flex items-center justify-between shadow-2xl border border-white/10 relative">
          {/* Home - always visible */}
          <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} icon={<HomeIcon size={20} />} label="Home" />

          {/* Teacher role: show Jobs, hide Tutors */}
          {userType === 'teacher' && (
            <NavButton active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); window.scrollTo(0,0); }} icon={<FileText size={20} />} label="Jobs" />
          )}

          {/* Parent role: show Tutors, hide Jobs */}
          {userType === 'parent' && (
            <NavButton active={activeTab === 'tutors'} onClick={() => { setActiveTab('tutors'); window.scrollTo(0,0); }} icon={<GraduationCap size={20} />} label="Tutors" />
          )}

          {/* Fallback: if no user type set yet, show both */}
          {!userType && (
            <>
              <NavButton active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); window.scrollTo(0,0); }} icon={<FileText size={20} />} label="Jobs" />
              <NavButton active={activeTab === 'tutors'} onClick={() => { setActiveTab('tutors'); window.scrollTo(0,0); }} icon={<GraduationCap size={20} />} label="Tutors" />
            </>
          )}

          {/* Alerts - always visible */}
          <NavButton active={activeTab === 'alerts'} onClick={() => { setActiveTab('alerts'); window.scrollTo(0,0); }} icon={<Bell size={20} />} label="Alerts" />

          {isAdminUser && (
            <button onClick={() => setShowAdminSettings(true)} className="absolute -top-16 right-0 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-900">
              <Settings size={20} />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 py-3 px-5 rounded-2xl transition-all duration-300", active ? "bg-white text-slate-900 scale-105 shadow-lg" : "text-white")}>
      {icon}<span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
