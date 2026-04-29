/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Loader2, Home as HomeIcon, FileText, User, Sparkles, BookOpen, GraduationCap, CheckCircle, LogOut, Settings, Edit3, Save, Bell, ChevronRight, Share2, Filter, X, MessageSquare, ExternalLink, Zap } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth, auth as firebaseAuth } from './firebase';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { JobLead, ApiResponse, TutorProfile, Alert } from './types';
import { JobCard } from './components/JobCard';
import { TutorCard } from './components/TutorCard';
import AlertsView from './components/AlertsView';
import AdminPanel from './components/AdminPanel';
import { TutorFilterModal } from './components/TutorFilterModal';
import { TutorFilterButton } from './components/TutorFilterButton';
import { cn, getCityTheme } from './utils';
import { TutorFilters, DEFAULT_FILTERS } from './types/filters';
import { applyTutorFilters, countActiveFilters } from './utils/tutorFilters';

export default function App() {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [firestoreLeads, setFirestoreLeads] = useState<JobLead[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [userCity, setUserCity] = useState<string | null>(localStorage.getItem('userCity'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userGender, setUserGender] = useState<string | null>(localStorage.getItem('userGender'));
  const [userClasses, setUserClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'tutors' | 'alerts'>('home');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('Checking...');
  const [jobLimit, setJobLimit] = useState(15);
  const [tutorLimit, setTutorLimit] = useState(15);
  const [tutorFilters, setTutorFilters] = useState<TutorFilters>(DEFAULT_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);

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
  const [editClasses, setEditClasses] = useState<string[]>(JSON.parse(localStorage.getItem('userClasses') || '[]'));

  const CITIES_LIST = [
    'Ahmedabad', 'Allahabad', 'Amrawati', 'Amritsar', 'Bangalore', 'Bhopal', 'Bhubaneswar', 
    'Chandigarh', 'Chennai', 'Cochin', 'Coimbatore', 'Dehradun', 'Delhi', 'Dispur', 
    'Faridabad', 'Gandhinagar', 'Ghaziabad', 'Greater Noida', 'Gurgaon', 'Guwahati', 
    'Hyderabad', 'Indore', 'Itanagar', 'Jaipur', 'Kanpur', 'Kolkata', 'Kota', 'Leh', 
    'Lucknow', 'Mangalore', 'Meerut', 'Mohali', 'Mumbai', 'Nagpur', 'Noida', 'Panchkula', 
    'Patna', 'Pondicherry', 'Pune', 'Raipur', 'Ranchi', 'Shimla', 'Srinagar', 'Surat', 
    'Thane', 'Trivandrum', 'Vadodara', 'Vellore', 'Zirakpur'
  ].sort();

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
        return {
          'Order ID': data.orderId,
          City: data.city,
          subjects: data.subject,
          'Updated Time': data.postedAt?.toDate()?.toISOString() || new Date().toISOString(),
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
        const filtered = json.data
          .filter(x => x['Internal Remark']?.trim().toLowerCase() === 'searching')
          .sort((a, b) => new Date(b['Updated Time']).getTime() - new Date(a['Updated Time']).getTime());
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
    }
  };

  const handleSaveProfile = (name: string, gender: string, classes: string[]) => {
    localStorage.setItem('userName', name);
    localStorage.setItem('userGender', gender);
    localStorage.setItem('userClasses', JSON.stringify(classes));
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
    return [...firestoreLeads, ...leads].sort((a, b) => 
      new Date(b['Updated Time']).getTime() - new Date(a['Updated Time']).getTime()
    );
  }, [leads, firestoreLeads]);

  const filteredLeads = useMemo(() => {
    return allLeads.filter(l => {
      const matchesCity = cityFilter === 'all' || l.City === cityFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        (l.Name?.toLowerCase().includes(searchLower)) ||
        (l.subjects?.toLowerCase().includes(searchLower)) ||
        (l['Order ID']?.toLowerCase().includes(searchLower)) ||
        (l.City?.toLowerCase().includes(searchLower));
      
      // Gender preference (if job specifies a gender, it must match user's gender)
      let matchesGender = true;
      if (userGender && l.Gender && l.Gender !== 'Any') {
        const jobGenderPref = l.Gender.toLowerCase();
        const userGenderLow = userGender.toLowerCase();
        if (jobGenderPref.includes('female')) {
          matchesGender = userGenderLow === 'female';
        } else if (jobGenderPref.includes('male')) {
          matchesGender = userGenderLow === 'male';
        }
      }

      // Filter by specified classes if user has a profile set
      let matchesPreference = true;
      if (userClasses && userClasses.length > 0) {
        const leadClass = ((l['Class / Board'] || '') + ' ' + (l.Class || '')).toString().toLowerCase();
        
        matchesPreference = userClasses.some(pref => {
          const numMatch = pref.match(/\d+/);
          const num = numMatch ? numMatch[0] : '';
          
          // Map of class names to possible variants in the data
          const variants: Record<string, string[]> = {
            '1st Std': ['1st', 'std 1', 'class 1', 'class i', 'i std', ' 1 ', ' i '],
            '2nd Std': ['2nd', 'std 2', 'class 2', 'class ii', 'ii std', ' 2 ', ' ii '],
            '3rd Std': ['3rd', 'std 3', 'class 3', 'class iii', 'iii std', ' 3 ', ' iii '],
            '4th Std': ['4th', 'std 4', 'class 4', 'class iv', 'iv std', ' 4 ', ' iv '],
            '5th Std': ['5th', 'std 5', 'class 5', 'class v', 'v std', ' 5 ', ' v '],
            '6th Std': ['6th', 'std 6', 'class 6', 'class vi', 'vi std', ' 6 ', ' vi '],
            '7th Std': ['7th', 'std 7', 'class 7', 'class vii', 'vii std', ' 7 ', ' vii '],
            '8th Std': ['8th', 'std 8', 'class 8', 'class viii', 'viii std', ' 8 ', ' viii '],
            '9th Std': ['9th', 'std 9', 'class 9', 'class ix', 'ix std', ' 9 ', ' ix '],
            '10th Std': ['10th', 'std 10', 'class 10', 'class x', 'x std', ' 10 ', ' x '],
            '11th Std': ['11th', 'std 11', 'class 11', 'class xi', 'xi std', ' 11 ', ' xi '],
            '12th Std': ['12th', 'std 12', 'class 12', 'class xii', 'xii std', ' 12 ', ' xii '],
          };

          const keywords = variants[pref] || [pref.toLowerCase().replace(' std', '')];
          
          return keywords.some(k => {
            const cleanK = k.toLowerCase().trim();
            if (!cleanK) return false;
            
            // Build a regex that matches the keyword as a whole word or with suffixes like 8th
            const pattern = cleanK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
            const regex = new RegExp(`(^|\\b|\\s)${pattern}($|\\b|\\s|th|st|nd|rd|std)`, 'i');
            return regex.test(leadClass);
          });
        });
      }
      
      return matchesCity && matchesSearch && matchesPreference && matchesGender;
    });
  }, [allLeads, cityFilter, searchQuery, userClasses, userGender]);

  const filteredTutors = useMemo(() => {
    // Create a filter object that includes city filter and search query if they're set
    const combinedFilters = { ...tutorFilters };
    if (cityFilter !== 'all' && cityFilter) {
      combinedFilters.cities = [cityFilter];
    }
    if (searchQuery) {
      combinedFilters.searchQuery = searchQuery;
    }
    return applyTutorFilters(tutors, combinedFilters);
  }, [tutors, tutorFilters, cityFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 relative overflow-x-hidden font-sans pb-24">
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

      {/* Header */}
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
          {activeTab === 'home' && (userName ? `Welcome, ${userName}` : 'DoAble India')}
          {activeTab === 'jobs' && 'Tuition Jobs'}
          {activeTab === 'tutors' && 'Expert Tutors'}
        </h1>
        <p className={cn("text-[13px] font-bold uppercase tracking-widest mt-1", userCity ? "text-white/70" : "text-slate-400")}>
          {activeTab === 'home' && (userName ? `PERFECT MATCHES FOR YOUR PROFILE` : 'Premium Teaching Portal')}
          {activeTab === 'jobs' && 'Live Teaching Feed'}
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
            {!userCity ? (
              <section className="text-center space-y-10 animate-in zoom-in duration-700 max-w-xl mx-auto py-12">
                <div className="w-24 h-24 bg-primary text-white rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
                  <MapPin size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-[1000] text-slate-900 leading-none">Where do you <br/> want to <span className="text-primary">Teach?</span></h2>
                  <p className="text-slate-500 font-bold text-sm tracking-wide">SELECT YOUR CITY TO GET STARTED</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 px-2">
                  {CITIES_LIST.map(city => {
                    const theme = getCityTheme(city);
                    return (
                      <button 
                        key={city}
                        onClick={() => selectCity(city)}
                        className="group relative bg-white hover:scale-[1.03] p-3 rounded-2xl font-black text-[9px] uppercase tracking-widest border transition-all shadow-sm active:scale-95 text-slate-700 hover:text-white flex items-center justify-center text-center leading-tight min-h-[54px] overflow-hidden"
                        style={{ borderLeft: `4px solid ${theme.solid}`, background: theme.solid + '08' }}
                      >
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: theme.grad }} />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full z-10 bg-slate-200 group-hover:bg-white/40" style={{ background: !city ? undefined : theme.solid }} />
                        <span className="relative z-10">{city}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="pt-10 flex flex-col items-center gap-4">
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Serving {CITIES_LIST.length} Cities Nationwide</p>
                  <button 
                    onClick={() => setShowAdminSettings(true)}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl group hover:bg-primary/5 transition-all"
                  >
                    <Settings size={12} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">Settings Only for Admin Use</span>
                  </button>
                </div>
              </section>
            ) : (
              <div className="space-y-10">
                  <section 
                    className="text-white p-10 rounded-[48px] overflow-hidden relative shadow-2xl shadow-primary/20"
                    style={{ background: getCityTheme(userCity).grad }}
                  >
                    <div className="relative z-10 space-y-6">
                       <div className="flex items-center gap-3">
                         <MapPin size={20} className="opacity-80" />
                         <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">{userCity} Edition</span>
                       </div>
                       <h2 className="text-4xl font-[1000] leading-none">Perfect Match for<br/> {userCity}</h2>
                       <p className="text-white/80 font-bold max-w-sm">We've found {allLeads.filter(l => l.City === userCity).length} active jobs and {tutors.filter(t => t['Preferred City'] === userCity).length} tutors in your area today.</p>
                       <div className="flex gap-3">
                         <button onClick={() => setActiveTab('jobs')} className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors">View Jobs</button>
                         <button onClick={() => selectCity(null)} className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-white/20 hover:bg-white/30 transition-colors">Change City</button>
                       </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                  </section>

                  {/* Profile Setup / About Me Section */}
                  <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                            <User size={24} />
                          </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 leading-tight">My Profile</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {userName ? 'Personalized results active' : 'Set preferences to see relevant leads'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="bg-primary/5 text-primary px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center gap-2"
                      >
                        {isEditingProfile ? 'Cancel' : (
                          <>
                            <Edit3 size={14} />
                            {userName ? 'Edit Profile' : 'Setup Profile'}
                          </>
                        )}
                      </button>
                    </div>

                    {isEditingProfile ? (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Deepak" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</label>
                            <select 
                              value={editGender} 
                              onChange={(e) => setEditGender(e.target.value)}
                              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Classes (Select Multiple)</label>
                          <div className="flex flex-wrap gap-2">
                            {['1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std', '6th Std', '7th Std', '8th Std', '9th Std', '10th Std', '11th Std', '12th Std'].map((cls) => (
                              <button
                                key={cls}
                                onClick={() => {
                                  setEditClasses(prev => 
                                    prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
                                  );
                                }}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border",
                                  editClasses.includes(cls) 
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                    : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                                )}
                              >
                                {cls}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button 
                            onClick={() => {
                              handleSaveProfile(editName, editGender, editClasses);
                            }}
                            className="w-full bg-slate-900 text-white p-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl"
                          >
                            <Save size={18} /> Submit Preferences
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 animate-in slide-in-from-top-4 duration-300">
                        {userName && (
                          <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100/50 flex items-center gap-3">
                            <User size={14} className="text-primary" />
                            <span className="text-xs font-bold text-slate-700">{userName}</span>
                          </div>
                        )}
                        {userGender && (
                          <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100/50 flex items-center gap-3">
                            <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Gender:</span>
                            <span className="text-xs font-bold text-slate-700">{userGender}</span>
                          </div>
                        )}
                        {userClasses.length > 0 && (
                          <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100/50 flex items-center gap-3">
                            <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Matching:</span>
                            <div className="flex gap-1">
                              {userClasses.slice(0, 3).map(c => (
                                <span key={c} className="text-[10px] font-bold text-slate-500">{c.split(' ')[0]}</span>
                              ))}
                              {userClasses.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{userClasses.length - 3}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => setActiveTab('jobs')} className="bg-slate-900 text-white p-8 rounded-[40px] cursor-pointer group hover:scale-[1.02] transition-transform">
                      <FileText size={32} className="text-primary mb-6" />
                      <h3 className="text-2xl font-black mb-2">Live Job Feed</h3>
                      <p className="opacity-60 text-sm">Real-time tuition requirements from parents in {userCity}.</p>
                    </div>
                    <div onClick={() => setActiveTab('tutors')} className="bg-slate-50 text-slate-900 p-8 rounded-[40px] border border-slate-100 cursor-pointer group hover:scale-[1.02] transition-transform">
                      <User size={32} className="text-primary mb-6" />
                      <h3 className="text-2xl font-black mb-2">Expert Tutors</h3>
                      <p className="text-slate-400 text-sm">Top rated educators available for home tuition projects.</p>
                    </div>
                 </section>

                 <section className="bg-gradient-to-br from-[#FFE66D] to-[#F59E0B] p-8 rounded-[40px] text-slate-900 shadow-xl shadow-amber-500/10 transition-transform active:scale-[0.99]">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                     <div className="bg-white/20 p-5 rounded-[32px] backdrop-blur-md shadow-sm">
                       <Settings size={32} className="text-slate-900" />
                     </div>
                     <div className="flex-1 text-center md:text-left space-y-1">
                       <h3 className="text-2xl font-[1000] tracking-tight">Tutor Corner</h3>
                       <p className="font-bold opacity-80 text-sm leading-snug">Want to update your subjects, localities or fees? Simply fill the form below.</p>
                     </div>
                     <button 
                       onClick={() => {
                         setShowTutorForm(true);
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                       }}
                       className="bg-slate-900 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl active:scale-95 whitespace-nowrap"
                     >
                       Update Preference
                     </button>
                   </div>
                 </section>

                 <section className="bg-slate-50 border border-slate-100 p-8 rounded-[40px] transition-transform active:scale-[0.99] cursor-pointer" onClick={() => setActiveTab('alerts')}>
                   <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[24px] bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                        <Bell className="text-primary" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-xl font-black text-slate-900 leading-none">Broadcast Alerts</h4>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-2">Latest teaching news for {userCity}</p>
                     </div>
                     <ChevronRight className="text-slate-300" />
                   </div>
                 </section>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && <AlertsView city={userCity || 'All'} userGender={userGender} userClasses={userClasses} />}
        
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
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search */}
            <div className="px-2 pt-4">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder={activeTab === 'jobs' ? "Search city, subject, order ID..." : "Search name, subject, tutor ID..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[28px] py-5 pl-14 pr-7 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all outline-none placeholder:text-slate-300 shadow-sm"
                />
              </div>
            </div>

            {/* Filter Button - Only for Tutors tab */}
            {activeTab === 'tutors' && (
              <div className="px-2">
                <TutorFilterButton
                  activeFilterCount={countActiveFilters(tutorFilters)}
                  onOpen={() => setShowFilterModal(true)}
                />
              </div>
            )}

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
                  <div className="flex justify-center p-10">
                    <button 
                      onClick={() => {
                        if (activeTab === 'jobs') setJobLimit(prev => prev + 15);
                        else setTutorLimit(prev => prev + 15);
                      }}
                      className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Load More Results
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

      {/* Tutor Filter Modal */}
      <TutorFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={tutorFilters}
        onFiltersChange={setTutorFilters}
        tutors={tutors}
      />

      {/* Bottom Navigation */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] border border-slate-100 px-4 py-3 flex justify-around items-center z-[3000] safe-area-bottom">
        <NavButton 
          active={activeTab === 'home' && !showTutorForm} 
          onClick={() => { setActiveTab('home'); setShowTutorForm(false); if(userCity) setCityFilter(userCity); window.scrollTo({top: 0, behavior: 'smooth'}); }}
          icon={<HomeIcon size={24} />}
          label="Home"
        />
        <NavButton 
          active={activeTab === 'jobs'} 
          onClick={() => { setActiveTab('jobs'); setShowTutorForm(false); if(userCity) setCityFilter(userCity); window.scrollTo({top: 0, behavior: 'smooth'}); }}
          icon={<FileText size={24} />}
          label="Jobs"
        />
        <NavButton 
          active={activeTab === 'tutors'} 
          onClick={() => { setActiveTab('tutors'); setShowTutorForm(false); if(userCity) setCityFilter(userCity); window.scrollTo({top: 0, behavior: 'smooth'}); }}
          icon={<User size={24} />}
          label="Tutors"
        />
        <NavButton 
          active={activeTab === 'alerts'} 
          onClick={() => { setActiveTab('alerts'); setShowTutorForm(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}
          icon={<Bell size={24} />}
          label="Alerts"
        />
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
                        <p className="text-[9px] font-bold text-slate-400 leading-relaxed text-center px-4 italic">
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
        active ? "text-primary scale-110" : "text-slate-300"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-primary/5 shadow-inner" : ""
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
    <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm space-y-3">
      <div className="p-3 bg-slate-50 w-fit rounded-2xl">{icon}</div>
      <h4 className="font-extrabold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

