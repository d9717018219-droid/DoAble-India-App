import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Alert, UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, Zap, ExternalLink, Clock, X, MessageSquare, Phone, Mail, ChevronRight, Settings, User as UserIcon, CreditCard, Play, Volume2, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { cn } from '../utils';

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
    const q = query(collection(db, 'alerts'), where('city', 'in', [city || 'All', 'All']), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Alert[];
      setAlerts(alertsData);
      setLoading(false);
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [city]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'broadcast': return <Zap className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-rose-50 border-rose-200';
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'broadcast': return 'bg-amber-50 border-amber-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Signals...</div>;

  return (
    <div className="space-y-4 pb-24">
      <audio ref={domAudioRef} onEnded={() => setIsPlaying(null)} className="hidden" preload="auto" crossOrigin="anonymous" />
      <header className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-[22px] font-black text-slate-900 tracking-tighter uppercase">{activeTab === 'support' ? 'Support' : activeTab === 'setup' ? 'Settings' : 'Broadcasts'}</h2>
          <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"><span className="text-[9px] font-black text-emerald-600 uppercase">Live</span></div>
      </header>

      {/* Internal Tabs are only shown if we are in Alerts or Settings mode, not when specifically in Support mode from main nav */}
      {initialTab !== 'support' && (
        <div className="px-6">
          <div className="bg-slate-100 p-1.5 rounded-[22px] flex gap-1 border border-slate-200">
            {[
              { id: 'feed', label: 'Feed', icon: Bell },
              { id: 'setup', label: 'Settings', icon: Settings }
              ].map((tab) => (
              <button key={tab.id} onClick={() => { unlockAudio(); playTapSound(); setActiveTab(tab.id as any); }}
                className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-[10px] font-black uppercase transition-all", activeTab === tab.id ? "bg-primary text-white" : "text-slate-400")}>
                <tab.icon size={14} strokeWidth={3} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'setup' ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-sm space-y-8">
                 <div className="pb-4 border-b border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">App Settings</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Preferences & Notifications</p>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Receive Notifications</label>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                         <span className="text-xs font-black uppercase text-slate-700">{permission === 'granted' ? 'Enabled' : 'Disabled'}</span>
                         {permission !== 'granted' && <button onClick={requestPermission} className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Enable</button>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
                      <input type="text" value={userName || ''} onChange={e => updatePreference('userName', e.target.value)} placeholder="Enter your name..." className="w-full bg-slate-50 p-4 rounded-xl text-xs font-bold outline-none border border-slate-100 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nature</label><select value={userType || ''} onChange={e => updatePreference('userType', e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl text-xs font-bold outline-none border border-slate-100"><option value="parent">👨 Parent</option><option value="teacher">🎓 Tutor</option></select></div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">City</label>
                        <select 
                          value={city || 'All'} 
                          onChange={e => updatePreference('userCity', e.target.value)} 
                          className="w-full bg-slate-50 p-4 rounded-xl text-xs font-bold outline-none border border-slate-100"
                        >
                          <option value="All">All Cities</option>
                          {[...CITIES_LIST].sort().map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <a href="https://zohosecurepay.in/checkout/i9db4wt2-verz1l6gn6ogo/Make-a-secure-payment-now" target="_blank" rel="noreferrer" className="w-full bg-[#059669] text-white p-5 rounded-2xl flex items-center justify-between group active:scale-95 transition-all shadow-lg"><span className="text-[11px] font-black uppercase tracking-widest">Registration Fee / Payment</span><CreditCard size={18} strokeWidth={3} /></a>
                    </div>
                    <div className="text-center">
                      <button onClick={() => { if (isAdminUser && onAdminClick) onAdminClick(); else if (handleSignIn) handleSignIn(); }} className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-400 transition-colors">System Management</button>
                    </div>
                 </div>
              </div>
              <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm"><Volume2 size={24} /></div>
                    <div><h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Notification Sound</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premium Crystal Chime</p></div>
                 </div>
                 <button onClick={() => playPreview(ALERT_JINGLE)} className="mt-4 w-full bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isPlaying === ALERT_JINGLE ? 'Stop' : 'Test Sound'}</span>{isPlaying === ALERT_JINGLE ? <div className="flex gap-0.5 items-end h-3"><div className="w-1 bg-primary animate-bounce" /><div className="w-1 bg-primary animate-bounce delay-75" /><div className="w-1 bg-primary animate-bounce delay-150" /></div> : <Play size={14} className="text-primary" fill="currentColor" />}</button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {alerts.length === 0 ? <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No alerts found.</div> : 
                alerts.filter(a => !hiddenAlertIds.includes(a.id)).map((alert) => (
                  <div key={alert.id} className={cn("p-6 rounded-[32px] border-2 shadow-sm relative", getBg(alert.type))}>
                    <div className="flex gap-4">
                      <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center">{getIcon(alert.type)}</div>
                      <div className="flex-1"><div className="font-black text-xs uppercase mb-1">{alert.sender || 'System'}</div><div className="text-sm font-bold opacity-90">{alert.message}</div></div>
                      <button onClick={() => hideAlert(alert.id)} className="text-slate-400"><X size={16} /></button>
                    </div>
                  </div>
                ))
              }
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsView;
