import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Alert, UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, CheckCircle, Zap, ExternalLink, Clock, Play, Volume2, Settings, X, MessageSquare, Phone, Mail, CreditCard, ChevronRight, Share2 } from 'lucide-react';
import { cn, getCityTheme } from '../utils';

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

const AlertsView: React.FC<AlertsViewProps> = ({ city, userGender, userClasses, userType, isAdminUser, onAdminClick, currentUser, handleSignIn, showFormModal, setShowFormModal }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'support' | 'setup'>('feed');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const domAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const celestialTone = { name: 'Celestial Goal', url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' };

  const tutorFormIframe = `<iframe aria-label='Tutor Onboarding Form' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/UpdateForm/formperma/5q6-EFWKiWGtqhyYNfjqMGyCYXXst3OOPqOmQCD7yT8?zf_enablecamera=true' allow="camera;"></iframe>`;
  const parentFormIframe = `<iframe aria-label='Share Your Requirement' frameborder="0" style="height:600px;width:100%;border:none;" src='https://forms.doableindia.com/info2701/form/ShareRequirement/formperma/Y-6ujBL2ntI_ufnw8JPcHpyFOAGHButgY6SigoCfs6o' allow="geolocation;" allowfullscreen="true"></iframe>`;

  // Initialize Chat when Support tab is active
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
      
      // Small delay to ensure DOM is ready
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

    const playPromise = domAudioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(url);
        })
        .catch(err => {
          console.error('Audio playback failed:', err);
          setIsPlaying(null);
        });
    }
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
    setSelectedTone(url);
    playSound(url, 0.7);
  };

  // Cleanup on unmount
  useEffect(() => {
    const audio = domAudioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const isFirstLoad = React.useRef(true);

  // Filter alerts based on user preferences locally
  const allFilteredAlerts = alerts.filter(alert => {
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
    return matchesGender && matchesClass && matchesUserType;
  });

  // Sound and Notification function
  const notifyUser = (alert: Alert) => {
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
    
    if (!matchesGender || !matchesClass || !matchesUserType) return;

    playSound(selectedTone, 0.8);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(`New Alert: ${alert.sender || 'City Update'}`, {
            body: alert.message,
            icon: '/vite.svg',
            // @ts-ignore
            vibrate: [200, 100, 200],
            tag: alert.id,
            renotify: true
          });
        });
      } catch (e) {
        new Notification(`New Alert: ${alert.sender || 'City Update'}`, {
          body: alert.message
        });
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
    if (result === 'granted') {
      playSound(selectedTone, 0.3);
    }
  };

  useEffect(() => {
    setLoading(true);
    isFirstLoad.current = true;
    const q = query(
      collection(db, 'alerts'),
      where('city', 'in', [city, 'All']),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Alert[];

      if (!isFirstLoad.current && snapshot.docChanges().some(change => change.type === 'added')) {
        const addedChange = snapshot.docChanges().find(c => c.type === 'added');
        if (addedChange) {
          const alert = { id: addedChange.doc.id, ...addedChange.doc.data() } as Alert;
          notifyUser(alert);
        }
      }
      
      setAlerts(alertsData);
      setLoading(false);
      isFirstLoad.current = false;

      if ('setAppBadge' in navigator) {
        const fCount = alertsData.filter(alert => {
          const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
          const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
          const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
          return matchesGender && matchesClass && matchesUserType;
        }).length;

        if (fCount > 0) {
          // @ts-ignore
          navigator.setAppBadge(fCount).catch(console.error);
        } else {
          // @ts-ignore
          navigator.clearAppBadge().catch(console.error);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'alerts');
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
    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/g;
    const phoneRegex = /(?:\+91[\-\s]?)?[6789]\d{9}/g;
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/g;
    
    const combinedRegex = new RegExp(`(${urlRegex.source}|${phoneRegex.source}|${emailRegex.source})`, 'g');
    const parts = text.split(combinedRegex);
    
    return parts.map((part, i) => {
      if (!part) return null;
      if (part.match(urlRegex)) {
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a key={i} href={href} target="_blank" rel="noreferrer" className="text-primary underline decoration-2 underline-offset-4 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-black break-all">
            {part}
          </a>
        );
      }
      if (part.match(phoneRegex)) {
        const cleanPhone = part.replace(/[^\d+]/g, '');
        const tel = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
        return (
          <a key={i} href={`tel:${tel}`} className="text-primary underline decoration-2 underline-offset-4 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-black">
            {part}
          </a>
        );
      }
      if (part.match(emailRegex)) {
        return (
          <a key={i} href={`mailto:${part}`} className="text-primary underline decoration-2 underline-offset-4 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-black">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const JobAlertCard = ({ alert, isNew }: { alert: Alert, isNew: boolean, key?: string }) => {
    const orderIdMatch = alert.message.match(/Order ID:\s*(\d+)/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : 'N/A';
    
    // Simple line-based parsing
    const lines = alert.message.split('\n');
    const classLine = lines.find(l => l.includes('📚'))?.replace('📚', '').trim();
    const genderLine = lines.find(l => l.includes('👩'))?.replace('👩', '').trim();
    const locationLine = lines.find(l => l.includes('📍'))?.replace('📍', '').trim();
    const timeLine = lines.find(l => l.includes('⏰'))?.replace('⏰', '').trim();
    const salaryLine = lines.find(l => l.includes('💰'))?.replace('💰', '').trim();
    const lastDateLine = lines.find(l => l.toLowerCase().includes('last date'))?.trim();

    const waUrl = `https://wa.me/919971969197?text=${orderId}`;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[12px] overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-[#eee] mb-4 flex flex-col"
      >
        <div className="bg-[#f8f9fa] px-4 py-3 flex items-center justify-between border-b border-[#eee]">
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <span className="text-[#e11d48] font-black text-[11px] uppercase tracking-tight">Tuition Job Alert | Order ID: {orderId}</span>
          </div>
          {isNew && <span className="bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-md animate-pulse">NEW</span>}
        </div>

        <div className="p-4 space-y-3">
          {classLine && <div className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="shrink-0 w-5">📚</span> {classLine}</div>}
          {genderLine && <div className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="shrink-0 w-5">👩</span> {genderLine}</div>}
          {locationLine && <div className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="shrink-0 w-5">📍</span> {locationLine}</div>}
          {timeLine && <div className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="shrink-0 w-5">⏰</span> {timeLine}</div>}
          {salaryLine && <div className="flex items-start gap-3 text-sm font-bold text-slate-700"><span className="shrink-0 w-5">💰</span> {salaryLine}</div>}
          
          <div className="pt-2">
            <a 
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 0 1.72.937 3.412 1.448a11.762 11.762 0 005.625-.018c6.549 0 11.884-5.338 11.887-11.892a11.8 11.8 0 00-3.41-8.414" />
              </svg>
              WhatsApp Reply
            </a>
          </div>

          <div className="flex items-center justify-between pt-2">
            {lastDateLine && <span className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest">{lastDateLine}</span>}
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
              {alert.timestamp?.toDate ? new Date(alert.timestamp.toDate()).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'Just now'}
            </span>
          </div>
        </div>
      </motion.div>
    );
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
      {/* Hidden Audio element */}
      <audio 
        ref={domAudioRef} 
        onEnded={() => setIsPlaying(null)} 
        className="hidden" 
        preload="auto"
        crossOrigin="anonymous"
      />

      <header className="px-6 py-6 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            Broadcasts 
            <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-primary/20">
              {city}
            </span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Stay Updated with Live Signals</p>
        </div>
        <div className="flex flex-col items-end gap-1">
           <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">System Live</span>
           </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-6">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[22px] flex gap-1 border border-slate-200 dark:border-slate-800">
          {[
            { id: 'feed', label: 'Live Feed', icon: Bell, activeColor: 'bg-white dark:bg-slate-700' },
            { id: 'support', label: 'Support Hub', icon: MessageSquare, activeColor: 'bg-rose-500 !text-white' },
            { id: 'setup', label: 'Settings', icon: Settings, activeColor: 'bg-white dark:bg-slate-700' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? `${tab.activeColor} shadow-sm scale-[1.02] text-slate-900 dark:text-white` 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <tab.icon size={14} strokeWidth={3} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {activeTab === 'support' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
               <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Support Hub</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Unified Helpdesk</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <MessageSquare size={20} />
                  </div>
               </div>

               <div className="space-y-3">
                  {/* WhatsApp Support */}
                  <a 
                    href={`https://wa.me/919873965489?text=${encodeURIComponent(
                      userType === 'teacher' 
                        ? `Hello DoAble Team, I am a Tutor from ${city}. I have a query regarding available jobs/my profile. Please assist.`
                        : `Hello DoAble Team, I am a Parent from ${city}. I need help regarding a tutor for my child. Please assist.`
                    )}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-green-500/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-500">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 0 1.72.937 3.412 1.448a11.762 11.762 0 005.625-.018c6.549 0 11.884-5.338 11.887-11.892a11.8 11.8 0 00-3.41-8.414" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight block">WhatsApp Support</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">9 AM to 6 PM | Everyday</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </a>

                  {/* Call Support */}
                  <a 
                    href="tel:+919971969197"
                    className="w-full flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-500/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Phone size={20} className="text-rose-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight block">Call Support</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">9 AM to 6 PM | Everyday</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </a>

                  {/* Email Support */}
                  <a 
                    href={`mailto:info@doableindia.com?subject=${encodeURIComponent("Support Inquiry - DoAble India")}&body=${encodeURIComponent("Hello DoAble Team,\n\n")}`}
                    className="w-full flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Mail size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight block">Email Support</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">info@doableindia.com</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </a>
               </div>
            </div>

            {/* AI Assistant Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border-2 border-rose-100 dark:border-rose-900/30 overflow-hidden shadow-2xl shadow-rose-500/10 flex flex-col">
               <div className="p-1 bg-white">
                  <div 
                    id="n8n-chat-container"
                    className="w-full h-[600px] rounded-[32px] overflow-hidden bg-slate-50"
                  />
               </div>

               <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-center border-t border-rose-100 dark:border-rose-900/30">
                  <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em]">AI Support Session Integrated</p>
               </div>
            </div>
          </div>
        ) : activeTab === 'setup' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
               <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Account Actions</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quick Management</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {/* Pay Now Button - Green */}
                  <a 
                    href="https://zohosecurepay.in/checkout/i9db4wt2-verz1l6gn6ogo/Make-a-secure-payment-now" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-[#059669] text-white p-6 rounded-[24px] flex items-center justify-between group active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">Fee & Registration</span>
                      <span className="text-lg font-black uppercase tracking-tight">Pay Now</span>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard size={20} strokeWidth={3} />
                    </div>
                  </a>

                  <div className="pt-4 text-center">
                    <button 
                      onClick={() => {
                        if (isAdminUser && onAdminClick) {
                          onAdminClick();
                        } else if (handleSignIn) {
                          handleSignIn();
                        }
                      }}
                      className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest hover:text-slate-400 transition-colors"
                    >
                      System Settings
                    </button>
                  </div>
               </div>
            </div>

            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-[32px] border border-primary/10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <Volume2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">System Notification</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Alert Tone: {celestialTone.name}</p>
                  </div>
               </div>
               <button
                  onClick={() => playPreview(celestialTone.url)}
                  className="mt-4 w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between active:scale-[0.98] transition-all"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Test Notification Sound</span>
                  {isPlaying === celestialTone.url ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-1 bg-primary animate-[bounce_0.6s_ease-in-out_infinite]" />
                      <div className="w-1 bg-primary animate-[bounce_0.6s_ease-in-out_0.2s_infinite]" />
                      <div className="w-1 bg-primary animate-[bounce_0.6s_ease-in-out_0.4s_infinite]" />
                    </div>
                  ) : (
                    <Play size={14} className="text-primary" fill="currentColor" />
                  )}
                </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {allFilteredAlerts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-slate-200 dark:text-slate-600" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">Nothing to Report</h3>
                <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">All signals are stable in {city}</p>
              </motion.div>
            ) : (
                allFilteredAlerts.map((alert, index) => {
                  const isNew = alert.timestamp?.toDate && (Date.now() - alert.timestamp.toDate().getTime() < 24 * 60 * 60 * 1000);
                  const isJobAlert = alert.message.toLowerCase().includes('order id');

                  if (isJobAlert) {
                    return <JobAlertCard key={alert.id} alert={alert} isNew={isNew} />;
                  }
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={alert.id}
                      className={cn(
                        "p-6 rounded-[32px] border-2 shadow-xl relative overflow-hidden group transition-all duration-300",
                        "hover:shadow-2xl hover:-translate-y-1 hover:border-primary/30",
                        getBg(alert.type)
                      )}
                    >
                      <div className="flex gap-5">
                        <div className="shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-50 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                  {alert.sender || 'System Update'}
                                </span>
                                {isNew && (
                                  <span className="bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-md animate-pulse">NEW</span>
                                )}
                              </div>
                              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] -mt-0.5 opacity-60">Verified Source</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2.5 py-1.5 rounded-xl shadow-sm">
                              <Clock className="w-3 h-3" />
                              {alert.timestamp?.toDate ? new Date(alert.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <div className="text-slate-700 dark:text-slate-300 font-bold text-[15px] leading-relaxed whitespace-pre-wrap">
                            {renderMessage(alert.message)}
                          </div>
                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5 dark:border-white/5">
                             {alert.link ? (
                               <a 
                                 href={alert.link} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                               >
                                 View Details <ExternalLink className="w-3.5 h-3.5" />
                               </a>
                             ) : <div />}
                             <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                               {alert.timestamp?.toDate ? new Date(alert.timestamp.toDate()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                             </span>
                          </div>
                        </div>
                      </div>
                      {alert.type === 'urgent' && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl shadow-md">
                          Urgent Action
                        </div>
                      )}
                    </motion.div>
                  );
                })
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
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
                    {userType === 'teacher' ? 'Tutor Registration' : 'Requirement Details'}
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
                  dangerouslySetInnerHTML={{ 
                    __html: userType === 'teacher' ? tutorFormIframe : parentFormIframe 
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
};

export default AlertsView;
