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

const DetailItem: React.FC<{ emoji: string; text: string }> = ({ emoji, text }) => {
  if (!text) return null;
  return (
    <div className="flex gap-4 items-start group">
      <span className="text-xl shrink-0 leading-none group-hover:scale-110 transition-transform">{emoji}</span>
      <span className="text-[14px] font-bold text-slate-700 leading-snug">{text}</span>
    </div>
  );
};

const JobAlertCard: React.FC<{ alert: Alert; onHide: () => void }> = ({ alert, onHide }) => {
  const msg = alert.message;
  
  // Extracting data using regex
  const orderId = msg.match(/Order ID:\s*(\d+)/i)?.[1] || '';
  const classInfo = msg.match(/📚\s*([^\n]*)/)?.[1] || '';
  const genderInfo = msg.match(/👩\s*([^\n]*)/)?.[1] || '';
  const locationInfo = msg.match(/📍\s*([^\n]*)/)?.[1] || '';
  const timeInfo = msg.match(/⏰\s*([^\n]*)/)?.[1] || '';
  const feeInfo = msg.match(/💰\s*([^\n]*)/)?.[1] || '';
  const lastDate = msg.match(/⏳\s*Last Date:\s*([^\n]*)/i)?.[1] || '';
  
  const whatsappNumber = msg.match(/WhatsApp to\s*(\d+)/i)?.[1] || '9971969197';
  const whatsappLink = `https://wa.me/91${whatsappNumber}?text=I am interested in Tuition Job Alert | Order ID: ${orderId}. Please provide more details.`;

  const timestampDate = alert.timestamp?.toDate ? alert.timestamp.toDate() : new Date();
  const isNew = (Date.now() - timestampDate.getTime()) < 24 * 60 * 60 * 1000;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden relative"
    >
      <div className="p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-xl">📢</div>
            <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-widest leading-tight">
              Tuition Job Alert <span className="mx-1 opacity-30">|</span> Order ID: {orderId}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                New
              </span>
            )}
            <button onClick={onHide} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-4 pt-1">
          <DetailItem emoji="📚" text={classInfo} />
          <DetailItem emoji="👩" text={genderInfo} />
          <DetailItem emoji="📍" text={locationInfo} />
          <DetailItem emoji="⏰" text={timeInfo} />
          <DetailItem emoji="💰" text={feeInfo} />
        </div>

        {/* WhatsApp Button */}
        <a 
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#22c35e] text-white h-[58px] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-lg shadow-green-100 border-b-4 border-green-600/20"
        >
          <MessageSquare size={18} fill="currentColor" />
          <span className="text-[13px] font-black uppercase tracking-widest">WhatsApp Reply</span>
        </a>

        {/* Footer */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-500/80">
              <span className="text-sm">⏳</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Last Date: {lastDate}</span>
            </div>
            <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
              {timestampDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {timestampDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AlertsView: React.FC<AlertsViewProps> = ({ 
  city, userGender, userClasses, userType, 
  isAdminUser, onAdminClick, currentUser, handleSignIn, showFormModal, setShowFormModal,
  setUserCity, setUserGender, setUserClasses, setUserType,
  userName, setUserName, initialTab = 'feed'
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'support'>(initialTab === 'setup' ? 'feed' : (initialTab as any));
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const domAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const ALERT_JINGLE = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

  useEffect(() => {
    setActiveTab(initialTab === 'setup' ? 'feed' : (initialTab as any));
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
    if (activeTab === 'support') {
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
      
      <header className="px-6 py-8 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {activeTab === 'support' ? 'Support' : 'Alerts'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Real-time Network Updates
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdminUser && (
                <button 
                  onClick={() => { playTapSound(); onAdminClick?.(); }}
                  className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 active:scale-95 transition-all"
                  title="Admin Panel"
                >
                  <Settings size={20} />
                </button>
              )}
              <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 uppercase">Live</span>
              </div>
            </div>
          </div>
      </header>

      <div className="px-6 space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'support' ? (
             <div key="support" className="py-20 text-center">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Support Mode Active</p>
             </div>
          ) : (
            <motion.div 
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {alerts.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                  <div className="text-4xl">📡</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No signals detected in {city || 'your area'}.</p>
                </div>
              ) : 
                alerts.filter(a => !hiddenAlertIds.includes(a.id)).map((alert) => {
                  const isJobAlert = alert.message.includes('📢 Tuition Job Alert') || alert.message.includes('TUITION JOB ALERT');
                  
                  if (isJobAlert) {
                    return <JobAlertCard key={alert.id} alert={alert} onHide={() => hideAlert(alert.id)} />;
                  }

                  return (
                    <div key={alert.id} className={cn("p-6 rounded-[32px] border-2 shadow-sm relative transition-all hover:scale-[1.01]", getBg(alert.type))}>
                      <div className="flex gap-4">
                        <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">{getIcon(alert.type)}</div>
                        <div className="flex-1">
                          <div className="font-black text-[10px] uppercase mb-1 tracking-wider text-slate-500">{alert.sender || 'System Broadcast'}</div>
                          <div className="text-[15px] font-bold text-slate-800 leading-snug">{alert.message}</div>
                        </div>
                        <button onClick={() => hideAlert(alert.id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"><X size={18} /></button>
                      </div>
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
