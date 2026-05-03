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
    <div className="flex flex-col p-4 pb-20 sm:p-6 sm:pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden h-[calc(100vh-180px)] min-h-[500px] flex flex-col"
      >
        {/* Sleek Integrated Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-slate-900 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg">
              <MessageSquare size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase">Support Desk</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Available 24*7</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
             <p className="text-[9px] font-black text-white/90 uppercase tracking-tighter">Live Support</p>
          </div>
        </div>

        {/* Chat Mount Point */}
        <div 
          id="support-chat-mount" 
          ref={chatCallbackRef}
          className="flex-1 w-full bg-slate-50/50 relative" 
        />
      </motion.div>
    </div>
  );
};

export default SupportView;
