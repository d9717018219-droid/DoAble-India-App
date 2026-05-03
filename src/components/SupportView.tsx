import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, Clock, Zap, ArrowRight, Loader2, Sparkles, GraduationCap, Briefcase, Globe, Heart, X } from 'lucide-react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import { cn } from '../utils';

interface SupportViewProps {
  jobsCount?: number;
  tutorsCount?: number;
}

const SupportView: React.FC<SupportViewProps> = ({ jobsCount = 0, tutorsCount = 0 }) => {
  const chatInstanceRef = useRef<any>(null);
  const [isChatActive, setIsChatActive] = useState(false);
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
      <AnimatePresence mode="wait">
        {!isChatActive ? (
          <motion.div
            key="trigger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => setIsChatActive(true)}
            className="group relative overflow-hidden rounded-[32px] p-8 text-white shadow-xl cursor-pointer"
            style={{ 
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            }}
          >
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[60px]" 
              />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/10">
                  <MessageSquare size={32} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight uppercase">Support Concierge</h3>
                  <p className="text-slate-400 text-sm font-medium">How can we help you today? Tap to start.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold uppercase tracking-widest text-primary group-hover:mr-2 transition-all duration-300">Start Chat</span>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-300 shadow-lg shadow-primary/25">
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden h-[calc(100vh-180px)] min-h-[500px] flex flex-col relative"
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
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Connection Active</p>
                </div>
                <button 
                  onClick={() => setIsChatActive(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div 
              id="support-chat-mount" 
              ref={chatCallbackRef}
              className="flex-1 w-full bg-white relative" 
            />
          </motion.div>
        )}
      </AnimatePresence>

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
