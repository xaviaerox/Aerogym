import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Zap, Brain, Target, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { sendChatMessage, type UserContextForAI } from '../lib/aiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const SUGGESTED_PROMPTS = [
  { icon: Dumbbell, text: 'Técnica del press de banca' },
  { icon: Target, text: 'Rutina para hoy' },
  { icon: Brain, text: 'Cómo mejorar mi recuperación' },
];

export default function CoachView() {
  const { profile } = useAuthStore();
  const { sessions } = useWorkoutStore();
  const { dailyHealth } = useHealthStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `¡Hola ${profile?.name || 'atleta'}! 💪 Soy Aero, tu coach personal. He revisado tu historial: ${sessions.length} entrenamientos registrados. ¿En qué puedo ayudarte hoy?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const buildUserContext = (): UserContextForAI => {
    const lastSession = sessions[0];
    return {
      name: profile?.name || 'atleta',
      goal: profile?.goal || 'hypertrophy',
      level: profile?.level || 'beginner',
      weight_kg: profile?.weight_kg || null,
      height_cm: profile?.height_cm || null,
      age: profile?.age || null,
      sessionsCount: sessions.length,
      lastSessionName: lastSession?.name,
      lastSessionDate: lastSession?.started_at,
      lastSessionVolume: lastSession?.total_volume_kg,
    };
  };

  const handleSend = async (messageText?: string) => {
    const msg = (messageText || input).trim();
    if (!msg || isTyping) return;

    setInput('');
    const newMsg: Message = { role: 'user', content: msg };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const context = buildUserContext();
      const history = messages.slice(1); // Excluye el mensaje inicial del sistema
      const response = await sendChatMessage(context, history, msg);
      setMessages((prev) => [...prev, { role: 'model', content: response }]);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      let friendlyMsg = 'Parece que hay un problema de conexión. Inténtalo de nuevo.';

      if (errorMsg.includes('no autenticado') || errorMsg.includes('401')) {
        friendlyMsg = 'Sesión expirada. Por favor, recarga la app.';
      } else if (errorMsg.includes('429') || errorMsg.includes('quota')) {
        friendlyMsg = 'El coach está muy ocupado. Inténtalo en unos minutos.';
      } else if (errorMsg.includes('not configured')) {
        friendlyMsg = 'El coach IA está siendo configurado. Disponible próximamente.';
      }

      setMessages((prev) => [...prev, { role: 'model', content: friendlyMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[78vh] flex flex-col -mx-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-blue/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-4 pb-3 pt-1 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 bg-brand-blue/20 rounded-2xl flex items-center justify-center">
          <Zap size={20} className="text-brand-blue" />
        </div>
        <div>
          <p className="font-black text-slate-50 text-sm">Aero Coach</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Powered by Gemini • Proxy Seguro
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] p-4 rounded-2xl shadow-lg',
                msg.role === 'user'
                  ? 'bg-brand-blue text-slate-950 rounded-tr-none font-medium'
                  : 'glass-dark border border-white/10 rounded-tl-none text-slate-100'
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-dark border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-brand-blue" />
              <span className="text-xs text-slate-400 font-medium">Aero está pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <AnimatePresence>
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar"
          >
            {SUGGESTED_PROMPTS.map(({ icon: Icon, text }) => (
              <button
                key={text}
                onClick={() => handleSend(text)}
                className="whitespace-nowrap px-3 py-2 glass-dark border border-white/5 rounded-full text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-all flex items-center gap-1.5"
              >
                <Icon size={12} />
                {text}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Pregúntame lo que quieras..."
            className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-4 pr-14 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 transition-all placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={cn(
              'absolute right-2 p-2.5 rounded-xl transition-all',
              input.trim() && !isTyping
                ? 'bg-brand-blue text-slate-950 shadow-lg shadow-brand-blue/20'
                : 'bg-slate-700 text-slate-500'
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
