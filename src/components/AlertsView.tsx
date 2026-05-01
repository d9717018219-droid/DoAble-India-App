import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Alert, UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, CheckCircle, Zap, ExternalLink, Clock, Play, Volume2, Settings, X, MessageSquare, CreditCard } from 'lucide-react';
import { cn, getCityTheme } from '../utils';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

interface AlertsViewProps {
  city: string;
  userGender?: string | null;
  userClasses?: string[];
  userType?: UserType | null;
}

const AlertsView: React.FC<AlertsViewProps> = ({ city, userGender, userClasses, userType }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'support' | 'setup'>('feed');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const domAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const celestialTone = { name: 'Celestial Goal', url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' };
  const tutorFormIframe = `<iframe aria-label='Tutor Onboarding Form' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8?zf_enablecamera=true' allow="camera;"></iframe>`;
  const parentFormIframe = `<iframe aria-label='Share Your Requirement' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o' allow="geolocation;" allowfullscreen="true"></iframe>`;

  // Feature 2: Zoho Secure Pay URL
  const PAYMENT_URL = 'https://zohosecurepay.in/checkout/i9db4wt2-verz1l6gn6ogo/Make-a-secure-payment-now';

  useEffect(() => {
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
    domAudioRef.current.pause();
    domAudioRef.current.src = url;
    domAudioRef.current.volume = volume;
    domAudioRef.current.load();
    const p = domAudioRef.current.play();
    if (p !== undefined) {
      p.then(() => setIsPlaying(url)).catch(err => { console.error('Audio failed:', err); setIsPlaying(null); });
    }
  };

  const playPreview = (url: string) => {
    if (isPlaying === url) {
      domAudioRef.current?.pause();
      if (domAudioRef.current) domAudioRef.current.currentTime = 0;
      setIsPlaying(null);
      return;
    }
    setSelectedTone(url);
    playSound(url, 0.7);
  };

  useEffect(() => {
    const audio = domAudioRef.current;
    return () => { if (audio) { audio.pause(); audio.src = ""; } };
  }, []);

  const isFirstLoad = React.useRef(true);

  const allFilteredAlerts = alerts.filter(alert => {
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
    return matchesGender && matchesClass && matchesUserType;
  });

  const notifyUser = (alert: Alert) => {
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
    if (!matchesGender || !matchesClass || !matchesUserType) return;
    playSound(selectedTone, 0.8);
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(`New Alert: ${alert.sender || 'City Update'}`, {
            body: alert.message, icon: '/vite.svg',
            // @ts-ignore
            vibrate: [200, 100, 200], tag: alert.id, renotify: true
          });
        });
      } catch (e) {
        new Notification(`New Alert: ${alert.sender || 'City Update'}`, { body: alert.message });
      }
    }
    if ('setAppBadge' in navigator) {
      // @ts-ignore
      navigator.setAppBadge(alerts.length + 1).catch(console.error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') playSound(selectedTone, 0.3);
  };

  useEffect(() => {
    setLoading(true);
    isFirstLoad.current = true;
    const q = query(collection(db, 'alerts'), where('city', 'in', [city, 'All']), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Alert[];
      if (!isFirstLoad.current && snapshot.docChanges().some(c => c.type === 'added')) {
        const added = snapshot.docChanges().find(c => c.type === 'added');
        if (added) notifyUser({ id: added.doc.id, ...added.doc.data() } as Alert);
      }
      setAlerts(alertsData);
      setLoading(false);
      isFirstLoad.current = false;
      if ('setAppBadge' in navigator) {
        const fCount = alertsData.filter(a => {
          const mg = !a.gender || a.gender === 'Any' || a.gender === userGender;
          const mc = !a.targetClass || a.targetClass === 'All' || (userClasses && userClasses.includes(a.targetClass));
          const mu = !a.targetUserType || a.targetUserType === 'all' || a.targetUserType === userType;
          return mg && mc && mu;
        }).length;
        // @ts-ignore
        if (fCount > 0) navigator.setAppBadge(fCount).catch(console.error);
        // @ts-ignore
        else navigator.clearAppBadge().catch(console.error);
      }
    }, (error) => { handleFirestoreError(error, OperationType.LIST, 'alerts'); setLoading(false); });
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
      case 'urgent': return 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30';
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'broadcast': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuning into {city} signals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <audio ref={domAudioRef} onEnded={() => setIsPlaying(null)} className="hidden" preload="auto" crossOrigin="anonymous" />

      <header className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Broadcasts
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-black">{city}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${allFilteredAlerts.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Live Monitoring</span>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-6">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[22px] flex gap-1 border border-slate-200 dark:border-slate-800">
          {[
            { id: 'feed', label: 'Live Feed', icon: Bell, activeColor: 'bg-white dark:bg-slate-700' },
            { id: 'setup', label: 'Settings', icon: Settings, activeColor: 'bg-white dark:bg-slate-700' },
            { id: 'support', label: 'Support Desk', icon: MessageSquare, activeColor: 'bg-rose-500 !text-white' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id ? `${tab.activeColor} shadow-sm scale-[1.02] text-slate-900 dark:text-white` : "text-slate-400 hover:text-slate-600"
            )}>
              <tab.icon size={14} strokeWidth={3} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {activeTab === 'support' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border-2 border-rose-100 overflow-hidden shadow-2xl flex flex-col">
              <div className="p-1 bg-white">
                <div id="n8n-chat-container" className="w-full h-[600px] rounded-[32px] overflow-hidden bg-slate-50" />
              </div>
              <div className="p-4 bg-rose-50 text-center border-t border-rose-100">
                <p className="text-[9px] font-bold text-rose-600 uppercase tracking-[0.2em]">End-to-End Encrypted Support Session</p>
              </div>
            </div>
          </div>
        ) : activeTab === 'setup' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-8">

              {/* Audio Notification */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Volume2 size={24} /></div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Audio Notification</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Custom Alert Tone</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block">Active Tone</span>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{celestialTone.name}</span>
                  </div>
                  <button onClick={() => playPreview(celestialTone.url)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying === celestialTone.url ? 'bg-primary text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>
                    {isPlaying === celestialTone.url ? (
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-1 bg-white animate-bounce" /><div className="w-1 bg-white animate-bounce [animation-delay:0.2s]" /><div className="w-1 bg-white animate-bounce [animation-delay:0.4s]" />
                      </div>
                    ) : <Play size={16} fill="currentColor" />}
                  </button>
                </div>
              </div>

              {/* Student Requirement / Tutor Profile section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    {userType === 'teacher' ? <Settings size={24} /> : <MessageSquare size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {userType === 'teacher' ? 'Professional Profile' : 'Student Requirement'}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Integration Center</p>
                  </div>
                </div>
                <button onClick={() => setShowFormModal(true)} className="w-full bg-primary text-white p-6 rounded-[24px] flex items-center justify-between group active:scale-95 transition-all shadow-xl shadow-primary/20">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70 block">Available Action</span>
                    <span className="text-lg font-black uppercase tracking-tight">
                      {userType === 'teacher' ? 'Create Tutor Profile' : 'Share Your Requirement'}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                    <ExternalLink size={20} strokeWidth={3} />
                  </div>
                </button>

                {/* Feature 2: Pay Now button — Parent/Student Requirement section only */}
                {userType !== 'teacher' && (
                  <button
                    onClick={() => window.open(PAYMENT_URL, '_blank', 'noopener,noreferrer')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white p-5 rounded-[24px] flex items-center justify-between transition-all shadow-lg shadow-emerald-600/25"
                  >
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block">Secure Payment</span>
                      <span className="text-lg font-black uppercase tracking-tight">Pay Now</span>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CreditCard size={20} strokeWidth={2.5} />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {allFilteredAlerts.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight">Nothing to Report</h3>
                <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">All signals are stable in {city}</p>
              </motion.div>
            ) : (
              allFilteredAlerts.map((alert, index) => (
                <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={alert.id} className={`p-6 rounded-[28px] border shadow-sm relative overflow-hidden ${getBg(alert.type)}`}>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-50 flex items-center justify-center">{getIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{alert.sender}</span>
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
                          <Clock className="w-2.5 h-2.5" />
                          {alert.timestamp?.toDate ? new Date(alert.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-slate-700 font-bold text-[14px] leading-relaxed">{alert.message}</p>
                      <div className="flex items-center justify-between mt-4">
                        {alert.link ? (
                          <a href={alert.link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-xl text-[10px] font-black text-primary uppercase tracking-widest shadow-sm hover:scale-105 transition-all flex items-center gap-2">
                            Details <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <div />}
                        <span className="text-[9px] font-black text-slate-300 uppercase">
                          {alert.timestamp?.toDate ? new Date(alert.timestamp.toDate()).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  {alert.type === 'urgent' && <div className="absolute top-0 right-0 p-1 bg-rose-500 text-white text-[8px] font-black uppercase rounded-bl-xl">Urgent</div>}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {userType === 'teacher' ? 'Tutor Registration' : 'Requirement Details'}
                  </h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">DoAble India Official Form</p>
                </div>
                <button onClick={() => setShowFormModal(false)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"><X size={20} strokeWidth={3} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-white">
                <div dangerouslySetInnerHTML={{ __html: userType === 'teacher' ? tutorFormIframe : parentFormIframe }} />
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure connection — doableindia.com</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertsView;
