import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, Clock, Zap, ArrowRight, Loader2, Sparkles, GraduationCap, Briefcase, Globe, Heart, X, MapPin } from 'lucide-react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import { cn } from '../utils';

interface SupportViewProps {
  jobsCount?: number;
  tutorsCount?: number;
}

const SupportView: React.FC<SupportViewProps> = ({ jobsCount = 0, tutorsCount = 0 }) => {
  const chatInstanceRef = useRef<any>(null);
  const userCity = localStorage.getItem('userCity') || 'Ghaziabad';

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
            'Hi there! 👋 Welcome to DoAble India Support.',
            'How can we help you today? Please type your query below.',
          ],
          i18n: {
            en: { 
              title: '', 
              subtitle: '', 
              footer: '', 
              getStarted: 'Start Chatting', 
              inputPlaceholder: 'Type your message here...', 
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
        }, 300);
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
      {/* ─── SOLID CHAT INTERFACE ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] border-2 border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden h-[calc(100vh-320px)] min-h-[500px] flex flex-col relative"
      >
        <div className="sticky top-0 z-10 px-8 py-5 bg-slate-900 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest text-white uppercase">Secure AI Assistant</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Connection Encrypted</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
             <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">v4.0.2</p>
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
