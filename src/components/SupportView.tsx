import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, Clock, Zap, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

const SupportView: React.FC = () => {
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const chatInstanceRef = useRef<any>(null);

  const startSupport = useCallback(() => {
    setIsInitializing(true);
    
    // Delay to allow loading animation to show
    setTimeout(() => {
      const container = document.getElementById('support-chat-mount');
      if (container) {
        container.innerHTML = '';
        try {
          const chatInstance = createChat({
            target: '#support-chat-mount',
            mode: 'fullscreen',
            webhookUrl: 'https://n8n.srv1497567.hstgr.cloud/webhook/a468d691-f1fd-4cb8-b259-3aba116f45b7/chat',
            initialMessages: [
              'Hi there! 👋 How can DoAble India help you today?',
              'I am your dedicated Support Agent. Tell me your query!',
            ],
            i18n: {
              en: {
                title: 'DoAble Support',
                subtitle: 'Active & Ready',
                getStarted: 'Start Chatting',
                inputPlaceholder: 'Type your problem here...',
              },
            },
          });

          chatInstanceRef.current = chatInstance;
          
          // Force open after SDK mounts
          setTimeout(() => {
            if (chatInstanceRef.current) {
              if (typeof chatInstanceRef.current.open === 'function') chatInstanceRef.current.open();
              else if (typeof chatInstanceRef.current.toggle === 'function') chatInstanceRef.current.toggle(true);
              setIsChatStarted(true);
              setIsInitializing(false);
            }
          }, 800);
        } catch (error) {
          console.error('Support init failed:', error);
          setIsInitializing(false);
        }
      }
    }, 1000);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col p-6 pb-24">
      <AnimatePresence mode="wait">
        {!isChatStarted ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary">
                <MessageSquare size={48} strokeWidth={2.5} />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-950" 
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Support Desk</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-[280px] mx-auto leading-relaxed">
                Connect with our AI Support Agent for instant help with jobs, tutors, or technical issues.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-left space-y-2">
                <Clock className="text-primary" size={20} />
                <p className="text-[10px] font-black uppercase text-slate-400">Available</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">24/7 Support</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-left space-y-2">
                <ShieldCheck className="text-primary" size={20} />
                <p className="text-[10px] font-black uppercase text-slate-400">Verified</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Secure Help</p>
              </div>
            </div>

            <button
              onClick={startSupport}
              disabled={isInitializing}
              className="group relative w-full max-w-sm py-5 bg-slate-900 dark:bg-white rounded-[24px] overflow-hidden transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isInitializing ? (
                  <>
                    <Loader2 className="animate-spin text-white dark:text-slate-900" size={20} />
                    <span className="text-white dark:text-slate-900 font-black uppercase tracking-widest text-sm">Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white dark:text-slate-900 font-black uppercase tracking-widest text-sm">Contact Support Agent</span>
                    <ArrowRight className="text-white dark:text-slate-900 transition-transform group-hover:translate-x-1" size={18} />
                  </>
                )}
              </div>
            </button>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={10} className="fill-amber-500 text-amber-500" />
              Powered by DoAble AI
            </p>
            
            {/* Mount point for initialization - hidden until ready */}
            <div id="support-chat-mount" className="hidden" />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border-2 border-slate-50 dark:border-slate-800 shadow-2xl overflow-hidden h-[calc(100vh-200px)] flex flex-col">
               {/* Fixed Support Mount Container */}
               <div id="support-chat-mount" className="flex-1 w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportView;
