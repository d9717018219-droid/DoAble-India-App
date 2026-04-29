import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Alert, UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, CheckCircle, Zap, ExternalLink, Clock, Play, Volume2 } from 'lucide-react';
import { getCityTheme } from '../utils';

interface AlertsViewProps {
  city: string;
  userGender?: string | null;
  userClasses?: string[];
  userType?: UserType | null;
}

const AlertsView: React.FC<AlertsViewProps> = ({ city, userGender, userClasses, userType }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const domAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const celestialTone = { name: 'Celestial Goal', url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' };

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
  const theme = getCityTheme(city);

  // Filter alerts based on user preferences locally
  const filteredAlerts = alerts.filter(alert => {
    // 1. Gender check
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    
    // 2. Class check
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    
    // 3. User Type check
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;

    return matchesGender && matchesClass && matchesUserType;
  });

  // Sound and Notification function
  const notifyUser = (alert: Alert) => {
    // Check if this specific alert matches user preferences before notifying
    const matchesGender = !alert.gender || alert.gender === 'Any' || alert.gender === userGender;
    const matchesClass = !alert.targetClass || alert.targetClass === 'All' || (userClasses && userClasses.includes(alert.targetClass));
    const matchesUserType = !alert.targetUserType || alert.targetUserType === 'all' || alert.targetUserType === userType;
    
    if (!matchesGender || !matchesClass || !matchesUserType) return;

    // 1. Play Sound
    playSound(selectedTone, 0.8);

    // 2. Browser Notification (works in background)
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

    // 3. App Badge API
    if ('setAppBadge' in navigator) {
      // @ts-ignore
      navigator.setAppBadge(alerts.length + 1).catch(console.error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    
    // Play test sound to "unlock" audio context for future background alerts
    if (result === 'granted') {
      playSound(selectedTone, 0.3);
    }
  };

  const playTestSound = () => {
    playSound(selectedTone, 0.5);
    setTimeout(() => {
      alert("Sound Unlocked! You will now hear the alert tone for new broadcasts.");
    }, 500);
  };

  useEffect(() => {
    setLoading(true);
    isFirstLoad.current = true;
    // Listen for alerts for the specific city or global ('All')
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

      // Detect if there's a new alert added (not during initial load)
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

      // Update badge count based on alerts matching current filters
      if ('setAppBadge' in navigator) {
        // Recalculate filter here for badge count immediate update
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
      case 'urgent': return 'bg-rose-50 border-rose-100';
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
    <div className="space-y-6 pb-24">
      <header className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            City Broadcasts <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-black">{city}</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">Stay updated with real-time teaching news</p>
        </div>
        <div className="flex items-center gap-3">
          {permission === 'granted' && (
            <button 
              onClick={playTestSound}
              className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              title="Test & Unlock Sound"
            >
              <Zap size={16} className="text-emerald-500 fill-emerald-500" />
            </button>
          )}
          {permission !== 'granted' && (
            <button 
              onClick={requestPermission}
              className="px-3 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-2"
            >
              <Zap size={12} fill="currentColor" />
              Enable Alerts
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center animate-pulse">
              <Bell className="w-5 h-5 text-primary" />
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Hidden Audio element for reliable playback */}
        <audio 
          ref={domAudioRef} 
          onEnded={() => setIsPlaying(null)} 
          className="hidden" 
          preload="auto"
          crossOrigin="anonymous"
        />
        
        {/* Sound Selection Menu */}
        <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-slate-100/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                <Volume2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block">Active Alert Tone</span>
                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{celestialTone.name}</span>
              </div>
            </div>
            
            <button
              onClick={() => playPreview(celestialTone.url)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group cursor-pointer active:scale-95 ${
                isPlaying === celestialTone.url 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary'
              }`}
            >
              {isPlaying === celestialTone.url && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="absolute inset-0 bg-primary/20 rounded-full z-0 pointer-events-none"
                />
              )}
              <div className="z-10">
                {isPlaying === celestialTone.url ? (
                  <div className="flex gap-0.5 items-end h-3">
                    <div className="w-1 bg-white animate-[bounce_0.6s_ease-in-out_infinite]" />
                    <div className="w-1 bg-white animate-[bounce_0.6s_ease-in-out_0.2s_infinite]" />
                    <div className="w-1 bg-white animate-[bounce_0.6s_ease-in-out_0.4s_infinite]" />
                  </div>
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </div>
            </button>
          </div>
        </div>

        {permission === 'granted' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3"
          >
            <div className="p-2 bg-emerald-100 rounded-xl">
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Real-Time Monitoring Active</p>
              <p className="text-[9px] text-emerald-700/70 font-medium leading-tight mt-1">
                For the chosen alert tone to play when you are not using the app, keep this tab open in your browser or <b>Add to Home Screen</b>.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-black text-sm uppercase tracking-wider">Signals Clear</h3>
              <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">No targeted alerts for your profile in {city}</p>
            </motion.div>
          ) : (
              filteredAlerts.map((alert, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={alert.id}
                className={`p-4 rounded-[20px] border shadow-sm relative overflow-hidden group ${getBg(alert.type)}`}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center">
                    {getIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                        {alert.sender}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {alert.timestamp?.toDate ? new Date(alert.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium text-[13px] leading-snug">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                       {alert.link ? (
                         <a 
                           href={alert.link} 
                           target="_blank" 
                           rel="noreferrer"
                           className="inline-flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                         >
                           View Details <ExternalLink className="w-2.5 h-2.5" />
                         </a>
                       ) : <div />}
                       <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                         {alert.timestamp?.toDate ? new Date(alert.timestamp.toDate()).toLocaleDateString() : ''}
                       </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Removed Connection Section */}
    </div>
  );
};

export default AlertsView;
