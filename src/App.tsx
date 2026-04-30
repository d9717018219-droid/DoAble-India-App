/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap, ArrowRight, Navigation, Check } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth, auth as firebaseAuth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { JobLead, ApiResponse, TutorProfile, Alert, UserType } from './types';
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
  const [cityFilter, setCityFilter] = useState(localStorage.getItem('userCity') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'tutors' | 'alerts'>('home');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('Checking...');
  const [jobLimit, setJobLimit] = useState(15);
  const [tutorLimit, setTutorLimit] = useState(15);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(localStorage.getItem('themeMode') as 'light' | 'dark' || 'light');

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

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

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
    if (!subjects || subjects === 'null') return [];
    return subjects.split(';').map(s => s.trim()).filter(s => s);
  };

  const getLocations = (t: TutorProfile) => {
    const locations = t['Preferred Location(s)'] || '';
    if (!locations || locations === 'null') return [t['Preferred City'] || 'India'];
    let locArray: string[] = [];
    try {
      if (locations.startsWith('[')) {
        const parsed = JSON.parse(locations);
        if (Array.isArray(parsed)) locArray = parsed;
      }
    } catch (e) {}
    if (locArray.length === 0 && locations.includes(',')) locArray = locations.split(',');
    if (locArray.length === 0 && locations.includes(';')) locArray = locations.split(';');
    if (locArray.length === 0) locArray = [locations];
    
    return locArray.map(l => {
      const clean = l.trim();
      const lastDash = clean.lastIndexOf('-');
      // If we have a dash, we assume it's "Area - City" and extract "Area"
      return lastDash > 0 ? clean.substring(0, lastDash).trim() : clean;
    });
  };

  const getCityValue = (t: TutorProfile) => {
    return (t['Preferred City'] || 'India').trim();
  };

  const getTimes = (t: TutorProfile) => {
    const times = t['Preferred Time'] || '';
    if (!times || times === 'null') return [];
    let timeArray: string[] = [];
    if (times.includes(',')) timeArray = times.split(',');
    else if (times.includes(';')) timeArray = times.split(';');
    else timeArray = [times];
    return timeArray.map(t => t.trim()).filter(t => t);
  };

  const getGenderValue = (t: TutorProfile) => {
    const gender = (t.Gender || '').trim();
    return gender && gender !== 'null' ? gender : '–';
  };

  const isCityMatch = (c1: string, c2: string) => {
    if (!c1 || !c2) return false;
    const s1 = c1.toLowerCase().trim();
    const s2 = c2.toLowerCase().trim();
    if (s1 === s2) return true;
    
    // Handle "Ghaziabad" vs "Ghaziabad City", "Panchkula" vs "Panchkula City" etc.
    if (s1 === s2 + ' city' || s2 === s1 + ' city') return true;

    // Flexible matching with contains
    if (s1.includes(s2) || s2.includes(s1)) {
       // CRITICAL: Explicitly separate Noida and Greater Noida
       // If one contains "greater" and the other doesn't, but both are "noida", it's NOT a match
       const isOneGreater = s1.includes('greater');
       const isTwoGreater = s2.includes('greater');
       if (isOneGreater !== isTwoGreater) {
         if (s1.includes('noida') && s2.includes('noida')) {
           return false;
         }
       }
       return true;
    }
    
    // NCR mapping
    if ((s1 === 'delhi' && s2.includes('ncr')) || (s2 === 'delhi' && s1.includes('ncr'))) return true;

    return false;
  };

  const isLocationMatch = (leadLocations: string | undefined, selectedLocations: string[], leadCity: string | undefined) => {
    if (!selectedLocations || selectedLocations.length === 0) return true;
    
    // Support both Locations and Location fields
    const rawLocs = (leadLocations || (leadLocations as any)?.Location || '').toString().toLowerCase();
    const city = (leadCity || '').toLowerCase().trim();
    
    // If the lead has no specific location, or location is just the city name, we consider it a match for the city
    if (!rawLocs || rawLocs === 'null' || rawLocs.trim() === '' || rawLocs.trim() === city) {
      return true;
    }
    
    const leadLocsLower = rawLocs.toLowerCase();
    const leadClean = leadLocsLower.replace(/[^a-z0-9]/g, '');
    
    return selectedLocations.some(selectedLoc => {
      const slLower = selectedLoc.toLowerCase();
      const slClean = slLower.replace(/[^a-z0-9]/g, '');
      
      // Simple substring match on cleaned strings
      if (leadClean.includes(slClean) || slClean.includes(leadClean)) return true;
      
      // Smart numeric matching for sectors
      const slNumbers = slLower.match(/\d+/g);
      if (slNumbers && slNumbers.length > 0) {
        const num = slNumbers[0];
        // Check if the number exists as a word or with common abbreviations in leadLocsLower
        const sectorRegex = new RegExp(`(^|\\b|\\s|sec|s|-)${num}(\\b|\\s|th|st|nd|rd|std|$)`, 'i');
        if (sectorRegex.test(leadLocsLower)) return true;
      }
      
      return false;
    });
  };

  const getNumbers = (str: string) => {
    const romanMap: Record<string, number> = {
      'xii': 12, 'xi': 11, 'x': 10, 'ix': 9, 'viii': 8, 'vii': 7, 'vi': 6, 'v': 5, 'iv': 4, 'iii': 3, 'ii': 2, 'i': 1
    };
    
    const results: number[] = [];
    const lowerStr = str.toLowerCase();
    
    // Pattern for ranges like "1 to 5", "I to V", "1-5"
    const rangePattern = /(\d+|[ivxl]+)\s*to\s*(\d+|[ivxl]+)|(\d+|[ivxl]+)\s*-\s*(\d+|[ivxl]+)/i;
    const rangeMatch = lowerStr.match(rangePattern);
    
    if (rangeMatch) {
      let startStr = rangeMatch[1] || rangeMatch[3];
      let endStr = rangeMatch[2] || rangeMatch[4];
      
      let start = parseInt(startStr);
      if (isNaN(start)) start = romanMap[startStr] || 0;
      
      let end = parseInt(endStr);
      if (isNaN(end)) end = romanMap[endStr] || 0;
      
      if (start > 0 && end >= start) {
        for (let i = start; i <= end; i++) results.push(i);
        return results;
      }
    }

    // Individual numbers
    const numMatches = lowerStr.match(/\d+/g);
    if (numMatches) {
      numMatches.forEach(n => results.push(parseInt(n)));
    }
    
    // Individual Roman numerals (only if standing alone to avoid false positives)
    Object.entries(romanMap).forEach(([roman, val]) => {
      const regex = new RegExp(`(^|\\b|\\s)${roman}($|\\b|\\s|std)`, 'i');
      if (regex.test(lowerStr)) {
        results.push(val);
      }
    });
    
    return Array.from(new Set(results));
  };

  const handleAdminAccess = async () => {
    let user = currentUser;
    
    if (!user) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      } catch (error) {
        console.error("Sign-in failed:", error);
        return;
      }
    }

    if (user?.email === 'd9717018219@gmail.com') {
      setShowAdminSettings(true);
    } else {
      alert("Access Denied: You do not have permission to access System Settings.");
    }
  };

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('userCity'));
  const [isSelectingCityOnly, setIsSelectingCityOnly] = useState(false);

  const theme = useMemo(() => getCityTheme(userCity), [userCity]);

  useEffect(() => {
    if (showOnboarding && onboardingStep === 0) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio blocked', e));
    }
  }, [showOnboarding]);

  useEffect(() => {
     // If user changes city, we should reset selected locations if city changed
     if (editCity) {
        // We could reset editTutorLocations here if wanted
     }
  }, [editCity]);

  useEffect(() => {
    // Ensure dark mode is removed from body explicitly
    document.body.classList.remove('dark');

    // Auth listener
    const unsubAuth = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
    });

    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      unsubAuth();
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  // Reset limits when changing tabs or filters
  useEffect(() => {
    setJobLimit(15);
    setTutorLimit(15);
  }, [activeTab, cityFilter, searchQuery]);

  const installApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setShowInstallBanner(false);
        setDeferredPrompt(null);
      });
    }
  };

  // Real-time Jobs from Firestore
  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('postedAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fsJobs = snapshot.docs.map(doc => {
        const data = doc.data();
        const postedAt = data.postedAt;
        let updatedTime = new Date().toISOString();
        if (postedAt) {
          if (typeof postedAt.toDate === 'function') {
            updatedTime = postedAt.toDate().toISOString();
          } else if (postedAt instanceof Date) {
            updatedTime = postedAt.toISOString();
          } else if (typeof postedAt === 'string') {
            updatedTime = new Date(postedAt).toISOString();
          }
        }
        return {
          'Order ID': data.orderId,
          City: data.city,
          subjects: data.subject,
          'Updated Time': updatedTime,
          Name: 'New Requirement',
          'Internal Remark': 'searching',
          'Preferred Job Type': 'Home Tuition',
          'Class / Board': data.classBoard,
          'Locations': data.area,
          'Gender': data.gender || 'Any',
          'Fee': data.fee || '-',
          'Notes': data.notes || '',
          'duration': data.duration || '',
          'days': data.days || '',
          'time': data.time || '',
          'residency': data.residency || 'Student Home',
        } as JobLead;
      });
      // We'll keep these separate or merge them. Merging is better for "Jobs" tab.
      setFirestoreLeads(fsJobs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
    });

    return () => unsubscribe();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        let errorMsg = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.details || errorMsg;
        } catch (e) {
          // Response was not JSON
        }
        throw new Error(errorMsg);
      }

      const json: ApiResponse<JobLead> = await response.json();
      
      if (json.status === 'success') {
        const normalized = json.data.map(lead => {
          // Normalize dates: Updated Time > Created Time > Record Added > Now
          let dateStr = lead['Updated Time'] || (lead as any)['Created Time'] || (lead as any)['Record Added'];
          if (!dateStr || dateStr === '0000-00-00 00:00:00') {
            dateStr = new Date().toISOString();
          }
          return { ...lead, 'Updated Time': dateStr };
        });

        const filtered = normalized
          .filter(x => {
            const remark = (x['Internal Remark'] || '').trim().toLowerCase();
            return remark.includes('searching') || remark.includes('search');
          })
          .sort((a, b) => {
            const dateA = new Date(a['Updated Time']).getTime();
            const dateB = new Date(b['Updated Time']).getTime();
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
          });
        setLeads(filtered);
      } else {
        throw new Error(json.message || 'API returned failure status');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      // "Failed to fetch" can happen if the proxy or internet is problematic
      const message = (err.message?.includes('Failed to fetch') || err.message?.includes('Connection lost'))
        ? '⚠️ Data Sync Issue: Connection to teaching server failed. Please check your internet or try again later.'
        : `⚠️ Sync Error: ${err.message || 'Unable to sync with database'}.`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tutors');

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.details || errorMsg;
        } catch (e) {
          // Response was not JSON
        }
        throw new Error(errorMsg);
      }

      const json: ApiResponse<TutorProfile> = await response.json();
      
      if (json.status === 'success') {
        const sorted = json.data.sort((a, b) => new Date(b['Record Added'] || 0).getTime() - new Date(a['Record Added'] || 0).getTime());
        setTutors(sorted);
      } else {
        throw new Error(json.message || 'API returned failure status');
      }
    } catch (err: any) {
      console.error('Fetch tutors error:', err.message);
      const message = (err.message?.includes('Failed to fetch') || err.message?.includes('Connection lost'))
        ? '⚠️ Tutor List Issue: Connection failed. Please check your internet or try again later.'
        : `⚠️ Load Error: ${err.message || 'Unable to load tutors list'}.`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const selectCity = (city: string | null) => {
    setUserCity(city);
    setCityFilter(city || 'all');
    if (city) {
      localStorage.setItem('userCity', city);
    } else {
      localStorage.removeItem('userCity');
      localStorage.removeItem('userType');
      setUserType(null);
    }
  };

  const selectUserType = (type: UserType) => {
    setUserType(type);
    setEditUserType(type);
    
    // Play sound when starting onboarding
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio blocked', e));
    
    setOnboardingStep(1);
    // Reset fields when switching type to avoid data carryover
    setEditName('');
    setEditGender('');
    setEditTutorGenderPref('Any');
    setEditClasses([]);
  };

  const getMatchingJobsCount = (gender: string, targetClasses: string[], city: string, locations: string[]) => {
    return allLeads.filter(l => {
      // 1. Gender Filter
      const leadGender = (l.Gender || '').toLowerCase().trim();
      let matchesGender = true;
      if (gender && leadGender && leadGender !== 'any') {
        const userG = gender.toLowerCase();
        if (leadGender.includes('female')) matchesGender = userG === 'female';
        else if (leadGender.includes('male')) matchesGender = userG === 'male';
      }
      if (!matchesGender) return false;

      // 2. Class Filter
      let matchesClass = true;
      if (targetClasses.length > 0) {
        const leadClass = ((l['Class / Board'] || '') + ' ' + (l.Class || '')).toString().toLowerCase();
        const leadNums = getNumbers(leadClass);
        matchesClass = targetClasses.some(pref => {
          const prefNums = getNumbers(pref);
          if (leadNums.length > 0 && prefNums.length > 0) {
            if (prefNums.some(n => leadNums.includes(n))) return true;
          }
          const keywords = [pref.toLowerCase().replace(' std', '')];
          return keywords.some(k => {
            const pattern = k.toLowerCase().trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(^|\\b|\\s)${pattern}($|\\b|\\s|th|st|nd|rd|std)`, 'i');
            return regex.test(leadClass);
          });
        });
      }
      if (!matchesClass) return false;

      // 3. City Filter
      if (city && city !== 'all' && city !== '') {
        if (!isCityMatch(l.City, city)) return false;
      }

      // 4. Area Filter
      if (city && city !== 'all' && locations.length > 0) {
        if (!isLocationMatch(l.Locations, locations, l.City)) return false;
      }

      return true;
    }).length;
  };

  const handleCompleteOnboarding = () => {
    if (!editName || (editUserType === 'teacher' && !editGender) || !editUserType || editClasses.length === 0 || !editCity) {
      alert("Please complete all required fields (Name, Gender/Pref, City, Subject List)!");
      return;
    }
    
    localStorage.setItem('userCity', editCity);
    localStorage.setItem('userType', editUserType);
    localStorage.setItem('userName', editName);
    localStorage.setItem('userGender', editGender);
    localStorage.setItem('userClasses', JSON.stringify(editClasses));
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
    
    setUserCity(editCity);
    setUserType(editUserType);
    setUserName(editName);
    setUserGender(editGender);
    setUserClasses(editClasses);
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
    setCityFilter(editCity);
    
    setShowOnboarding(false);
    setIsSelectingCityOnly(false);
    // Auto-navigate to correct tab
    if (editUserType === 'parent') setActiveTab('tutors');
    else setActiveTab('jobs');
  };

  const handleSaveProfile = (
    name: string, 
    gender: string, 
    classes: string[], 
    type?: UserType | null, 
    tutorGender?: string, 
    tutorArea?: string,
    subjects?: string[],
    locations?: string[],
    times?: string[],
    days?: string[],
    fee?: string,
    schoolExp?: string,
    vehicle?: string,
    lastUpdated?: string,
    status?: string
  ) => {
    localStorage.setItem('userName', name);
    localStorage.setItem('userGender', gender);
    localStorage.setItem('userClasses', JSON.stringify(classes));
    if (tutorGender) {
      localStorage.setItem('userTutorGenderPref', tutorGender);
      setUserTutorGenderPref(tutorGender);
    }
    if (tutorArea !== undefined) {
      localStorage.setItem('userTutorArea', tutorArea);
      setUserTutorArea(tutorArea);
    }
    if (subjects) {
      localStorage.setItem('userTutorSubjects', JSON.stringify(subjects));
      setUserTutorSubjects(subjects);
    }
    if (locations) {
      localStorage.setItem('userTutorLocations', JSON.stringify(locations));
      setUserTutorLocations(locations);
    }
    if (times) {
      localStorage.setItem('userTutorTimes', JSON.stringify(times));
      setUserTutorTimes(times);
    }
    if (days) {
      localStorage.setItem('userTutorDays', JSON.stringify(days));
      setUserTutorDays(days);
    }
    if (fee !== undefined) {
      localStorage.setItem('userTutorFee', fee);
      setUserTutorFee(fee);
    }
    if (schoolExp !== undefined) {
      localStorage.setItem('userTutorSchoolExp', schoolExp);
      setUserTutorSchoolExp(schoolExp);
    }
    if (vehicle !== undefined) {
      localStorage.setItem('userTutorVehicle', vehicle);
      setUserTutorVehicle(vehicle);
    }
    if (lastUpdated !== undefined) {
      localStorage.setItem('userTutorLastUpdated', lastUpdated);
      setUserTutorLastUpdated(lastUpdated);
    }
    if (status !== undefined) {
      localStorage.setItem('userTutorStatus', status);
      setUserTutorStatus(status);
    }
    if (type) {
      localStorage.setItem('userType', type);
      setUserType(type);
      // Switch tab if current one is now hidden
      if (type === 'parent' && activeTab === 'jobs') setActiveTab('tutors');
      if (type === 'teacher' && activeTab === 'tutors') setActiveTab('jobs');
    }
    setUserName(name);
    setUserGender(gender);
    setUserClasses(classes);
    setIsEditingProfile(false);
  };

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
    fetchLeads();
    fetchTutors();
    // Initialize city filter from storage if exists
    const storedCity = localStorage.getItem('userCity');
    if (storedCity) {
      setCityFilter(storedCity);
    }
  }, []);

  const cities = useMemo(() => {
    const dataSource = activeTab === 'tutors' ? tutors.map(t => t['Preferred City']) : (leads ? leads.map(l => l.City) : []);
    return ['all', ...Array.from(new Set(dataSource.filter(Boolean)))].sort();
  }, [leads, tutors, activeTab]);

  const allLeads = useMemo(() => {
    const combined = [...firestoreLeads, ...leads];
    const uniqueMap = new Map();
    combined.forEach(l => {
      if (l && l['Order ID'] && !uniqueMap.has(l['Order ID'])) {
        uniqueMap.set(l['Order ID'], l);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => {
      const dateA = new Date(a['Updated Time']).getTime();
      const dateB = new Date(b['Updated Time']).getTime();
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });  }, [leads, firestoreLeads]);

  const availableLocationsForCity = useMemo(() => {
    const city = (activeTab === 'home' || activeTab === 'alerts') ? editCity : cityFilter;
    if (!city || city === 'all') return [];
    
    // Direct lookup from the flat mapping
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
        (l.City?.toLowerCase().includes(searchLower)) ||
        (l.Locations?.toLowerCase().includes(searchLower)) ||
        (l.Notes?.toLowerCase().includes(searchLower)) ||
        (((l['Class / Board'] || '') + ' ' + (l.Class || '')).toLowerCase().includes(searchLower));

      // Area filter for Jobs
      let matchesArea = true;
      if (matchesCity && userTutorLocations.length > 0) {
        matchesArea = isLocationMatch(l.Locations, userTutorLocations, l.City);
      }
      
      // Subject filter for Jobs
      let matchesSubjects = true;
      if (userTutorSubjects.length > 0) {
        const leadSubjs = (l.subjects || '').toLowerCase();
        matchesSubjects = userTutorSubjects.some(s => {
          const lowerS = s.toLowerCase();
          return leadSubjs.includes(lowerS) || lowerS.includes(leadSubjs);
        });
      }
      
      // Gender preference (if job specifies a gender, it must match user's gender)
      let matchesGender = true;
      const leadGender = (l.Gender || '').toLowerCase().trim();
      if (userGender && leadGender && leadGender !== 'any') {
        const userGenderLow = userGender.toLowerCase();
        if (leadGender.includes('female')) {
          matchesGender = userGenderLow === 'female';
        } else if (leadGender.includes('male')) {
          matchesGender = userGenderLow === 'male';
        }
      }

      // Filter by specified classes if user has a profile set
      let matchesPreference = true;
      if (userClasses && userClasses.length > 0) {
        const leadClass = ((l['Class / Board'] || '') + ' ' + (l.Class || '')).toString().toLowerCase();
        const leadNums = getNumbers(leadClass);

        matchesPreference = userClasses.some(pref => {
          const prefNums = getNumbers(pref);
          
          // Intersection check
          if (leadNums.length > 0 && prefNums.length > 0) {
            if (prefNums.some(n => leadNums.includes(n))) return true;
          }

          // Fallback to keyword matching for specific text
          const keywords = [pref.toLowerCase().replace(' std', '')];
          
          return keywords.some(k => {
            const cleanK = k.toLowerCase().trim();
            if (!cleanK) return false;
            const pattern = cleanK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(^|\\b|\\s)${pattern}($|\\b|\\s|th|st|nd|rd|std)`, 'i');
            return regex.test(leadClass);
          });
        });
      }
      
      return matchesCity && matchesArea && matchesSearch && matchesPreference && matchesGender && matchesSubjects;
    });
  }, [allLeads, cityFilter, searchQuery, userClasses, userGender, userTutorLocations, userTutorSubjects]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(t => {
      // 1. Search Filter (Name or ID)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        (t.Name?.toLowerCase().includes(searchLower)) ||
        (t['Tutor ID']?.toString().toLowerCase().includes(searchLower)) ||
        (t['Preferred Subject(s)']?.toLowerCase().includes(searchLower));

      // 2. City & Location (Hierarchical)
      let matchesCityAndLoc = true;
      if (cityFilter !== 'all') {
        const tutorCity = getCityValue(t);
        // Flexible match for city
        const isCityMatchResult = isCityMatch(tutorCity, cityFilter);
        
        if (!isCityMatchResult) {
          matchesCityAndLoc = false;
        } else if (userTutorLocations.length > 0) {
          // If city matches, check specific locations
          const tutorLocs = getLocations(t).map(loc => loc.toLowerCase());
          matchesCityAndLoc = userTutorLocations.some(loc => {
            const l = loc.toLowerCase();
            return tutorLocs.some(tl => tl.includes(l) || l.includes(tl));
          });
        }
      }

      // 3. Gender Filter
      let matchesGender = true;
      if (userTutorGenderPref && userTutorGenderPref !== 'Any') {
        const tutorGender = getGenderValue(t).toLowerCase();
        const prefGender = userTutorGenderPref.toLowerCase();
        matchesGender = tutorGender === prefGender || tutorGender.includes(prefGender);
      }

      // 4. Class & Subject Filter (Hierarchical)
      let matchesClassAndSubj = true;
      if (userClasses.length > 0) {
        const tutorClassString = (t['Preferred Class Group'] || '').toLowerCase();
        const tutorNums = getNumbers(tutorClassString);
        
        const isClassMatch = userClasses.some(cls => {
          const prefNums = getNumbers(cls);
          if (tutorNums.length > 0 && prefNums.length > 0) {
            if (prefNums.some(n => tutorNums.includes(n))) return true;
          }
          
          const c = cls.toLowerCase();
          return tutorClassString.includes(c) || c.includes(tutorClassString);
        });
        
        if (!isClassMatch) {
          matchesClassAndSubj = false;
        } else if (userTutorSubjects.length > 0) {
          // If class matches, check subjects
          const tutorSubjs = getSubjects(t).map(s => s.toLowerCase());
          matchesClassAndSubj = userTutorSubjects.some(subj => {
            const s = subj.toLowerCase();
            return tutorSubjs.some(ts => ts.includes(s) || s.includes(ts));
          });
        }
      }

      // 5. Time Filter
      let matchesTimes = true;
      if (userTutorTimes.length > 0) {
        const tutorTimesArr = getTimes(t).map(v => v.toLowerCase());
        // For matching "Morning", "Afternoon", etc, check if any tutor time falls in that period
        matchesTimes = userTutorTimes.some(period => {
          const validTimes = TIME_PERIODS_DATA[period]?.map(v => v.toLowerCase()) || [];
          return tutorTimesArr.some(tt => validTimes.includes(tt));
        });
      }

      // 6. Day Filter
      let matchesDays = true;
      if (userTutorDays.length > 0) {
        const mode = (t['Mode of Teaching'] || '').toLowerCase();
        matchesDays = userTutorDays.some(group => {
          const groupDays = DAY_GROUPS_DATA[group as keyof typeof DAY_GROUPS_DATA]?.map(d => d.toLowerCase()) || [];
          return groupDays.some(d => mode.includes(d));
        });
      }

      // 7. Fee Filter
      let matchesFee = true;
      if (userTutorFee) {
        const fee = t['Fee/Month'] || '0';
        const feeNum = parseInt(fee.replace(/\D/g, '')) || 0;
        switch(userTutorFee) {
          case '0-300': matchesFee = feeNum >= 0 && feeNum < 300; break;
          case '300-600': matchesFee = feeNum >= 300 && feeNum < 600; break;
          case '600-1000': matchesFee = feeNum >= 600 && feeNum < 1000; break;
          case '1000+': matchesFee = feeNum >= 1000; break;
        }
      }

      // 8. School Experience Filter
      const matchesSchoolExp = !userTutorSchoolExp || t['School Exp.'] === userTutorSchoolExp;

      // 9. Own Vehicle Filter
      const matchesVehicle = !userTutorVehicle || t['Have own Vehicle'] === userTutorVehicle;

      // 10. Last Updated Filter
      let matchesLastUpdated = true;
      if (userTutorLastUpdated) {
        const lastUpdatedStr = t['Last Updated'] || t['Record Added'];
        if (lastUpdatedStr) {
          const lastUpdatedDate = new Date(lastUpdatedStr);
          const daysAgo = Math.floor((new Date().getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24));
          matchesLastUpdated = daysAgo <= parseInt(userTutorLastUpdated);
        }
      }

      // 11. Status Filter
      const matchesStatus = !userTutorStatus || t['Status'] === userTutorStatus;

      return matchesSearch && matchesCityAndLoc && matchesGender && matchesClassAndSubj && matchesTimes && matchesDays && matchesFee && matchesSchoolExp && matchesVehicle && matchesLastUpdated && matchesStatus;
    });
  }, [tutors, cityFilter, searchQuery, userTutorGenderPref, userClasses, userTutorSubjects, userTutorLocations, userTutorTimes, userTutorDays, userTutorFee, userTutorSchoolExp, userTutorVehicle, userTutorLastUpdated, userTutorStatus]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden font-sans flex flex-col">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-md space-y-8 py-10">
            <AnimatePresence mode="wait">
              {onboardingStep === 0 && (
                <motion.div 
                  key="step0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto text-primary">
                      <Zap size={48} className="animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none font-display">Welcome to<br/>DoAbLe India</h1>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed">The Premium Tuition Connection Hub</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Who Am I?</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                         onClick={() => selectUserType('parent')}
                         className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[32px] border-2 border-transparent hover:border-primary/30 transition-all flex flex-col items-center gap-3 active:scale-95 group"
                      >
                         <User size={32} className="text-primary/60 group-hover:scale-110 transition-transform" />
                         <span className="text-xs font-black uppercase tracking-tight dark:text-slate-300">I'm Parent</span>
                      </button>
                      <button 
                         onClick={() => selectUserType('teacher')}
                         className="bg-slate-900 dark:bg-primary text-white p-6 rounded-[32px] border-2 border-transparent hover:border-primary/50 transition-all flex flex-col items-center gap-3 active:scale-95 group"
                      >
                         <GraduationCap size={32} className="text-primary dark:text-white group-hover:scale-110 transition-transform" />
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
                  className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 space-y-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your Identity</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Update Your Details</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                      <input 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-sm font-black shadow-inner focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-300 dark:text-white"
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
                          {getMatchingJobsCount(editGender, [], 'all', [])} Matching Jobs Available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setOnboardingStep(0)}
                      className="flex-1 bg-slate-50 text-slate-400 p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (!editName || (editUserType === 'teacher' && !editGender)) {
                          alert("Please complete your identity details!");
                          return;
                        }
                        setOnboardingStep(2);
                      }}
                      className="flex-[2] bg-primary text-white p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                      Continue <ArrowRight size={18} />
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
                  className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 space-y-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Subject List</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Academic Target</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select from Subject List you are interested in:</p>
                    <div className="grid grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto p-2 scroll-smooth custom-scrollbar">
                       {CLASSES_LIST.map(cls => (
                         <button
                           key={cls}
                           onClick={() => setEditClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls])}
                           className={cn(
                             "p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center",
                             editClasses.includes(cls) ? "bg-slate-900 dark:bg-primary text-white shadow-xl scale-105" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-transparent"
                           )}
                         >
                           {cls}
                         </button>
                       ))}
                    </div>

                    {editClasses.length > 0 && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Now select subjects:</p>
                        <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800">
                          {Array.from(new Set(editClasses.flatMap(cls => CLASS_SUBJECTS_DATA[cls] || []))).map((subj, idx) => (
                            <button
                              key={`${subj}-${idx}`}
                              onClick={() => setEditTutorSubjects(prev => prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj])}
                              className={cn(
                                "px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                editTutorSubjects.includes(subj) ? "bg-primary text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700"
                              )}
                            >
                              {subj}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {editUserType === 'teacher' && editClasses.length > 0 && (
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                          {getMatchingJobsCount(editGender, editClasses, 'all', [])} Matching Jobs Available
                        </p>
                      )}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setOnboardingStep(1)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-400 p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (editClasses.length === 0) {
                          alert("Please select at least one item from the Subject List!");
                          return;
                        }
                        setOnboardingStep(3);
                      }}
                      className="flex-[2] bg-primary text-white p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                      Choose City <ArrowRight size={18} />
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
                  className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 space-y-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Select City</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Base Location</p>
                    </div>
                  </div>

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
                          "min-h-[70px] p-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center text-center leading-tight break-words",
                          editCity === city ? "bg-slate-900 dark:bg-primary text-white shadow-2xl scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                    {editUserType === 'teacher' && editCity && (
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse mt-4">
                          {getMatchingJobsCount(editGender, editClasses, editCity, [])} Matching Jobs in {editCity}
                        </p>
                      )}

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setOnboardingStep(2)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-400 p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Back
                    </button>
                    {!isSelectingCityOnly && (
                      <button 
                        onClick={() => {
                          if (!editCity) {
                            alert("Please select your city!");
                            return;
                          }
                          setOnboardingStep(4);
                        }}
                        className="flex-[2] bg-primary text-white p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20"
                      >
                        Next: Areas <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                  
                  {/* System Settings Link - Restyled and restricted as requested */}
                  <div className="flex justify-center -mb-4">
                    <button 
                      onClick={handleAdminAccess}
                      className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 py-2 cursor-default select-none transition-none pointer-events-auto"
                    >
                      System Setting
                    </button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 space-y-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Navigation size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pick Areas</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Neighborhood Reach</p>
                    </div>
                  </div>

                    <div className="space-y-4">
                      <div className="relative group">
                        <input 
                          type="text"
                          placeholder="Search for area (e.g. Indiranagar)"
                          value={areaSearch}
                          onChange={(e) => setAreaSearch(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 pl-12 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:text-white"
                        />
                        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                      </div>

                      <div className="flex justify-between items-end ml-1 pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Select your reach:</p>
                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest animate-pulse">Scroll to see all ↓</p>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-200">
                         {(() => {
                            let locations = [...availableLocationsForCity];
                            
                            // Apply search filter
                            if (areaSearch) {
                              locations = locations.filter(l => l.toLowerCase().includes(areaSearch.toLowerCase()));
                            }

                            if (locations.length === 0) return (
                            <div className="w-full text-center py-8">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">No precise area data found for this city.<br/>You can select areas from results later.</p>
                            </div>
                          );
                          return locations.map(loc => (
                            <button
                              key={loc}
                              onClick={() => setEditTutorLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc])}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                editTutorLocations.includes(loc) ? "bg-slate-900 dark:bg-primary text-white shadow-lg shadow-slate-200" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700"
                              )}
                            >
                              {loc}
                            </button>
                          ));
                       })()}
                          {editUserType === 'teacher' && (
                            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse mt-4">
                              {getMatchingJobsCount(editGender, editClasses, editCity, editTutorLocations)} Final Matching Jobs
                            </p>
                          )}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setOnboardingStep(3)}
                      className="flex-1 bg-slate-50 text-slate-400 p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleCompleteOnboarding}
                      className="flex-[2] bg-primary text-white p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                      Finish Setup <Check size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-0 w-full bg-primary text-white p-[10px_15px] flex justify-between items-center z-[9999] text-[12px] font-[600] shadow-lg">
          <span>📲 Install DoAble India!</span>
          <button 
            onClick={installApp}
            className="bg-[#FFE66D] text-black border-none p-[6px_14px] rounded-lg font-[800] cursor-pointer text-[11px]"
          >
            INSTALL
          </button>
        </div>
      )}

      {/* Filter Drawer Portal (only for Tutors tab) */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[10000] overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Smart Filter</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTab === 'jobs' ? 'Job Discovery' : 'Tutor Discovery'}</p>
                  </div>
                </div>
                <button onClick={() => setShowFilterDrawer(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* City Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current City</label>
                  <select 
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setUserTutorLocations([]); }}
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-extrabold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                  >
                    <option value="all">Everywhere</option>
                    {CITIES_LIST.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>

                {/* Sub Locations */}
                {cityFilter !== 'all' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local Areas in {cityFilter}</label>
                    </div>
                    
                    <div className="relative group mb-2">
                       <input 
                         type="text"
                         placeholder={`Search areas in ${cityFilter}...`}
                         value={areaSearch}
                         onChange={(e) => setAreaSearch(e.target.value)}
                         className="w-full bg-slate-50 border-none p-3 pl-10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                       />
                       <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-[32px] border border-slate-100/50 scrollbar-thin">
                       {(() => {
                          let locations = [...availableLocationsForCity];

                          // Filter by area search
                          if (areaSearch) {
                            locations = locations.filter(l => l.toLowerCase().includes(areaSearch.toLowerCase()));
                          }

                          if (locations.length === 0) return <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest py-4 w-full text-center">No matching areas</p>;
                          return locations.map(loc => (
                            <button
                              key={loc}
                              onClick={() => {
                                const next = userTutorLocations.includes(loc) ? userTutorLocations.filter(l => l !== loc) : [...userTutorLocations, loc];
                                setUserTutorLocations(next);
                                localStorage.setItem('userTutorLocations', JSON.stringify(next));
                              }}
                              className={cn(
                                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                userTutorLocations.includes(loc) ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-slate-400 border border-slate-100"
                              )}
                            >
                              {loc}
                            </button>
                          ));
                       })()}
                    </div>
                  </div>
                )}

                {/* Gender Preference */}
                {activeTab === 'tutors' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tutor Gender</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Any', 'Male', 'Female'].map(g => (
                        <button 
                          key={g}
                          onClick={() => {
                            setUserTutorGenderPref(g);
                            localStorage.setItem('userTutorGenderPref', g);
                          }}
                          className={cn(
                            "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            userTutorGenderPref === g ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400"
                          )}
                        >
                          {g === 'Any' ? 'All' : g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Class & Subject matching */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject List</label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                       {CLASSES_LIST.map(cls => (
                         <button
                           key={cls}
                           onClick={() => {
                             const next = userClasses.includes(cls) ? userClasses.filter(c => c !== cls) : [...userClasses, cls];
                             setUserClasses(next);
                             localStorage.setItem('userClasses', JSON.stringify(next));
                           }}
                           className={cn(
                             "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                             userClasses.includes(cls) ? "bg-primary text-white border-primary shadow-md" : "bg-white text-slate-300 border-slate-100"
                           )}
                         >
                           {cls}
                         </button>
                       ))}
                    </div>
                    {userClasses.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-[32px] border border-slate-100/50">
                         {Array.from(new Set(userClasses.flatMap(cls => CLASS_SUBJECTS_DATA[cls] || []))).map((subj, idx) => (
                           <button
                             key={`${subj}-${idx}`}
                             onClick={() => {
                               const next = userTutorSubjects.includes(subj) ? userTutorSubjects.filter(s => s !== subj) : [...userTutorSubjects, subj];
                               setUserTutorSubjects(next);
                               localStorage.setItem('userTutorSubjects', JSON.stringify(next));
                             }}
                             className={cn(
                               "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                               userTutorSubjects.includes(subj) ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "bg-white text-slate-400 border border-slate-100"
                             )}
                           >
                             {subj}
                           </button>
                         ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability */}
                {activeTab === 'tutors' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Availability (Days)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(DAY_GROUPS_DATA).map(group => (
                            <button 
                              key={group}
                              onClick={() => {
                                const next = userTutorDays.includes(group) ? userTutorDays.filter(g => g !== group) : [...userTutorDays, group];
                                setUserTutorDays(next);
                                localStorage.setItem('userTutorDays', JSON.stringify(next));
                              }}
                              className={cn("p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", userTutorDays.includes(group) ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 text-slate-400")}
                            >
                              {group}
                            </button>
                          ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Availability (Time)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.keys(TIME_PERIODS_DATA).map(period => (
                            <button 
                              key={period}
                              onClick={() => {
                                const next = userTutorTimes.includes(period) ? userTutorTimes.filter(p => p !== period) : [...userTutorTimes, period];
                                setUserTutorTimes(next);
                                localStorage.setItem('userTutorTimes', JSON.stringify(next));
                              }}
                              className={cn("p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", userTutorTimes.includes(period) ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 text-slate-400")}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                    </div>

                    {/* Add New Detailed Filters */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fee Range</label>
                        <select 
                          value={userTutorFee}
                          onChange={(e) => { setUserTutorFee(e.target.value); localStorage.setItem('userTutorFee', e.target.value); }}
                          className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-extrabold outline-none appearance-none"
                        >
                          <option value="">All Fees</option>
                          <option value="0-300">₹0 - ₹300</option>
                          <option value="300-600">₹300 - ₹600</option>
                          <option value="600-1000">₹600 - ₹1000</option>
                          <option value="1000+">₹1000+</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">School Exp.</label>
                          <select 
                            value={userTutorSchoolExp}
                            onChange={(e) => { setUserTutorSchoolExp(e.target.value); localStorage.setItem('userTutorSchoolExp', e.target.value); }}
                            className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-extrabold outline-none appearance-none"
                          >
                            <option value="">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Own Vehicle</label>
                          <select 
                            value={userTutorVehicle}
                            onChange={(e) => { setUserTutorVehicle(e.target.value); localStorage.setItem('userTutorVehicle', e.target.value); }}
                            className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-extrabold outline-none appearance-none"
                          >
                            <option value="">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Updated</label>
                        <select 
                          value={userTutorLastUpdated}
                          onChange={(e) => { setUserTutorLastUpdated(e.target.value); localStorage.setItem('userTutorLastUpdated', e.target.value); }}
                          className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-extrabold outline-none appearance-none"
                        >
                          <option value="">All</option>
                          <option value="7">Last 7 days</option>
                          <option value="30">Last 30 days</option>
                          <option value="90">Last 90 days</option>
                          <option value="180">Last 180 days</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tutor Status</label>
                        <select 
                          value={userTutorStatus}
                          onChange={(e) => { setUserTutorStatus(e.target.value); localStorage.setItem('userTutorStatus', e.target.value); }}
                          className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-extrabold outline-none appearance-none"
                        >
                          <option value="">All Status</option>
                          <option value="Active">Active</option>
                          <option value="Not Available">Not Available</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50">
                 <div className="flex gap-4">
                   <button 
                     onClick={() => {
                        setUserTutorLocations([]);
                        setUserTutorSubjects([]);
                        setUserTutorTimes([]);
                        setUserTutorDays([]);
                        setUserTutorGenderPref('Any');
                        setUserTutorFee('');
                        setUserTutorSchoolExp('');
                        setUserTutorVehicle('');
                        setUserTutorLastUpdated('');
                        setUserTutorStatus('');
                        setUserClasses([]);
                        setCityFilter('all');
                        localStorage.removeItem('userTutorLocations');
                        localStorage.removeItem('userTutorSubjects');
                        localStorage.removeItem('userTutorTimes');
                        localStorage.removeItem('userTutorDays');
                        localStorage.removeItem('userTutorFee');
                        localStorage.removeItem('userTutorSchoolExp');
                        localStorage.removeItem('userTutorVehicle');
                        localStorage.removeItem('userTutorLastUpdated');
                        localStorage.removeItem('userTutorStatus');
                        localStorage.removeItem('userClasses');
                        localStorage.setItem('userTutorGenderPref', 'Any');
                     }}
                     className="flex-1 border-2 border-slate-200 text-slate-400 py-4 rounded-[20px] font-extrabold text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95"
                   >
                     Reset All
                   </button>
                   <button 
                     onClick={() => setShowFilterDrawer(false)}
                     className="flex-[2] bg-slate-900 text-white py-4 rounded-[20px] font-extrabold text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                   >
                     View {activeTab === 'jobs' ? filteredLeads.length : filteredTutors.length} Results
                   </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header 
        className={cn(
          "sticky top-0 transition-all duration-500 z-50",
          activeTab === 'home' ? "p-6 bg-white dark:bg-slate-950" : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-sm"
        )}
      >
        <div className={cn(activeTab === 'home' ? "" : "p-4 space-y-4 max-w-[1200px] mx-auto")}>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              {activeTab === 'home' ? (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1"
                >
                  <h1 className="text-4xl font-black tracking-tighter leading-none font-display bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-gradient-x">
                    {timeGreeting}, {userName?.split(' ')[0] || 'Friend'}
                  </h1>
                  <p className="text-[11px] font-medium text-slate-500 leading-tight">
                    Thanks for being a <span style={{ color: theme.solid }} className="font-bold">{userType === 'teacher' ? 'professional tutor' : 'parent member'}</span> with DoAble India
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => {
                        setIsSelectingCityOnly(true);
                        setShowOnboarding(true);
                        setOnboardingStep(3);
                     }}
                     className="flex items-center gap-1.5 group"
                   >
                     <MapPin size={16} className="text-primary fill-primary/10" />
                     <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter border-b-2 border-primary/20 group-hover:border-primary transition-all">
                       {userCity}
                     </span>
                     <ChevronRight size={14} className="text-slate-400 rotate-90" />
                   </button>
                   
                   {!showTutorForm && (activeTab === 'jobs' || activeTab === 'tutors') && (
                     <div className="flex gap-2">
                        <div className="relative group flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                          <input 
                            type="text"
                            placeholder={activeTab === 'jobs' ? "Search city, subject..." : "Search tutors..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] py-2.5 pl-10 pr-8 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none placeholder:text-slate-400 dark:text-slate-500 shadow-sm dark:text-white"
                          />
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={() => setShowFilterDrawer(true)}
                          className={cn(
                            "p-2.5 rounded-[16px] shadow-sm transition-all active:scale-95 flex items-center justify-center border-2",
                            (userTutorLocations.length > 0 || userTutorSubjects.length > 0 || cityFilter !== 'all' || userTutorGenderPref !== 'Any' || userTutorFee || userClasses.length > 0) 
                              ? "bg-primary text-white border-primary" 
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700"
                          )}
                        >
                          <Filter size={18} strokeWidth={2.5} />
                        </button>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 self-start pt-1">
              {currentUser && (
                <button 
                  onClick={() => firebaseAuth.signOut()} 
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>

          {activeTab !== 'home' && !showTutorForm && (activeTab === 'jobs' || activeTab === 'tutors') && (
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
               {userTutorLocations.length > 0 && (
                 <button 
                   onClick={() => setShowFilterDrawer(true)}
                   className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all"
                 >
                   <MapPin size={10} /> {userTutorLocations.length} Areas
                 </button>
               )}
               {userTutorSubjects.length > 0 && (
                 <button 
                   onClick={() => setShowFilterDrawer(true)}
                   className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all"
                 >
                   <BookOpen size={10} /> {userTutorSubjects.length} Subjects
                 </button>
               )}
               {userTutorGenderPref !== 'Any' && (
                 <button 
                   onClick={() => setShowFilterDrawer(true)}
                   className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap active:scale-95 transition-all"
                 >
                   {userTutorGenderPref} Only
                 </button>
               )}
               {userTutorFee && (
                 <button 
                   onClick={() => setShowFilterDrawer(true)}
                   className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap active:scale-95 transition-all"
                 >
                   ₹ {userTutorFee}
                 </button>
               )}
            </div>
          )}

          {activeTab !== 'home' && (activeTab === 'alerts' || !showTutorForm && activeTab !== 'jobs' && activeTab !== 'tutors') && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
              <div className="bg-primary/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/10 shrink-0">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-primary">
                  {userType === 'teacher' ? filteredLeads.length : allLeads.filter(l => isCityMatch(l.City, userCity)).length} Active Leads
                </span>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-100 shrink-0">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-blue-600">
                  {tutors.filter(t => isCityMatch(getCityValue(t), userCity) || (t['Preferred Location(s)'] || '').toLowerCase().includes(userCity.toLowerCase())).length} Tutors
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-none container mx-auto p-4 max-w-[1200px] relative z-30 pb-32 overscroll-y-contain touch-pan-y">
        {showTutorForm ? (
          <div className="animate-in slide-in-from-bottom duration-500 bg-white dark:bg-slate-900 min-h-[85vh] rounded-[48px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl relative">
            <div className="bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Settings className="animate-spin-slow" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Update Profile</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Sync</p>
                </div>
              </div>
              <button
                onClick={() => setShowTutorForm(false)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
              >
                Return Home
              </button>
            </div>
            <iframe
              src="https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8"
              className="w-full h-[75vh] border-none dark:invert dark:hue-rotate-180 dark:brightness-90"
              title="Tutor Update Form"
            />
            <div className="p-6 bg-slate-50 dark:bg-slate-950 text-center border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                Securely encrypted on DoAble servers. Changes reflect within 24-48 hours.
              </p>
            </div>
          </div>
        ) : (          <>
            {activeTab === 'home' && (
              <div className="flex-1 flex flex-col justify-start py-4 space-y-6 overflow-hidden">
                {/* 2. Hero Action Card - Dynamic & Full Width */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  onClick={() => {
                    setActiveTab(userType === 'parent' ? 'tutors' : 'jobs');
                    window.scrollTo({top: 0, behavior: 'smooth'});
                  }}
                  style={{ background: theme.grad }}
                  className="p-8 rounded-[40px] relative overflow-hidden shadow-2xl shadow-slate-200 border border-white/10 group w-full cursor-pointer active:scale-[0.98] transition-all"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                  <div className="absolute bottom-8 right-8 text-white/40 group-hover:text-white/60 transition-colors">
                    <ArrowRight size={48} strokeWidth={3} />
                  </div>

                  <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black leading-tight text-white tracking-tighter">
                        {userType === 'parent' ? 'Find Expert Tutors' : 'Find Tuition Jobs'}
                      </h3>
                      <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest">
                        Available in {userCity}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                        <p className="text-[8px] font-bold text-white/60 mb-1">Active Jobs</p>
                        <p className="text-2xl font-black text-white leading-none">
                          {userType === 'teacher' ? filteredLeads.length : allLeads.filter(l => isCityMatch(l.City, userCity)).length}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                        <p className="text-[8px] font-bold text-white/60 mb-1">Active Tutors</p>
                        <p className="text-2xl font-black text-white leading-none">
                          {tutors.filter(t => isCityMatch(getCityValue(t), userCity) || (t['Preferred Location(s)'] || '').toLowerCase().includes(userCity.toLowerCase())).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 3. Primary Action Buttons - Uber Style (Clean & Full Width) */}
                <div className="space-y-4 pt-2">
                  <button 
                    onClick={() => {
                      setIsSelectingCityOnly(true);
                      setShowOnboarding(true);
                      setOnboardingStep(3);
                    }}
                    className="w-full bg-slate-50 text-slate-900 p-5 rounded-[28px] font-bold text-sm flex items-center justify-between border border-slate-100 shadow-sm active:scale-98 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-primary/5 transition-colors">
                        <MapPin size={22} className="text-primary" />
                      </div>
                      <span className="text-slate-700">Change city</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>

                  <button 
                    onClick={() => {
                      setShowOnboarding(true);
                      setOnboardingStep(0);
                    }}
                    className="w-full bg-primary/5 text-primary p-5 rounded-[28px] font-bold text-sm flex items-center justify-between border border-primary/10 shadow-sm active:scale-98 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Settings size={22} className="text-primary" />
                      </div>
                      <span className="text-primary">Change my preference</span>
                    </div>
                    <ChevronRight size={18} className="text-primary/30" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <AlertsView 
                city={userCity || 'All'} 
                userGender={userGender} 
                userClasses={userClasses} 
                userType={userType} 
                setShowTutorForm={setShowTutorForm} 
                themeMode={themeMode}
                setThemeMode={setThemeMode}
              />
            )}
        
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

        {(activeTab as any) === 'admin' && isAdminUser && <AdminPanel currentCity={userCity || 'All'} />}
        {(activeTab as any) === 'admin' && !isAdminUser && (
           <div className="flex flex-col items-center justify-center p-20 text-center">
              <X size={64} className="text-rose-500 mb-6" />
              <h2 className="text-2xl font-black text-slate-900">Restricted Area</h2>
              <p className="text-slate-500 mt-2">Only the app owner can access this module.</p>
           </div>
        )}

        {(activeTab === 'jobs' || activeTab === 'tutors') && !showTutorForm && (
          <div className="animate-in fade-in duration-500 relative">
            <div className="space-y-6">
              {loading && (leads.length === 0 && tutors.length === 0) ? (
              <div className="text-center p-32 text-primary font-black flex flex-col items-center gap-5">
                <Loader2 className="animate-spin" size={40} />
                <div className="uppercase tracking-[0.3em] text-[10px] opacity-40">Syncing Data</div>
              </div>
            ) : error ? (
              <div className="text-center p-12 bg-slate-50 rounded-[40px] m-5 border border-slate-100">
                <p className="text-red-500 font-bold mb-6">{error}</p>
                <button onClick={activeTab === 'jobs' ? fetchLeads : fetchTutors} className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">Retry Sync</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                  <AnimatePresence initial={false} mode="popLayout">
                    {activeTab === 'jobs' ? (
                      filteredLeads.slice(0, jobLimit).map((job) => (
                        <JobCard key={job['Order ID']} job={job} />
                      ))
                    ) : (
                      filteredTutors.slice(0, tutorLimit).map((tutor) => (
                        <TutorCard key={tutor['Tutor ID']} tutor={tutor} />
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Load More */}
                {((activeTab === 'jobs' && filteredLeads.length > jobLimit) || 
                  (activeTab === 'tutors' && filteredTutors.length > tutorLimit)) && (
                  <div className="flex justify-center p-10 pb-20">
                    <button 
                      onClick={() => {
                        const increment = 15;
                        if (activeTab === 'jobs') {
                          setJobLimit(prev => Math.min(prev + increment, filteredLeads.length));
                        } else {
                          setTutorLimit(prev => Math.min(prev + increment, filteredTutors.length));
                        }
                      }}
                      className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                      Load {activeTab === 'jobs' ? (filteredLeads.length - jobLimit) : (filteredTutors.length - tutorLimit)} More {activeTab === 'jobs' ? 'Jobs' : 'Tutors'}
                    </button>
                  </div>
                )}

                {(activeTab === 'jobs' ? filteredLeads.length : filteredTutors.length) === 0 && (
                  <div className="col-span-full text-center py-32 opacity-20 text-slate-900 font-black">
                    <Search size={64} className="mx-auto mb-6" />
                    <p className="uppercase tracking-widest text-sm">No results found</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </>
    )}
  </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md flex flex-col items-center gap-3 z-[3000]">
        <div className="w-full bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-[28px] border border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-around items-center safe-area-bottom">
          <NavButton 
            active={activeTab === 'home' && !showTutorForm} 
            onClick={() => { setActiveTab('home'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            icon={<HomeIcon size={24} />}
            label="Home"
          />
          {userType !== 'parent' && (
            <NavButton 
              active={activeTab === 'jobs'} 
              onClick={() => { setActiveTab('jobs'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              icon={<FileText size={24} />}
              label="Jobs"
            />
          )}
          {userType !== 'teacher' && (
            <NavButton 
              active={activeTab === 'tutors'} 
              onClick={() => { setActiveTab('tutors'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              icon={<User size={24} />}
              label="Tutors"
            />
          )}
          <NavButton 
            active={activeTab === 'alerts'} 
            onClick={() => { setActiveTab('alerts'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            icon={<Bell size={24} />}
            label="Alerts"
          />
          {currentUser?.email === 'd9717018219@gmail.com' && (
            <NavButton 
              active={showAdminSettings} 
              onClick={() => handleAdminAccess()}
              icon={<Settings size={22} />}
              label="Admin"
            />
          )}
        </div>
      </footer>

      {/* Admin Verification Modal (Settings) */}
      <AnimatePresence>
        {showAdminSettings && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminSettings(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <Settings size={20} className="text-slate-900" />
                  </div>
                  <button onClick={() => setShowAdminSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
                
                <div>
                  <h3 className="text-xl font-black text-slate-900">Admin Settings</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Restricted Access</p>
                </div>

                <div className="space-y-4 pt-2">
                  {currentUser ? (
                    <div className="space-y-4">
                      {!isAdminUser && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-rose-50 border border-rose-100 rounded-2xl"
                        >
                          <div className="flex items-center gap-2 text-rose-600 mb-1">
                            <X size={14} className="stroke-[3px]" />
                            <p className="text-[10px] font-black uppercase tracking-tight">Access Denied</p>
                          </div>
                          <p className="text-[9px] font-bold text-rose-500 leading-tight">
                            Your account ({currentUser.email || 'this UID'}) is not registered as an administrator. Please contact the system owner to request access.
                          </p>
                        </motion.div>
                      )}
                      
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">User Identifier (UID)</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-[10px] font-mono text-slate-600 truncate">{currentUser.uid}</code>
                            <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(currentUser.uid);
                                 alert('UID copied!');
                               }}
                               className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-colors"
                            >
                              <FileText size={12} />
                            </button>
                          </div>
                        </div>
                        {currentUser.email && (
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Account</p>
                            <p className="text-[10px] font-bold text-slate-600">{currentUser.email}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl border flex items-center justify-between gap-3 bg-slate-50 border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", isAdminUser ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Admin Privileges</span>
                        </div>
                        {isAdminUser && (
                          <button 
                            onClick={() => {
                              setActiveTab('admin' as any);
                              setShowAdminSettings(false);
                            }}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                          >
                            Open Dashboard
                          </button>
                        )}
                      </div>

                      {!isAdminUser && (
                        <p className="text-[9px] font-bold text-slate-400 leading-relaxed text-center px-4">
                          To gain admin access, your UID must be added to the authorization list in Firebase console.
                        </p>
                      )}

                      <button 
                        onClick={() => { firebaseAuth.signOut(); setShowAdminSettings(false); }}
                        className="w-full p-4 border border-rose-100 bg-rose-50/50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors"
                      >
                        Sign Out Account
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { handleSignIn(); setShowAdminSettings(false); }}
                      className="w-full bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sign in for Admin Check</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 py-1 px-3 sm:px-5 rounded-2xl transition-all active:scale-95",
        active ? "text-primary dark:text-blue-400 scale-110" : "text-slate-300 dark:text-slate-700"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-primary/5 dark:bg-blue-400/5 shadow-inner" : ""
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[9px] font-black uppercase tracking-[0.2em] leading-none",
        active ? "opacity-100" : "opacity-0"
      )}>{label}</span>
    </button>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 w-fit rounded-2xl">{icon}</div>
      <h4 className="font-extrabold text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

