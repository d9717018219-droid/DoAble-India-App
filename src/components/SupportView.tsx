import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, Clock, Zap, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

const SupportView: React.FC = () => {
  const chatInstanceRef = useRef<any>(null);

  const chatCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Clear any existing content
      node.innerHTML = '';
      
      try {
        console.log('Initializing n8n support chat (single window)...');
        const chatInstance = createChat({
          target: node,
          mode: 'fullscreen',
          webhookUrl: 'https://n8n.srv1497567.hstgr.cloud/webhook/a468d691-f1fd-4cb8-b259-3aba116f45b7/chat',
          initialMessages: [
            'Hi there! 👋 How can DoAble India help you today?',
            'Tell me your query below, and I will try to solve it for you.',
          ],
          i18n: {
            en: { 
              title: 'Support Agent', 
              subtitle: 'Online', 
              footer: '', 
              getStarted: 'Start Chatting', 
              inputPlaceholder: 'Type your query here...', 
              closeButtonTooltip: 'Close' 
            },
          },        });

        chatInstanceRef.current = chatInstance;

        // Force open after a delay
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
      // Cleanup if needed
      if (chatInstanceRef.current) {
        try {
          if (typeof chatInstanceRef.current.destroy === 'function') chatInstanceRef.current.destroy();
        } catch (e) {}
        chatInstanceRef.current = null;
      }
    }
  }, []);

  return (
    <div className="flex flex-col p-6 pb-24 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[40px] border-2 border-slate-50 dark:border-slate-800 shadow-2xl overflow-hidden h-[calc(100vh-200px)] min-h-[500px] flex flex-col"
      >
        {/* Premium Support Header */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <MessageSquare size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Support Desk</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available 24*7</p>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-primary uppercase tracking-tighter">Ask your queries</p>
            <p className="text-[9px] font-medium text-slate-400 italic">Direct Help</p>
          </div>
        </div>

        {/* Chat Mount Point */}
        <div 
          id="support-chat-mount" 
          ref={chatCallbackRef}
          className="flex-1 w-full bg-white dark:bg-slate-900" 
        />
      </motion.div>
      
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
        <Zap size={10} className="fill-amber-500 text-amber-500" />
        Instant AI Support
      </p>
    </div>
  );
};

export default SupportView;
