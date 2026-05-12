import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Alert, UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, Zap, ExternalLink, Clock, X, MessageSquare, Phone, Mail, ChevronRight, Settings, User as UserIcon, CreditCard, Play, Volume2, Instagram, Facebook, Linkedin, Twitter, Calendar, Filter, ChevronDown } from 'lucide-react';
import { cn, getCityPhone, formatCurrency } from '../utils';

import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

import { CITIES_LIST, CLASSES_LIST } from '../constants';

interface AlertsViewProps {
  city: string;
  userGender?: string | null;
  userClasses?: string[];
  userType?: UserType | null;
  isAdminUser?: boolean;
  onAdminClick?: () => void;
  currentUser?: any;
  handleSignIn?: () => void;
  showFormModal: boolean;
  setShowFormModal: (show: boolean) => void;
  setUserCity: (city: string) => void;
  setUserGender: (gender: string | null) => void;
  setUserClasses: (classes: string[]) => void;
  setUserType: (type: UserType | null) => void;
  userName?: string | null;
  setUserName: (name: string | null) => void;
  initialTab?: 'feed' | 'support' | 'setup';
}

const TAP_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
let tapAudio: HTMLAudioElement | null = null;
try {
  tapAudio = new Audio(TAP_SOUND_URL);
  tapAudio.load();
} catch (e) {}

function playTapSound() {
  try {
    if (tapAudio) {
      tapAudio.currentTime = 0;
      tapAudio.volume = 0.4;
      tapAudio.play().catch(() => {});
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  } catch {}
}

const AlertsView: React.FC<AlertsViewProps> = ({ 
  city, userGender, userClasses, userType, 
  isAdminUser, onAdminClick, currentUser, handleSignIn, showFormModal, setShowFormModal,
  setUserCity, setUserGender, setUserClasses, setUserType,
  userName, setUserName, initialTab = 'feed'
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'support' | 'setup'>(initialTab);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const domAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const chatInstanceRef = React.useRef<any>(null);

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const ALERT_JINGLE = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

  // Update activeTab if initialTab changes (e.g. when switching between Support and Alerts in parent)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const unlockAudio = () => {
    try {
      if (domAudioRef.current) {
        const p = domAudioRef.current.play();
        if (p && p.then) {
          p.then(() => {
            domAudioRef.current?.pause();
            if (domAudioRef.current) domAudioRef.current.currentTime = 0;
          }).catch(() => {});
        }
      }
    } catch (e) {}
  };

  const [hiddenAlertIds, setHiddenAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hiddenAlertIds');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const hideAlert = (id: string) => {
    try {
      playTapSound();
      const newHidden = [...hiddenAlertIds, id];
      setHiddenAlertIds(newHidden);
      localStorage.setItem('hiddenAlertIds', JSON.stringify(newHidden));
    } catch (e) {}
  };

  const updatePreference = (key: string, value: any) => {
    try {
      const storageValue = (value === null || value === undefined) ? '' : (typeof value === 'string' ? value : JSON.stringify(value));
      localStorage.setItem(key, storageValue);
      if (key === 'userCity') setUserCity(value);
      if (key === 'userGender') setUserGender(value);
      if (key === 'userClasses') setUserClasses(value);
      if (key === 'userType') setUserType(value as UserType);
      if (key === 'userName') setUserName(value);
    } catch (e) {}
  };

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    try {
      return ('Notification' in window) ? Notification.permission : 'denied';
    } catch (e) {
      return 'denied';
    }
  });

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (e) {}
  };

  const playPreview = (url: string) => {
    if (isPlaying === url) {
      if (domAudioRef.current) {
        domAudioRef.current.pause();
        domAudioRef.current.currentTime = 0;
      }
      setIsPlaying(null);
      return;
    }
    if (!domAudioRef.current) return;
    domAudioRef.current.src = url;
    domAudioRef.current.play().then(() => setIsPlaying(url)).catch(() => setIsPlaying(null));
  };

  useEffect(() => {
    if (activeTab === 'support' || activeTab === 'setup') {
      try {
        if (domAudioRef.current) {
          domAudioRef.current.pause();
          domAudioRef.current.currentTime = 0;
        }
      } catch (e) {}
      setIsPlaying(null);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    // Fetch all recent alerts (increased limit for safety) and filter in memory
    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'), limit(200));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Alert[];
      setAlerts(alertsData);
      setLoading(false);
    }, (error) => { 
      console.error('Alerts Subscription Error:', error); 
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  const filterAlertsByDate = (items: Alert[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const lastWeek = today - (7 * 86400000);
    const lastMonth = today - (30 * 86400000);

    return items.filter(a => {
      const alertTime = (a.timestamp?.seconds || 0) * 1000;
      
      // 1. Date Filter
      let dateMatch = true;
      switch (dateFilter) {
        case 'today': dateMatch = alertTime >= today; break;
        case 'yesterday': dateMatch = alertTime >= yesterday && alertTime < today; break;
        case 'week': dateMatch = alertTime >= lastWeek; break;
        case 'month': dateMatch = alertTime >= lastMonth; break;
        case 'custom': {
          if (customRange.start && customRange.end) {
            const start = new Date(customRange.start).getTime();
            const end = new Date(customRange.end).getTime() + 86400000;
            dateMatch = alertTime >= start && alertTime < end;
          }
          break;
        }
      }
      if (!dateMatch) return false;

      // 2. City Filter (Case-Insensitive)
      const targetCity = (a.city || 'All').toLowerCase();
      const currentCity = (city || 'All').toLowerCase();
      if (currentCity !== 'all' && targetCity !== 'all' && targetCity !== currentCity) return false;

      return true;
    });
  };

  const getFilteredCounts = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const lastWeek = today - (7 * 86400000);
    const lastMonth = today - (30 * 86400000);

    const counts = { all: 0, today: 0, yesterday: 0, week: 0, month: 0 };
    
    alerts.forEach(a => {
      const alertTime = (a.timestamp?.seconds || 0) * 1000;
      counts.all++;
      if (alertTime >= today) counts.today++;
      if (alertTime >= yesterday && alertTime < today) counts.yesterday++;
      if (alertTime >= lastWeek) counts.week++;
      if (alertTime >= lastMonth) counts.month++;
    });

    return counts;
  };

  const filteredAlerts = filterAlertsByDate(alerts);
  const counts = getFilteredCounts();
  const hiddenCount = alerts.length - filteredAlerts.length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200"><AlertTriangle className="w-6 h-6" /></div>;
      case 'success': return <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200"><CheckCircle className="w-6 h-6" /></div>;
      case 'broadcast': return <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200"><Zap className="w-6 h-6" /></div>;
      default: return <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200"><Info className="w-6 h-6" /></div>;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-white border-rose-100 shadow-rose-100/50';
      case 'success': return 'bg-white border-emerald-100 shadow-emerald-100/50';
      case 'broadcast': return 'bg-white border-amber-100 shadow-amber-100/50';
      default: return 'bg-white border-blue-100 shadow-blue-100/50';
    }
  };

  const getAccentColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-rose-600 bg-rose-50';
      case 'success': return 'text-emerald-600 bg-emerald-50';
      case 'broadcast': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Signals...</div>;

  return (
    <div className="space-y-4 pb-24">
      <audio ref={domAudioRef} onEnded={() => setIsPlaying(null)} className="hidden" preload="auto" crossOrigin="anonymous" />
      <header className="px-8 py-6 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h2 className="text-[28px] font-black text-slate-900 tracking-tighter uppercase leading-none">Notifications</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Tuition Updates</p>
          </div>
          <div className="bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
          </div>
      </header>

      {/* Date Filter Bar */}
      {hiddenCount > 0 && (
        <div className="px-6 mb-4">
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-[10px] font-bold text-amber-700 flex items-center justify-between">
            <span>⚠️ {hiddenCount} alerts hidden by City filter ({city})</span>
            <button onClick={() => setUserCity('All')} className="underline">Show All</button>
          </div>
        </div>
      )}
      <div className="px-6 overflow-x-auto no-scrollbar flex items-center gap-2 mb-2">
        <button 
          onClick={() => { playTapSound(); setDateFilter('all'); setShowCustomPicker(false); }}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-2",
            dateFilter === 'all' ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
          )}
        >
          All <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", dateFilter === 'all' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{counts.all}</span>
        </button>
        <button 
          onClick={() => { playTapSound(); setDateFilter('today'); setShowCustomPicker(false); }}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-2",
            dateFilter === 'today' ? "bg-primary border-primary text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
          )}
        >
          Today <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", dateFilter === 'today' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{counts.today}</span>
        </button>
        <button 
          onClick={() => { playTapSound(); setDateFilter('yesterday'); setShowCustomPicker(false); }}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-2",
            dateFilter === 'yesterday' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
          )}
        >
          Yesterday <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", dateFilter === 'yesterday' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{counts.yesterday}</span>
        </button>
        <button 
          onClick={() => { playTapSound(); setDateFilter('week'); setShowCustomPicker(false); }}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-2",
            dateFilter === 'week' ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
          )}
        >
          This Week <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", dateFilter === 'week' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{counts.week}</span>
        </button>
        <button 
          onClick={() => { playTapSound(); setDateFilter('month'); setShowCustomPicker(false); }}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-2",
            dateFilter === 'month' ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
          )}
        >
          Last 30 Days <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", dateFilter === 'month' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{counts.month}</span>
        </button>
        <button 
          onClick={() => { playTapSound(); setShowCustomPicker(!showCustomPicker); setDateFilter('custom'); }}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-2",
            dateFilter === 'custom' ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
          )}
        >
          <Calendar size={12} /> Custom
        </button>
      </div>

      <AnimatePresence>
        {showCustomPicker && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 overflow-hidden"
          >
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Date Range</span>
                <button onClick={() => setShowCustomPicker(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
                  <input 
                    type="date" 
                    value={customRange.start}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-primary shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
                  <input 
                    type="date" 
                    value={customRange.end}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-primary shadow-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'support' ? (
             <div key="support">
               {/* Support view content is handled elsewhere or by AlertsView if initialTab is support */}
             </div>
          ) : (
            <motion.div 
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {filteredAlerts.length === 0 ? <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No alerts found for this range.</div> : 
                filteredAlerts.filter(a => !hiddenAlertIds.includes(a.id)).map((alert) => {
                  const orderIdMatch = alert.message.match(/(?:Order ID:\s*)?([2-9]\d{4})/i);
                  const orderId = orderIdMatch ? orderIdMatch[1] : null;

                  // Define the 11 standard labels for job alerts
                  const jobLabels = [
                    'Order ID',
                    'Class / Board',
                    'Subjects',
                    'Gender Required',
                    'Fee / Month',
                    'Duration',
                    'Days in Week',
                    'Preferred Time',
                    'Location / Area',
                    'City',
                    'Posted Date'
                  ];

                  const lines = alert.message.split('\n').filter(l => l.trim().length > 0);
                  const isJobAlert = lines.length >= 5 || orderId;

                  return (
                    <div key={alert.id} className={cn("p-8 rounded-[40px] border shadow-xl relative overflow-hidden transition-all active:scale-[0.98]", getBg(alert.type))}>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          {getIcon(alert.type)}
                          <div>
                            <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-0.5", getAccentColor(alert.type))}>
                              {alert.type} Alert
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                              <Calendar size={10} /> {new Date(alert.timestamp?.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              <span className="opacity-30">•</span>
                              <Clock size={10} /> {new Date(alert.timestamp?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => hideAlert(alert.id)} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"><X size={18} /></button>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-6 bg-primary/20 rounded-full" />
                           <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{alert.sender || 'System Broadcast'}</span>
                        </div>
                        
                        <div className="space-y-4 pl-3.5">
                          {alert.message.split('\n').filter(line => {
                            const l = line.toLowerCase();
                            if (l.includes('if interested') || l.includes('send') && l.includes('on whatsapp')) return false;
                            if (l.includes('last date') || l.includes('explore more')) return false;
                            if (l.includes('doableindia.com/jobs')) return false;
                            return true;
                          }).map((line, idx) => {
                            const cleanLine = line.replace(/\*/g, '').trim();
                            if (!cleanLine) return <div key={idx} className="h-1" />;
                            
                            if (cleanLine.includes('📢')) {
                              return (
                                <div key={idx} className="text-primary font-black uppercase text-[12px] tracking-tight mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                  <Zap size={14} className="text-amber-500 fill-amber-500" /> {cleanLine}
                                </div>
                              );
                            }
                            
                            // If it's a job alert, apply manual labels sequentially if colon is missing
                            if (isJobAlert && !cleanLine.includes(':') && idx < jobLabels.length) {
                                return (
                                  <div key={idx} className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em] opacity-80">{jobLabels[idx]}</span>
                                    <span className="text-[13px] font-bold text-slate-900">{cleanLine}</span>
                                  </div>
                                );
                            }

                            // Regular Colon Detection (Field: Value)
                            if (cleanLine.includes(':')) {
                              const parts = cleanLine.split(':');
                              const label = parts[0].trim();
                              const value = parts.slice(1).join(':').trim();
                              
                              if (label.length < 35 && value.length > 0) {
                                return (
                                  <div key={idx} className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em] opacity-80">{label}</span>
                                    <span className="text-[13px] font-bold text-slate-900">{value}</span>
                                  </div>
                                );
                              }
                            }

                            if (cleanLine.includes('👉') || cleanLine.toLowerCase().includes('send')) {
                              return (
                                <div key={idx} className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900 font-bold text-[12px] shadow-inner">
                                  {cleanLine}
                                </div>
                              );
                            }

                            if (cleanLine.includes('http')) {
                              return (
                                <div key={idx} className="mt-2 text-blue-600 font-bold underline text-[11px] break-all flex items-center gap-2">
                                  <ExternalLink size={10} /> {cleanLine}
                                </div>
                              );
                            }

                            return <div key={idx} className="text-[14px] font-medium text-slate-600 mb-1">{cleanLine}</div>;
                          })}
                        </div>
                      </div>

                      {/* Primary Action */}
                      {orderId && (
                        <div className="mt-8">
                          <a 
                            href={`https://wa.me/91${getCityPhone(alert.city)}?text=${encodeURIComponent(
                              `Hello! I am very interested in this tuition job from the alert. ✨\n\n` +
                              `Order ID: ${orderId}\n\n` +
                              `I saw this in my Alerts feed and would like to apply. Please let me know the next steps. Thank you! 🙏`
                            )}`}
                            target="_blank"
                            className="group flex items-center justify-between w-full p-1 bg-white border border-slate-100 rounded-[32px] shadow-lg shadow-pink-100 active:scale-95 transition-all overflow-hidden"
                          >
                            <div className="flex items-center gap-2 sm:gap-4 pl-4 sm:pl-6 min-w-0">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shrink-0"><MessageSquare size={16} /></div>
                              <div className="text-left truncate">
                                <div className="text-[11px] sm:text-[12px] font-black text-slate-900 truncate">ID: {orderId}</div>
                                <div className="hidden xs:block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">WhatsApp</div>
                              </div>
                            </div>
                            <div 
                              className="h-[50px] sm:h-[60px] px-6 sm:px-10 rounded-[28px] flex items-center justify-center text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest gap-2 shadow-lg shadow-pink-500/30 group-hover:px-12 transition-all shrink-0"
                              style={{ background: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)' }}
                            >
                              Apply <ChevronRight size={14} className="hidden xs:block" />
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsView;
