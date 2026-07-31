import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Send, Loader2, Zap, Brain, Target, Dumbbell, FileText } from 'lucide-react';
import { useAuthStore } from '../application/stores/useAuthStore';
import { useWorkoutStore } from '../application/stores/useWorkoutStore';
import { useHealthStore } from '../application/stores/useHealthStore';
import { sendChatMessageStream, generateWeeklyReport, type UserContextForAI } from '../lib/aiService';
import MuscleWikiExplorer from './MuscleWikiExplorer';
import { subDays } from 'date-fns';
import { cn } from '../lib/utils';
import { vectorMemoryEngine } from '../lib/vectorMemory';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const QUICK_PROMPTS = [
  { icon: Dumbbell, text: 'Técnica del press de banca', label: 'Técnica' },
  { icon: Target, text: 'Rutina recomendada para hoy', label: 'Rutina Hoy' },
  { icon: Brain, text: 'Cómo optimizar mi recuperación muscular', label: 'Recuperación' },
];

export default function CoachView() {
  const { profile } = useAuthStore();
  const { sessions, workoutSetsHistory } = useWorkoutStore();
  const { dailyHealth, measurements } = useHealthStore();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'library'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `¡Hola ${profile?.name || 'atleta'}! Soy Aero, tu coach personal de IA. He analizado tu historial: ${sessions.length} entrenamientos registrados. ¿En qué deseas enfocarte hoy?\n\nPuedes generar tu reporte de auditoría semanal o hacer cualquier consulta sobre tu técnica y progresión.`,
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

  // Generar contexto RAG para alimentar a la IA
  const buildRAGContext = (queryMsg?: string) => {
    const last5 = sessions.slice(0, 5);
    const recentSessionsSummary = last5.map(s => {
      return `- Fecha: ${s.started_at.split('T')[0]}, Rutina: ${s.name}, Volumen: ${Math.round(Number(s.total_volume_kg) || 0)}kg, Dificultad: ${s.perceived_difficulty || 'N/A'}/10`;
    }).join('\n');

    const last7DaysHealth = dailyHealth.slice(0, 7);
    const recentHealthSummary = last7DaysHealth.map(h => {
      return `- Fecha: ${h.date}, Pasos: ${h.steps || 0}, Sueño: ${h.sleep_hours || 'N/A'}h (Calidad: ${h.sleep_quality || 'N/A'}/5), Energía: ${h.energy_level || 'N/A'}/10`;
    }).join('\n');

    const ragMemorySnippets = queryMsg
      ? vectorMemoryEngine.searchRelevantHistory(queryMsg, sessions, workoutSetsHistory)
      : [];

    return {
      recentSessionsSummary: recentSessionsSummary || 'Ningún entrenamiento registrado recientemente.',
      recentHealthSummary: recentHealthSummary || 'Ningún log de salud registrado en la última semana.',
      ragMemorySnippets,
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
    
    setMessages((prev) => [...prev, newMsg, { role: 'model', content: '' }]);
    setIsTyping(true);

    try {
      const context = buildUserContext();
      const ragContext = buildRAGContext(msg);
      const history = messages.slice(1);

      await sendChatMessageStream(
        context,
        history,
        msg,
        (accumulatedText) => {
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].role === 'model') {
              next[next.length - 1] = { role: 'model', content: accumulatedText };
            }
            return next;
          });
        },
        ragContext
      );
    } catch (error: unknown) {
      console.error('sendChatMessage error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      let friendlyMsg = 'Parece que hay un problema de conexión. Inténtalo de nuevo.';

      if (errorMsg.includes('no autenticado') || errorMsg.includes('401')) {
        friendlyMsg = 'Sesión expirada. Por favor, recarga la app.';
      } else if (errorMsg.includes('429') || errorMsg.includes('quota')) {
        friendlyMsg = 'El coach está muy ocupado. Inténtalo en unos minutos.';
      }

      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === 'model') {
          next[next.length - 1] = { role: 'model', content: friendlyMsg };
        } else {
          next.push({ role: 'model', content: friendlyMsg });
        }
        return next;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateReport = async () => {
    if (isTyping) return;
    
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
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-3">
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shrink-0">
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5 flex-1 max-w-[280px]">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
              activeSubTab === 'chat'
                ? 'bg-brand-blue text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 font-bold'
            )}
          >
            Aero Coach (IA)
          </button>
          <button
            onClick={() => setActiveSubTab('library')}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
              activeSubTab === 'library'
                ? 'bg-brand-blue text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 font-bold'
            )}
          >
            Ejercicios
          </button>
        </div>

        {activeSubTab === 'chat' && (
          <button
            onClick={handleGenerateReport}
            disabled={isTyping}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue/20 border border-brand-blue/30 rounded-xl text-brand-blue text-[10px] font-black uppercase tracking-wider hover:bg-brand-blue/30 disabled:opacity-50 transition-all shadow-sm"
          >
            <FileText size={13} />
            Reporte Semanal
          </button>
        )}
      </div>

      {activeSubTab === 'chat' ? (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
          {/* Background Accent Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-blue/10 blur-[100px] pointer-events-none" />

          {/* Messages scroll area - Fills 100% of vertical height */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scroll-smooth relative z-10"
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex w-full flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'max-w-[88%] p-4 rounded-2xl shadow-md',
                    msg.role === 'user'
                      ? 'bg-brand-blue text-slate-950 rounded-tr-none font-black text-sm'
                      : 'bg-slate-800/90 border border-white/10 rounded-tl-none text-slate-100 text-sm leading-relaxed'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Inline Quick Action Suggestion Cards inside initial welcome message */}
                {i === 0 && messages.length === 1 && (
                  <div className="grid grid-cols-3 gap-2 mt-4 w-full max-w-[88%]">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt.text)}
                        className="bg-slate-800/80 border border-white/10 hover:border-brand-blue/40 p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all hover:bg-brand-blue/10 group"
                      >
                        <prompt.icon size={16} className="text-brand-blue group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-brand-blue leading-tight">
                          {prompt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800/90 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-brand-blue" />
                  <span className="text-xs text-slate-400 font-medium">Aero está pensando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar - Fixed at bottom of chat card */}
          <div className="p-3 bg-slate-950/95 backdrop-blur-md border-t border-white/10 flex gap-2 shrink-0 relative z-20">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntale a Aero sobre tu progreso o dudas..."
              className="flex-1 bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-blue/30 placeholder:text-slate-500 text-slate-100"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3.5 bg-brand-blue text-slate-950 rounded-2xl font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MuscleWikiExplorer />
        </div>
      )}
    </div>
  );
}
