import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Zap, Brain, Target, Dumbbell, Calendar, FileText } from 'lucide-react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { sendChatMessage, generateWeeklyReport, type UserContextForAI } from '../lib/aiService';
import MuscleWikiExplorer from './MuscleWikiExplorer';
import { subDays } from 'date-fns';
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
  const { dailyHealth, measurements } = useHealthStore();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'musclewiki'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `¡Hola ${profile?.name || 'atleta'}! Soy Aero, tu coach personal. He revisado tu historial: ${sessions.length} entrenamientos registrados. ¿En qué puedo ayudarte hoy?\n\nPuedes pulsar en el botón de la cabecera para generar tu auditoría estoica semanal instantánea.`,
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

  // Generar contexto de historial (RAG) para alimentar a la IA
  const buildRAGContext = () => {
    // 1. Resumen de las últimas 5 sesiones
    const last5 = sessions.slice(0, 5);
    const recentSessionsSummary = last5.map(s => {
      return `- Fecha: ${s.started_at.split('T')[0]}, Rutina: ${s.name}, Volumen: ${Math.round(Number(s.total_volume_kg) || 0)}kg, Dificultad: ${s.perceived_difficulty || 'N/A'}/10`;
    }).join('\n');

    // 2. Resumen de salud de la última semana
    const last7DaysHealth = dailyHealth.slice(0, 7);
    const recentHealthSummary = last7DaysHealth.map(h => {
      return `- Fecha: ${h.date}, Pasos: ${h.steps || 0}, Sueño: ${h.sleep_hours || 'N/A'}h (Calidad: ${h.sleep_quality || 'N/A'}/5), Energía: ${h.energy_level || 'N/A'}/10`;
    }).join('\n');

    return {
      recentSessionsSummary: recentSessionsSummary || 'Ningún entrenamiento registrado recientemente.',
      recentHealthSummary: recentHealthSummary || 'Ningún log de salud registrado en la última semana.',
    };
  };

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

  // Cálculo de estadísticas de la semana para el reporte
  const weeklyStats = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    const weeklySessions = sessions.filter(s => new Date(s.started_at) >= weekAgo);
    const weeklyHealth = dailyHealth.filter(h => new Date(h.date) >= weekAgo);

    const totalSessions = weeklySessions.length;
    const totalVolumeKg = Math.round(weeklySessions.reduce((acc, s) => acc + (Number(s.total_volume_kg) || 0), 0));
    const avgDurationMin = weeklySessions.length > 0 
      ? Math.round(weeklySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / weeklySessions.length) 
      : 0;

    const totalSteps = weeklyHealth.reduce((acc, h) => acc + (h.steps || 0), 0);
    
    const sleepWithData = weeklyHealth.filter(h => h.sleep_hours);
    const avgSleepHours = sleepWithData.length > 0 
      ? sleepWithData.reduce((acc, h) => acc + Number(h.sleep_hours), 0) / sleepWithData.length 
      : 7.0;
    const avgSleepQuality = sleepWithData.filter(h => h.sleep_quality).length > 0 
      ? sleepWithData.reduce((acc, h) => acc + (h.sleep_quality || 0), 0) / sleepWithData.filter(h => h.sleep_quality).length 
      : 3.0;

    // Obtener tendencia de peso (comparación con el peso de la semana pasada)
    let weightTrend = 'Estable';
    if (measurements.length >= 2) {
      const currentW = Number(measurements[0].weight_kg);
      const prevW = Number(measurements[measurements.length - 1].weight_kg);
      const diff = currentW - prevW;
      if (diff > 0.3) weightTrend = `Aumento de +${diff.toFixed(1)}kg (Evolución)`;
      else if (diff < -0.3) weightTrend = `Reducción de ${diff.toFixed(1)}kg (Evolución)`;
    }

    return {
      totalSessions,
      totalVolumeKg,
      avgDurationMin,
      totalSteps,
      avgSleepHours,
      avgSleepQuality,
      weightTrend
    };
  }, [sessions, dailyHealth, measurements]);

  const handleSend = async (messageText?: string) => {
    const msg = (messageText || input).trim();
    if (!msg || isTyping) return;

    setInput('');
    const newMsg: Message = { role: 'user', content: msg };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const context = buildUserContext();
      const ragContext = buildRAGContext();
      const history = messages.slice(1); // Excluye el mensaje inicial
      
      const response = await sendChatMessage(context, history, msg, ragContext);
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

  const handleGenerateReport = async () => {
    if (isTyping) return;
    
    // Inyectar mensaje ficticio del usuario en el chat
    const userMsg: Message = { role: 'user', content: 'Genera mi reporte de progreso semanal, Aero.' };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const context = buildUserContext();
      const report = await generateWeeklyReport(context, weeklyStats);
      setMessages((prev) => [...prev, { role: 'model', content: report }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'model', content: 'No he podido compilar tu reporte de esta semana. Sigamos entrenando, atleta. La disciplina no necesita papeles.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[78vh] flex flex-col -mx-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-blue/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-4 pb-3 pt-1 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-blue/20 rounded-2xl flex items-center justify-center">
            <Zap size={20} className="text-brand-blue animate-pulse" />
          </div>
          <div>
            <p className="font-black text-slate-50 text-sm">Aero Coach</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Groq · Llama 3.3
            </p>
          </div>
        </div>

        {/* Botón de Reporte Semanal */}
        <button
          onClick={handleGenerateReport}
          disabled={isTyping}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-brand-blue/20 border border-brand-blue/30 rounded-xl text-brand-blue text-[10px] font-black uppercase tracking-wider hover:bg-brand-blue/30 disabled:opacity-50 transition-all"
        >
          <FileText size={12} />
          Reporte Semanal
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
              activeSubTab === 'chat'
                ? 'bg-brand-blue text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 font-bold'
            )}
          >
            Aero Coach (IA)
          </button>
          <button
            onClick={() => setActiveSubTab('musclewiki')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
              activeSubTab === 'musclewiki'
                ? 'bg-brand-blue text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 font-bold'
            )}
          >
            MuscleWiki
          </button>
        </div>
      </div>

      {activeSubTab === 'chat' ? (
        <>
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
                      ? 'bg-brand-blue text-slate-950 rounded-tr-none font-black text-sm'
                      : 'glass-dark border border-white/10 rounded-tl-none text-slate-100 text-sm leading-relaxed'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
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
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-1.5 px-4 py-2.5 glass border-white/5 hover:border-brand-blue/20 rounded-xl text-xs font-bold text-slate-300 hover:text-brand-blue transition-all whitespace-nowrap"
                  >
                    <prompt.icon size={14} className="text-brand-blue" />
                    {prompt.text}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input bar */}
          <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntale a Aero sobre tu progreso o dudas..."
              className="flex-1 bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-brand-blue text-slate-950 rounded-2xl font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pt-4">
          <MuscleWikiExplorer />
        </div>
      )}
    </div>
  );
}
