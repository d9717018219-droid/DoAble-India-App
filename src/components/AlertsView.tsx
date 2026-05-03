import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Alert, UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, Zap, ExternalLink, Clock, X, MessageSquare, Phone, Mail, ChevronRight } from 'lucide-react';
import { cn } from '../utils';

import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

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
  isAdminUser, onAdminClick, currentUser, handleSignIn, showFormModal, setShowFormModal
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'support'>('feed');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const domAudioRef = React.useRef<HTMLAudioElement | null>(null);

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

  const tutorFormIframe = `<iframe aria-label='Tutor Onboarding Form' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8?zf_enablecamera=true' allow="camera;"></iframe>`;
  const parentFormIframe = `<iframe aria-label='Share Your Requirement' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o' allow="geolocation;" allowfullscreen="true"></iframe>`;

  useEffect(() => {
    if (activeTab === 'support') {
      try {
        if (domAudioRef.current) {
          domAudioRef.current.pause();
          domAudioRef.current.currentTime = 0;
        }
      } catch (e) {}
      setIsPlaying(null);

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

  const JobAlertCard = ({ alert, isNew }: { alert: Alert, isNew: boolean }) => {
    const orderIdMatch = alert.message.match(/Order ID:\s*(\d+)/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : 'N/A';
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[12px] overflow-hidden shadow-sm border border-[#eee] dark:border-slate-800 mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#e11d48] font-black text-[11px] uppercase">Job Alert | {orderId}</span>
          <button onClick={() => hideAlert(alert.id)} className="text-slate-400"><X size={14} /></button>
        </div>
        <div className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{alert.message}</div>
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
            { id: 'support', label: 'Support', icon: MessageSquare }
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

      {/* Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{userType === 'teacher' ? 'Tutor Registration' : 'Requirement Details'}</h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">DoAble India Official Form</p>
                </div>
                <button onClick={() => setShowFormModal(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:white transition-colors shadow-sm"><X size={20} strokeWidth={3} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-white">
                <div dangerouslySetInnerHTML={{ __html: userType === 'teacher' ? tutorFormIframe : parentFormIframe }} />
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
};

export default AlertsView;
