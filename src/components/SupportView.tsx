import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, Clock, Zap, ArrowRight, Loader2, Sparkles, GraduationCap, Briefcase, Globe, Heart } from 'lucide-react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import { cn } from '../utils';

interface SupportViewProps {
  jobsCount?: number;
  tutorsCount?: number;
}

const SupportView: React.FC<SupportViewProps> = ({ jobsCount = 0, tutorsCount = 0 }) => {
  const chatInstanceRef = useRef<any>(null);
  const [pulse, setPulse] = useState(0);

  // Weather-app like slow breathing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const chatCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.innerHTML = '';
      try {
        const chatInstance = createChat({
          target: node,
          mode: 'fullscreen',
          showWelcomeScreen: false,
          webhookUrl: 'https://n8n.srv1497567.hstgr.cloud/webhook/a468d691-f1fd-4cb8-b259-3aba116f45b7/chat',
          initialMessages: [
            'Hi there! 👋 How can DoAble India help you today?',
            'Tell me your query below, and I will try to solve it for you.',
          ],
          i18n: {
            en: { 
              title: '', 
              subtitle: '', 
              footer: '', 
              getStarted: 'Start Chatting', 
              inputPlaceholder: 'Type your query here...', 
              closeButtonTooltip: 'Close' 
            },
          },
        });
        chatInstanceRef.current = chatInstance;
        setTimeout(() => {
          if (chatInstanceRef.current) {
            if (typeof chatInstanceRef.current.open === 'function') chatInstanceRef.current.open();
            else if (typeof chatInstanceRef.current.toggle === 'function') chatInstanceRef.current.toggle(true);
          }
        }, 500);
      } catch (error) {
        console.error('Failed to init n8n chat:', error);
      }
    } else {
      if (chatInstanceRef.current) {
        try {
          if (typeof chatInstanceRef.current.destroy === 'function') chatInstanceRef.current.destroy();
        } catch (e) {}
        chatInstanceRef.current = null;
      }
    }
  }, []);

  return (
    <div className="flex flex-col p-4 pb-24 sm:p-6 space-y-6">
      {/* ─── ENHANCED HERO SECTION ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] p-8 sm:p-12 text-white shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        {/* Weather-like atmospheric animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, -120, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute -bottom-60 -right-40 w-[600px] h-[600px] bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-[120px]" 
          />
          
          {/* Animated Mesh Overlay */}
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }} />          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100],
                opacity: [0, 0.4, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-10px'
              }}
            />
          ))}
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Infrastructure</span>
              </motion.div>
              <h2 className="text-4xl sm:text-6xl font-[900] tracking-tighter leading-none">
                How can we<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-pulse">help you?</span>
              </h2>
            </div>

            {/* Interactive Stats */}
            <div className="flex gap-3 w-full sm:w-auto">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex-1 sm:flex-none bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 min-w-[120px]"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-[20px] font-black tracking-tighter">{jobsCount}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Jobs</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex-1 sm:flex-none bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 min-w-[120px]"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">
                    <GraduationCap size={18} />
                  </div>
                  <span className="text-[20px] font-black tracking-tighter">{tutorsCount}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Elite Tutors</p>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="flex items-center gap-3 text-white/60">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Secured Support</span>
             </div>
             <div className="flex items-center gap-3 text-white/60">
                <Clock size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider">24/7 Response</span>
             </div>
             <div className="flex items-center gap-3 text-white/60">
                <Globe size={16} className="text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Global Reach</span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ─── CHAT INTERFACE ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden h-[calc(100vh-450px)] min-h-[400px] flex flex-col relative"
      >
        <div className="sticky top-0 z-10 px-8 py-5 bg-slate-50/80 backdrop-blur-md flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <MessageSquare size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-slate-900 uppercase">Interactive Concierge</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">AI Powered Assistant</p>
            </div>
          </div>
          <div className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Connection Active</p>
          </div>
        </div>

        <div 
          id="support-chat-mount" 
          ref={chatCallbackRef}
          className="flex-1 w-full bg-white relative" 
        />
      </motion.div>

      {/* Footer Branding Override */}
      <div className="text-center py-4 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-900 flex items-center justify-center gap-2">
           <Heart size={10} className="text-primary fill-primary" /> DoAble India Secure Core
        </p>
      </div>
    </div>
  );
};

export default SupportView;
