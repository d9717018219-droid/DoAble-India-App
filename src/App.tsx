/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap, ArrowRight, Navigation, Check } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth, auth as firebaseAuth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
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
  CITY_TO_LOCATIONS_DATA, 
  TIME_PERIODS_DATA, 
  DAY_GROUPS_DATA 
} from './constants';

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'leads' | 'tutors' | 'alerts'>('home');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Searching' | 'Booking' | 'Hired'>('Searching');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('Checking...');
  const [jobLimit, setJobLimit] = useState(15);
  const [tutorLimit, setTutorLimit] = useState(15);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(localStorage.getItem('themeMode') as 'light' | 'dark' || 'light');
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Theme effect
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Admin Check
  useEffect(() => {
    if (currentUser?.email === 'd9717018219@gmail.com') {
      setIsAdminUser(true);
      setAdminStatus('Admin Session Active');
    } else {
      setIsAdminUser(false);
      if (currentUser) {
        setAdminStatus('Standard User Session');
      } else {
        setAdminStatus('Not Signed In');
      }
    }
  }, [currentUser]);
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
  const [userTutorTimes, setUserTutorTimes] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorTimes') || '[]'));
  const [userTutorDays, setUserTutorDays] = useState<string[]>(JSON.parse(localStorage.getItem('userTutorDays') || '[]'));
  const [userTutorFee, setUserTutorFee] = useState<string>(localStorage.getItem('userTutorFee') || '');
  const [userTutorSchoolExp, setUserTutorSchoolExp] = useState<string>(localStorage.getItem('userTutorSchoolExp') || '');
  const [userTutorVehicle, setUserTutorVehicle] = useState<string>(localStorage.getItem('userTutorVehicle') || '');
  const [userTutorLastUpdated, setUserTutorLastUpdated] = useState<string>(localStorage.getItem('userTutorLastUpdated') || '');
  const [userTutorStatus, setUserTutorStatus] = useState<string>(localStorage.getItem('userTutorStatus') || '');

  // Data Parsing Helpers (Matching User's Working Code)
  const getSubjects = (t: TutorProfile) => {
    const subjects = t['Preferred Subject(s)'] || '';
    return subjects.split(',').map(s => s.trim()).filter(s => s !== '');
  };

  const getCityValue = (t: TutorProfile) => {
    return (t['Preferred City'] || 'Ghaziabad').trim();
  };

  const getGenderValue = (t: TutorProfile) => {
    return (t.Gender || 'Male').trim();
  };

  const isCityMatch = (leadCity: string | undefined, filterCity: string) => {
    if (!leadCity) return false;
    if (filterCity === 'all') return true;
    return leadCity.toLowerCase().trim() === filterCity.toLowerCase().trim();
  };

  const isLocationMatch = (leadLocs: string | undefined, userLocs: string[], city: string) => {
    if (!leadLocs || userLocs.length === 0) return true;
    const leadLocArray = leadLocs.split(',').map(l => l.trim().toLowerCase());
    const userLocArray = userLocs.map(l => l.trim().toLowerCase());
    return userLocArray.some(u => leadLocArray.some(l => l.includes(u) || u.includes(l)));
  };

  const isClassMatch = (leadClasses: string | undefined, userClasses: string[]) => {
    if (!leadClasses || userClasses.length === 0) return true;
    const lc = leadClasses.toLowerCase();
    return userClasses.some(uc => lc.includes(uc.toLowerCase()));
  };

  useEffect(() => {
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'auth');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userType'));
  const [isSelectingCityOnly, setIsSelectingCityOnly] = useState(false);

  useEffect(() => {
    loadData();
    
    const unsubscribeLeads = onSnapshot(query(collection(db, 'leads'), orderBy('Updated Time', 'desc'), limit(100)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setFirestoreLeads(data as JobLead[]);
    });

    return () => {
      unsubscribeLeads();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://script.google.com/macros/s/AKfycbz_98lYgU_W7YI7x_oAonL6-yR_M4QkKpxG1xX3Z7l9W7S7yG0/exec');
      const result = await response.json();
      setLeads(result.leads || []);
      setTutors(result.tutors || []);
      setError(null);
    } catch (err: any) {
      setError(`Failed to load data. Please try again. Error: ${err.message || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectUserType = (type: UserType) => {
    setEditUserType(type);
    setUserType(type);
    localStorage.setItem('userType', type);
    if (type === 'parent') setActiveTab('tutors');
    else setActiveTab('leads');
    setOnboardingStep(1);
  };

  const completeOnboarding = () => {
    localStorage.setItem('userName', editName);
    localStorage.setItem('userGender', editGender);
    localStorage.setItem('userTutorGenderPref', editTutorGenderPref);
    localStorage.setItem('userTutorArea', editTutorArea);
    localStorage.setItem('userTutorSubjects', JSON.stringify(editTutorSubjects));
    localStorage.setItem('userTutorLocations', JSON.stringify(editTutorLocations));
    localStorage.setItem('userTutorTimes', JSON.stringify(editTutorTimes));
    localStorage.setItem('userTutorDays', JSON.stringify(editTutorDays));
    localStorage.setItem('userTutorFee', editTutorFee);
    localStorage.setItem('userTutorSchoolExp', editTutorSchoolExp);
    localStorage.setItem('userTutorVehicle', editTutorVehicle);
    localStorage.setItem('userTutorLastUpdated', editTutorLastUpdated);
    localStorage.setItem('userTutorStatus', editTutorStatus);
    localStorage.setItem('userClasses', JSON.stringify(editClasses));
    localStorage.setItem('userCity', editCity);

    setUserName(editName);
    setUserGender(editGender);
    setUserTutorGenderPref(editTutorGenderPref);
    setUserTutorArea(editTutorArea);
    setUserTutorSubjects(editTutorSubjects);
    setUserTutorLocations(editTutorLocations);
    setUserTutorTimes(editTutorTimes);
    setUserTutorDays(editTutorDays);
    setUserTutorFee(editTutorFee);
    setUserTutorSchoolExp(editTutorSchoolExp);
    setUserTutorVehicle(editTutorVehicle);
    setUserTutorLastUpdated(editTutorLastUpdated);
    setUserTutorStatus(editTutorStatus);
    setUserClasses(editClasses);
    setUserCity(editCity);
    setCityFilter(editCity);
    
    setShowOnboarding(false);
    setIsSelectingCityOnly(false);
  };

  const selectCity = (city: string | null) => {
    setUserCity(city || 'Ghaziabad');
    setCityFilter(city || 'all');
    localStorage.setItem('userCity', city || 'Ghaziabad');
  };

  const updateProfile = (name: string, type: UserType) => {
    localStorage.setItem('userName', name);
    localStorage.setItem('userType', type);
    setUserName(name);
    setUserType(type);
    if (type === 'parent' && activeTab === 'leads') setActiveTab('tutors');
    if (type === 'teacher' && activeTab === 'tutors') setActiveTab('leads');
    setIsEditingProfile(false);
  };

  const allLeads = useMemo(() => {
    const combined = [...firestoreLeads, ...leads];
    const unique = new Map();
    combined.forEach(l => {
      const id = l['Order ID'] || l.id;
      if (!unique.has(id)) unique.set(id, l);
    });
    return Array.from(unique.values());
  }, [leads, firestoreLeads]);

  const availableLocationsForCity = useMemo(() => {
    const city = (activeTab === 'home' || activeTab === 'alerts') ? editCity : cityFilter;
    if (!city || city === 'all') return [];
    
    return CITY_TO_LOCATIONS_DATA[city] || [];
  }, [editCity, cityFilter, activeTab]);

  const filteredLeads = useMemo(() => {
    return allLeads.filter(l => {
      const matchesCity = cityFilter === 'all' || isCityMatch(l.City, cityFilter);
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        (l.Name?.toLowerCase().includes(searchLower)) ||
        (l.subjects?.toLowerCase().includes(searchLower)) ||
        (l['Order ID']?.toLowerCase().includes(searchLower)) ||
        (l.City?.toLowerCase().includes(searchLower));

      // Internal Remark / Status Filter
      const leadStatus = (l['Internal Remark'] || 'Searching');
      const matchesStatus = statusFilter === 'All' || leadStatus === statusFilter;

      // Conditional Preference Filtering
      let matchesArea = true;
      let matchesSubjects = true;
      let matchesGender = true;

      // Only apply tutor-specific filters if the user has actually set some preferences
      // otherwise show all leads in the city
      const hasSetPreferences = userTutorLocations.length > 0 || userTutorSubjects.length > 0;

      if (hasSetPreferences) {
        if (userTutorLocations.length > 0) {
          matchesArea = isLocationMatch(l.Locations, userTutorLocations, l.City);
        }
        
        if (userTutorSubjects.length > 0) {
          const leadSubjs = (l.subjects || '').toLowerCase();
          matchesSubjects = userTutorSubjects.some(s => {
            const lowerS = s.toLowerCase();
            return leadSubjs.includes(lowerS) || lowerS.includes(leadSubjs);
          });
        }
        
        const leadGender = (l.Gender || '').toLowerCase().trim();
        if (userGender && leadGender && leadGender !== 'any') {
          const userGenderLow = userGender.toLowerCase();
          matchesGender = leadGender.includes(userGenderLow) || userGenderLow.includes(leadGender);
        }
      }

      return matchesCity && matchesSearch && matchesStatus && matchesArea && matchesSubjects && matchesGender;
    });
  }, [allLeads, cityFilter, searchQuery, userTutorLocations, userTutorSubjects, userGender, statusFilter]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      // 1. Search Filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        (t.Name?.toLowerCase().includes(searchLower)) ||
        (t['Tutor ID']?.toString().toLowerCase().includes(searchLower)) ||
        (t['Preferred Subject(s)']?.toLowerCase().includes(searchLower));

      // 2. City Filter
      const matchesCity = cityFilter === 'all' || isCityMatch(getCityValue(t), cityFilter);

      // Only apply other filters if the user has set class/subject/gender preferences
      const hasSetPreferences = userClasses.length > 0 || userTutorSubjects.length > 0 || (userTutorGenderPref && userTutorGenderPref !== 'Any');

      if (!hasSetPreferences) {
        return matchesCity && matchesSearch;
      }

      // 3. Gender Filter
      let matchesGender = true;
      if (userTutorGenderPref && userTutorGenderPref !== 'Any') {
        const tutorGender = getGenderValue(t).toLowerCase();
        const prefGender = userTutorGenderPref.toLowerCase();
        matchesGender = tutorGender === prefGender || tutorGender.includes(prefGender);
      }

      // 4. Class & Subject Filter
      let matchesClassAndSubj = true;
      if (userClasses.length > 0) {
        const isClassMatchResult = isClassMatch(t['Preferred Class Group'], userClasses);
        
        if (!isClassMatchResult) {
          matchesClassAndSubj = false;
        } else if (userTutorSubjects.length > 0) {
          const tutorSubjs = getSubjects(t).map(s => s.toLowerCase());
          matchesClassAndSubj = userTutorSubjects.some(subj => {
            const s = subj.toLowerCase();
            return tutorSubjs.some(ts => ts.includes(s) || s.includes(ts));
          });
        }
      }

      return matchesCity && matchesSearch && matchesGender && matchesClassAndSubj;
    });
  }, [tutors, cityFilter, searchQuery, userTutorGenderPref, userClasses, userTutorSubjects]);

  const getMatchingJobsCount = (gender: string, classes: string[], city: string, locs: string[]) => {
    return allLeads.filter(l => {
      const mc = city === 'all' || isCityMatch(l.City, city);
      const mg = !gender || gender === 'Any' || (l.Gender || '').toLowerCase().includes(gender.toLowerCase());
      const mcl = classes.length === 0 || isClassMatch(l.Class, classes);
      const ml = locs.length === 0 || isLocationMatch(l.Locations, locs, l.City);
      return mc && mg && mcl && ml && (l['Internal Remark'] || 'Searching') === 'Searching';
    }).length;
  };

  const getMatchingTutorsCount = (gender: string, classes: string[], city: string, locs: string[]) => {
    return tutors.filter(t => {
      const mc = city === 'all' || isCityMatch(getCityValue(t), city);
      const mg = gender === 'Any' || getGenderValue(t).toLowerCase() === gender.toLowerCase();
      const mcl = classes.length === 0 || isClassMatch(t['Preferred Class Group'], classes);
      const ml = locs.length === 0 || isLocationMatch(t['Preferred Location(s)'], locs, getCityValue(t));
      return mc && mg && mcl && ml;
    }).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-primary selection:text-white" ref={mainScrollRef}>
      
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 sm:p-10 animate-in fade-in duration-500">
            <div className="w-full max-w-lg space-y-10">
              {onboardingStep === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8"
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-primary text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-primary/30 transform -rotate-6">
                      <Zap size={48} className="animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none font-display">Welcome to<br/>DoAbLe India</h1>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed">The Premium Tuition Connection Hub</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Who Am I?</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                         onClick={() => selectUserType('parent')}
                         className="bg-slate-50 p-6 rounded-[32px] border-2 border-transparent hover:border-primary/30 transition-all flex flex-col items-center gap-3 active:scale-95 group"
                      >
                         <User size={32} className="text-primary/60 group-hover:scale-110 transition-transform" />
                         <span className="text-xs font-black uppercase tracking-tight">I'm Parent</span>
                      </button>
                      <button 
                         onClick={() => selectUserType('teacher')}
                         className="bg-slate-900 text-white p-6 rounded-[32px] border-2 border-transparent hover:border-primary/50 transition-all flex flex-col items-center gap-3 active:scale-95 group"
                      >
                         <GraduationCap size={32} className="text-primary group-hover:scale-110 transition-transform" />
                         <span className="text-xs font-black uppercase tracking-tight">I'm Tutor</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 space-y-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Identity</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Update Your Details</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                      <input 
                        className="w-full bg-slate-50 border-none p-5 rounded-2xl text-sm font-black shadow-inner focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-300"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                        {editUserType === 'parent' ? 'Preffered Tutor Gender' : 'I am (Gender)'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {editUserType === 'parent' ? (
                          ['Any', 'Female', 'Male'].map(g => (
                            <button
                              key={g}
                              onClick={() => setEditTutorGenderPref(g)}
                              className={cn(
                                "p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                editTutorGenderPref === g ? "bg-slate-900 text-white shadow-xl" : "bg-slate-100 text-slate-400"
                              )}
                            >
                              {g}
                            </button>
                          ))
                        ) : (
                          ['Male', 'Female'].map(g => (
                            <button
                              key={g}
                              onClick={() => setEditGender(g)}
                              className={cn(
                                "p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                editGender === g ? "bg-slate-900 text-white shadow-xl" : "bg-slate-100 text-slate-400"
                              )}
                            >
                              {g}
                            </button>
                          ))
                        )}
                      </div>
                      {editUserType === 'teacher' && editGender && (
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse mt-4">
                          {getMatchingJobsCount(editGender, [], 'all', [])} Matching Leads Available
                        </p>
                      )}
                      {editUserType === 'parent' && editTutorGenderPref && (
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse mt-4">
                          {getMatchingTutorsCount(editTutorGenderPref, [], 'all', [])} Matching Tutors Available
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => setOnboardingStep(2)}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-transform"
                    >
                      Next Step
                    </button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div 
                   key="step2"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="bg-white p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 space-y-8"
                >
                   <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Expertise</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Select Classes & Subjects</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Class (Multi-Select)</label>
                        <div className="flex flex-wrap gap-2 max-h-[25vh] overflow-y-auto p-2 custom-scrollbar">
                           {CLASSES_LIST.map(c => (
                             <button
                               key={c}
                               onClick={() => {
                                 const next = editClasses.includes(c) ? editClasses.filter(x => x !== c) : [...editClasses, c];
                                 setEditClasses(next);
                               }}
                               className={cn(
                                 "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                 editClasses.includes(c) ? "bg-primary text-white shadow-lg" : "bg-slate-100 text-slate-400"
                               )}
                             >
                               {c}
                             </button>
                           ))}
                        </div>
                     </div>

                     {editClasses.length > 0 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Specific Subjects</label>
                           <div className="flex flex-wrap gap-2 max-h-[25vh] overflow-y-auto p-2 custom-scrollbar">
                             {Array.from(new Set(editClasses.flatMap(c => CLASS_SUBJECTS_DATA[c] || []))).sort().map(s => (
                               <button
                                 key={s}
                                 onClick={() => {
                                   const next = editTutorSubjects.includes(s) ? editTutorSubjects.filter(x => x !== s) : [...editTutorSubjects, s];
                                   setEditTutorSubjects(next);
                                 }}
                                 className={cn(
                                   "px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all",
                                   editTutorSubjects.includes(s) ? "bg-amber-500 text-white shadow-lg" : "bg-slate-50 text-slate-400 border border-slate-100"
                                 )}
                               >
                                 {s}
                               </button>
                             ))}
                           </div>
                        </div>
                     )}

                     <button 
                        onClick={() => setOnboardingStep(3)}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-transform"
                      >
                        Find Opportunities
                      </button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div 
                   key="step3"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="bg-white p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 space-y-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Territory</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Select Your Primary City</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto p-2 custom-scrollbar">
                    {CITIES_LIST.map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setEditCity(city);
                          setEditTutorLocations([]);
                          if (isSelectingCityOnly) {
                             localStorage.setItem('userCity', city);
                             setUserCity(city);
                             setCityFilter(city);
                             setShowOnboarding(false);
                             setIsSelectingCityOnly(false);
                          }
                        }}
                        className={cn(
                          "p-4 sm:p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center min-h-[80px] break-words",
                          editCity === city ? "bg-slate-900 text-white shadow-2xl scale-105" : "bg-slate-100 text-slate-400"
                        )}
                      >
                        <span className="w-full line-clamp-2">{city}</span>
                      </button>
                    ))}
                  </div>

                    {editUserType === 'teacher' && editCity && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Preferred Locations in {editCity}</label>
                         <div className="flex flex-wrap gap-2 max-h-[25vh] overflow-y-auto p-2 custom-scrollbar">
                            {CITY_TO_LOCATIONS_DATA[editCity]?.map(loc => (
                              <button
                                key={loc}
                                onClick={() => {
                                  const next = editTutorLocations.includes(loc) ? editTutorLocations.filter(x => x !== loc) : [...editTutorLocations, loc];
                                  setEditTutorLocations(next);
                                }}
                                className={cn(
                                  "px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all",
                                  editTutorLocations.includes(loc) ? "bg-emerald-500 text-white shadow-lg" : "bg-slate-50 text-slate-400 border border-slate-100"
                                )}
                              >
                                {loc}
                              </button>
                            ))}
                         </div>
                      </div>
                    )}

                    <button 
                      onClick={completeOnboarding}
                      className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      Initialize Portal <ArrowRight size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[9000] flex items-end justify-center p-0 sm:p-6 sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[48px] sm:rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <Filter size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Smart Filters</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refine {activeTab === 'leads' ? 'Lead' : 'Tutor'} Results</p>
                       </div>
                    </div>
                    <button onClick={() => setShowFilterDrawer(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                       <X size={20} strokeWidth={3} />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary City</label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <button 
                            onClick={() => setCityFilter('all')}
                            className={cn(
                              "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                              cityFilter === 'all' ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 dark:bg-slate-800"
                            )}
                          >
                            All India
                          </button>
                          {CITIES_LIST.slice(0, 8).map(c => (
                            <button
                              key={c}
                              onClick={() => setCityFilter(c)}
                              className={cn(
                                "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all truncate",
                                cityFilter === c ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 dark:bg-slate-800"
                              )}
                            >
                              {c}
                            </button>
                          ))}
                       </div>
                    </div>

                    {cityFilter !== 'all' && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Areas in {cityFilter}</label>
                          <div className="flex flex-wrap gap-2">
                             {CITY_TO_LOCATIONS_DATA[cityFilter]?.map(loc => (
                               <button
                                 key={loc}
                                 onClick={() => {
                                   const next = userTutorLocations.includes(loc) ? userTutorLocations.filter(x => x !== loc) : [...userTutorLocations, loc];
                                   setUserTutorLocations(next);
                                 }}
                                 className={cn(
                                   "px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all",
                                   userTutorLocations.includes(loc) ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 dark:bg-slate-800 border border-slate-100 dark:border-slate-800"
                                 )}
                               >
                                 {loc}
                               </button>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                   <button 
                     onClick={() => {
                       setUserTutorLocations([]);
                       setCityFilter('all');
                     }}
                     className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-400 py-4 rounded-[20px] font-extrabold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
                   >
                     Reset
                   </button>
                   <button 
                     onClick={() => setShowFilterDrawer(false)}
                     className="flex-[2] bg-slate-900 text-white py-4 rounded-[20px] font-extrabold text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                   >
                     View Results
                   </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header 
        className={cn(
          "p-[30px_20px] text-center border-b relative transition-all duration-500",
          userCity ? "text-white border-transparent" : "bg-white border-slate-50"
        )}
        style={userCity ? { background: getCityTheme(userCity).grad } : {}}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {currentUser && (
            <button onClick={() => firebaseAuth.signOut()} className={cn(userCity ? "text-white/70 hover:text-white" : "text-slate-400 hover:text-red-500", "transition-colors")}>
              <LogOut size={20} />
            </button>
          )}
        </div>

        <h1 className={cn("text-[32px] font-[900] tracking-tighter", userCity ? "text-white" : "text-primary")}>
          {activeTab === 'home' && (
            userName 
              ? `Welcome, ${userName}` 
              : (userType === 'teacher' ? 'Welcome, Educator' : (userType === 'parent' ? 'Welcome, Parent' : 'DoAble India'))
          )}
          {activeTab === 'leads' && 'Leads Portal'}
          {activeTab === 'tutors' && 'Expert Tutors'}
          {activeTab === 'alerts' && 'Broadcasts'}
        </h1>
        
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-sm transition-transform hover:scale-105 max-w-[45%]">
            <div className="w-1.5 h-1.5 min-w-[6px] bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-tight text-white truncate" title={`${allLeads.filter(l => isCityMatch(l.City, userCity)).length} Leads in ${userCity}`}>{allLeads.filter(l => isCityMatch(l.City, userCity)).length} Leads in {userCity}</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-sm transition-transform hover:scale-105 max-w-[45%]">
            <div className="w-1.5 h-1.5 min-w-[6px] bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-tight text-white truncate" title={`${tutors.filter(t => isCityMatch(getCityValue(t), userCity)).length} Tutors`}>{tutors.filter(t => isCityMatch(getCityValue(t), userCity)).length} Tutors</span>
          </div>
        </div>

        <p className={cn("text-[13px] font-bold uppercase tracking-widest mt-2", userCity ? "text-white/70" : "text-slate-400")}>
          {activeTab === 'home' && (userName ? `PERFECT MATCHES FOR YOUR PROFILE` : 'Premium Teaching Portal')}
          {activeTab === 'leads' && 'Direct Admission Pipeline'}
          {activeTab === 'tutors' && 'Professional Educators'}
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-[10px] max-w-[1200px]">
        {showTutorForm ? (
          <div className="animate-in slide-in-from-bottom duration-500 bg-white min-h-[85vh] rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl relative">
            <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Settings className="text-primary animate-spin-slow" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Update Profile</h3>
              </div>
              <button 
                onClick={() => setShowTutorForm(false)}
                className="bg-primary/10 text-primary p-3 rounded-2xl font-black text-[10px] uppercase tracking-tighter hover:bg-primary/20 transition-colors"
              >
                Close & Go Home
              </button>
            </div>
            <iframe 
              src="https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8" 
              className="w-full h-[75vh] border-none"
              title="Tutor Update Form"
            />
            <div className="p-6 bg-slate-50 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                Form processed by DoAble India official Portal.<br/>Changes may take 24-48 hours to reflect on live profiles.
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
          <div className="space-y-8 py-8 px-4">
              <div className="space-y-10">
                {/* 2. Inspiring Success in [City] Section */}
                <div 
                  className="p-10 rounded-[48px] relative overflow-hidden shadow-2xl shadow-primary/20 border border-primary/5 animate-in fade-in zoom-in duration-1000 delay-200"
                  style={{ background: getCityTheme(userCity).grad }}
                >
                  <div className="relative z-10 space-y-8">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Sync With Local Demand</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white tracking-tighter break-words">Inspiring Success in<br/> {userCity}</h3>
                        <p className="text-white/80 text-[13px] font-bold leading-relaxed max-w-md animate-in fade-in slide-in-from-left duration-1000 delay-300">
                          {userType === 'teacher' ? (
                            <>Your knowledge has the power to ignite minds. Discover elite opportunities in <span className="text-secondary">{userCity}</span> that value your expertise and passion. Shape the leaders of tomorrow, today.</>
                          ) : (
                            <>Your child's potential is limitless. We've curated the most inspiring mentors in <span className="text-secondary">{userCity}</span> to turn their dreams into reality. Because your child deserves nothing less than a champion.</>
                          )}
                        </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => {
                            setIsSelectingCityOnly(true);
                            setShowOnboarding(true);
                            setOnboardingStep(3); // City Selection
                          }}
                          className="bg-white text-slate-900 px-8 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                        >
                          <MapPin size={18} className="text-primary" />
                          Change City
                        </button>
                        <button 
                          onClick={() => {
                            setShowOnboarding(true);
                            setOnboardingStep(0); // Identity/Preference Reset
                          }}
                          className="bg-primary text-white p-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                        >
                          <Settings size={18} />
                          Update Preference
                        </button>
                     </div>
                  </div>
                  <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                </div>
              </div>
            </div>
          )}

        {activeTab === 'alerts' && <AlertsView city={userCity || 'All'} userGender={userGender} userClasses={userClasses} userType={userType} />}
        
        {showAdminSettings && (
          <div className="fixed inset-0 z-[5000] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            {isAdminUser ? (
              <div className="w-full max-w-2xl bg-slate-50 p-6 rounded-[32px] border-2 border-primary/20 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">App Management</h2>
                  <button onClick={() => setShowAdminSettings(false)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <AdminPanel currentCity={userCity || 'All'} />
              </div>
            ) : (
              <div className="text-center space-y-6 max-w-sm">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto shadow-sm">
                  <X size={40} strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Access Denied</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                    This section is strictly restricted to the Application Owner.<br/>Unauthorized access is prohibited.
                  </p>
                </div>
                {!currentUser ? (
                  <button 
                    onClick={handleSignIn}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Authenticate to Verify
                  </button>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as:</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">{currentUser.email}</p>
                  </div>
                )}
                <button 
                  onClick={() => setShowAdminSettings(false)}
                  className="w-full border-2 border-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && isAdminUser && <AdminPanel currentCity={userCity || 'All'} />}
        {activeTab === 'admin' && !isAdminUser && (
           <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <X size={48} strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-[900] text-slate-900 uppercase tracking-tighter">Restricted Area</h2>
              <p className="text-slate-500 mt-3 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto leading-relaxed">
                Only the Application Owner can access this management module.
              </p>
              <button 
                onClick={() => setActiveTab('home')}
                className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
              >
                Return to Safety
              </button>
           </div>
        )}

        {(activeTab === 'leads' || activeTab === 'tutors') && !showTutorForm && (
          <div className="animate-in fade-in duration-500 relative">
            <div className="space-y-6">
              {loading && (leads.length === 0 && tutors.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing with Live Database...</p>
                </div>
              ) : (
                <>
                  {/* Fixed Header Row for Status Filtering (Similar to Alerts layout) */}
                  {activeTab === 'leads' && (
                    <div className="sticky top-0 z-40 py-4 bg-slate-50/80 backdrop-blur-md -mx-[10px] px-[10px]">
                       <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[22px] flex gap-1 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                         {['All', 'New', 'Searching', 'Booking', 'Hired'].map((status) => (
                           <button
                             key={status}
                             onClick={() => setStatusFilter(status as any)}
                             className={cn(
                               "flex-1 min-w-[80px] flex items-center justify-center gap-2 py-3 rounded-[16px] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                               statusFilter === status 
                                 ? "bg-primary text-white shadow-lg scale-[1.02]" 
                                 : "text-slate-400 hover:text-slate-600"
                             )}
                           >
                             {status === 'All' && <FileText size={12} />}
                             {status === 'New' && <Sparkles size={12} />}
                             {status === 'Searching' && <Search size={12} />}
                             {status === 'Booking' && <Check size={12} />}
                             {status === 'Hired' && <CheckCircle size={12} />}
                             {status}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'leads' ? (
                      filteredLeads.length === 0 ? (
                        <div className="col-span-full py-40 text-center space-y-4">
                           <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
                             <Search size={40} />
                           </div>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No leads found for "{statusFilter}" status in {cityFilter === 'all' ? 'India' : cityFilter}</p>
                        </div>
                      ) : (
                        filteredLeads.map((lead) => (
                          <JobCard key={lead.id || lead['Order ID']} job={lead} />
                        ))
                      )
                    ) : (
                      filteredTutors.length === 0 ? (
                        <div className="col-span-full py-40 text-center space-y-4">
                           <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
                             <User size={40} />
                           </div>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching tutors found in {cityFilter === 'all' ? 'India' : cityFilter}</p>
                        </div>
                      ) : (
                        filteredTutors.map((tutor) => (
                          <TutorCard key={tutor.id || tutor['Tutor ID']} tutor={tutor} />
                        ))
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Footer Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8000] w-[92%] max-w-[400px]">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[32px] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 relative">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => { setActiveTab('home'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
            icon={<HomeIcon size={20} strokeWidth={2.5} />} 
            label="Home" 
          />
          <NavButton 
            active={activeTab === 'leads'} 
            onClick={() => { setActiveTab('leads'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
            icon={<FileText size={20} strokeWidth={2.5} />} 
            label="Leads" 
          />
          <NavButton 
            active={activeTab === 'tutors'} 
            onClick={() => { setActiveTab('tutors'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
            icon={<GraduationCap size={20} strokeWidth={2.5} />} 
            label="Tutors" 
          />
          <NavButton 
            active={activeTab === 'alerts'} 
            onClick={() => { setActiveTab('alerts'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
            icon={<Bell size={20} strokeWidth={2.5} />} 
            label="Alerts" 
          />
          {isAdminUser && (
            <div className="absolute -top-16 right-0">
               <button 
                  onClick={() => setShowAdminSettings(true)}
                  className="w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 border border-slate-100 active:scale-95 transition-all"
                >
                  <Settings size={20} />
                </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-3 px-5 rounded-2xl transition-all duration-300 relative",
        active ? "bg-white text-slate-900 scale-105 shadow-lg" : "text-white/40 hover:text-white"
      )}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
        />
      )}
    </button>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] space-y-3 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 w-fit rounded-2xl text-primary">{icon}</div>
      <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
