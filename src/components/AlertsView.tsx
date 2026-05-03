import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Alert, UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, CheckCircle, Zap, ExternalLink, Clock, Play, Volume2, Settings, X, MessageSquare, Phone, Mail, CreditCard, ChevronRight, Share2, User as UserIcon } from 'lucide-react';
import { cn } from '../utils';
import { CITIES_LIST, CLASSES_LIST } from '../constants';

import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

interface AlertsViewProps {
  city: string;
  userGender?: string | null;
  userClasses?: string[];
  userType?: UserType | null;
  setUserCity: (city: string) => void;
  setUserGender: (gender: string | null) => void;
  setUserClasses: (classes: string[]) => void;
  setUserType: (type: UserType | null) => void;
  isAdminUser?: boolean;
  onAdminClick?: () => void;
  currentUser?: any;
  handleSignIn?: () => void;
  showFormModal: boolean;
  setShowFormModal: (show: boolean) => void;
  userName?: string | null;
  setUserName: (name: string | null) => void;
}

// ─── Haptic-like tap sound & vibrate ───────────────────────────────
const TAP_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; // Apple-style Tock
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
  setUserCity, setUserGender, setUserClasses, setUserType,
  isAdminUser, onAdminClick, currentUser, handleSignIn, showFormModal, setShowFormModal,
  userName, setUserName
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'support' | 'setup'>('feed');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); 
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const domAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Hardened Permission State
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    try {
      return ('Notification' in window) ? Notification.permission : 'denied';
    } catch (e) {
      return 'denied';
    }
  });

  const ALERT_JINGLE = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

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
      
      if (key === 'userCity' && setUserCity) setUserCity(value);
      if (key === 'userGender' && setUserGender) setUserGender(value);
      if (key === 'userClasses' && setUserClasses) setUserClasses(value);
      if (key === 'userType' && setUserType) setUserType(value as UserType);
      if (key === 'userName' && setUserName) setUserName(value);
    } catch (e) {}
  };

  const tutorFormIframe = `<iframe aria-label='Tutor Onboarding Form' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8?zf_enablecamera=true' allow="camera;"></iframe>`;
  const parentFormIframe = `<iframe aria-label='Share Your Requirement' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o' allow="geolocation;" allowfullscreen="true"></iframe>`;

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

    if (activeTab === 'support') {
      const initChat = () => {
        const container = document.getElementById('n8n-chat-container');
        if (container && container.innerHTML === '') {
          createChat({
            target: '#n8n-chat-container',
            mode: 'fullscreen',
            webhookUrl: 'https://n8n.srv1497567.hstgr.cloud/webhook/a468d691-f1fd-4cb8-b259-3aba116f45b7/chat',
            initialMessages: ['Hi there! 👋 How can DoAble India help you today?'],
            i18n: {
              en: {
                title: 'DoAble Support',
                subtitle: 'AI Assistant',
                footer: 'Support Desk',
                getStarted: 'Start Chatting',
                inputPlaceholder: 'Type your query here...',
                closeButtonTooltip: 'Close',
              },
            },
          });
        }
      };
      const timeoutId = setTimeout(initChat, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab]);

  const playSound = (url: string, volume = 0.8) => {
    if (!domAudioRef.current) return;
    try {
      domAudioRef.current.pause();
      domAudioRef.current.src = url;
      domAudioRef.current.volume = volume;
      domAudioRef.current.load();
      const p = domAudioRef.current.play();
      if (p && p.then) {
        p.then(() => setIsPlaying(url)).catch(() => setIsPlaying(null));
      }
    } catch (e) {}
  };

  const playPreview = (url: string) => {
    if (isPlaying === url) {
      try {
        if (domAudioRef.current) {
          domAudioRef.current.pause();
          domAudioRef.current.currentTime = 0;
        }
      } catch (e) {}
      setIsPlaying(null);
      return;
    }
    playSound(url, 0.7);
  };

  useEffect(() => {
    const audio = domAudioRef.current;
    return () => {
      if (audio) {
        try { audio.pause(); audio.src = ""; } catch (e) {}
      }
    };
  }, []);

  const isFirstLoad = React.useRef(true);

  const allFilteredAlerts = (alerts || []).filter(alert => {
    if (hiddenAlertIds.includes(alert.id)) return false;
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
    return matchesGender && matchesClass && matchesUserType;
  });

  const notifyUser = (alert: Alert) => {
    if (hiddenAlertIds.includes(alert.id)) return;
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
    if (!matchesGender || !matchesClass || !matchesUserType) return;

    playSound(ALERT_JINGLE, 0.8);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(`New Alert: ${alert.sender || 'City Update'}`, {
            body: alert.message,
            icon: '/vite.svg',
            tag: alert.id,
            renotify: true
          });
        });
      } catch (e) {
        new Notification(`New Alert: ${alert.sender || 'City Update'}`, { body: alert.message });
      }
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') playSound(selectedTone, 0.3);
    } catch (e) {}
  };

  useEffect(() => {
    setLoading(true);
    isFirstLoad.current = true;
    const q = query(
      collection(db, 'alerts'),
      where('city', 'in', [city || 'All', 'All']),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Alert[];
      if (!isFirstLoad.current && snapshot.docChanges().some(change => change.type === 'added')) {
        const addedChange = snapshot.docChanges().find(c => c.type === 'added');
        if (addedChange) notifyUser({ id: addedChange.doc.id, ...addedChange.doc.data() } as Alert);
      }
      setAlerts(alertsData);
      setLoading(false);
      isFirstLoad.current = false;
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

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
      case 'urgent': return 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50 shadow-rose-500/10';
      case 'success': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50 shadow-emerald-500/10';
      case 'broadcast': return 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 shadow-amber-500/10';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50 shadow-blue-500/10';
    }
  };

  const renderMessage = (text: string) => {
    if (!text) return null;
    return text; // Simplified for stability
  };

  const JobAlertCard = ({ alert, isNew }: { alert: Alert, isNew: boolean }) => {
    const orderIdMatch = alert.message.match(/Order ID:\s*(\d+)/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : 'N/A';
    return (
      <div className="bg-white rounded-[12px] overflow-hidden shadow-sm border border-[#eee] mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#e11d48] font-black text-[11px] uppercase">Job Alert | {orderId}</span>
          <button onClick={() => hideAlert(alert.id)} className="text-slate-400"><X size={14} /></button>
        </div>
        <div className="text-sm font-bold text-slate-700 whitespace-pre-wrap">{alert.message}</div>
      </div>
    );
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Loading signals...</div>;

  return (
    <div className="space-y-4 pb-24">
      <audio ref={domAudioRef} onEnded={() => setIsPlaying(null)} className="hidden" preload="auto" crossOrigin="anonymous" />

      <header className="px-6 py-6 flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Broadcasts</h2>
          <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Live</span>
          </div>
      </header>

      <div className="px-6">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[22px] flex gap-1 border border-slate-200 dark:border-slate-800">
          {[
            { id: 'feed', label: 'Feed', icon: Bell },
            { id: 'support', label: 'Support', icon: MessageSquare },
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

      <div className="px-6 space-y-4">
        {activeTab === 'support' ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
             <div id="n8n-chat-container" className="w-full h-[600px] rounded-[32px] overflow-hidden bg-slate-50" />
          </div>
        ) : activeTab === 'setup' ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
               <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">App Settings</h4>
               </div>
               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
                    <input type="text" value={userName || ''} onChange={e => updatePreference('userName', e.target.value)} placeholder="Enter your name..."
                      className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs font-bold outline-none border border-slate-100 dark:border-slate-700 focus:border-primary transition-all text-slate-900 dark:text-[#0FE8F2]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nature</label>
                      <select value={userType || ''} onChange={e => updatePreference('userType', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs font-bold outline-none border border-slate-100 dark:border-slate-700 focus:border-primary transition-all dark:text-[#0FE8F2]">
                        <option value="" disabled>Select Role...</option>
                        <option value="parent">👨 Parent</option>
                        <option value="teacher">🎓 Tutor</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">City</label>
                      <select value={city || 'All'} onChange={e => updatePreference('userCity', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs font-bold outline-none border border-slate-100 dark:border-slate-700 focus:border-primary transition-all dark:text-[#0FE8F2]">
                        {(CITIES_LIST || []).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
               </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allFilteredAlerts.length === 0 ? <div className="py-20 text-center text-slate-400">No alerts found.</div> : 
              allFilteredAlerts.map((alert) => {
                if (alert.message.toLowerCase().includes('order id')) return <JobAlertCard key={alert.id} alert={alert} isNew={false} />;
                return (
                  <div key={alert.id} className={cn("p-6 rounded-[32px] border-2 shadow-sm relative", getBg(alert.type))}>
                    <div className="flex gap-4">
                      <div className="shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center">{getIcon(alert.type)}</div>
                      <div className="flex-1">
                        <div className="font-black text-xs uppercase mb-1">{alert.sender || 'System'}</div>
                        <div className="text-sm font-bold opacity-90">{alert.message}</div>
                      </div>
                      <button onClick={() => hideAlert(alert.id)} className="text-slate-400"><X size={16} /></button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;
