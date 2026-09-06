import React from 'react';
import { Scale, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { BodyMeasurement } from '../../infrastructure/supabase/types';

interface BodyCompositionTabProps {
  compositionData: {
    date: string;
    weight: number;
    fat?: number;
    waist?: number;
    arm?: number;
    leg?: number;
  }[];
  measurements: BodyMeasurement[];
  onOpenModal: () => void;
}

export default function BodyCompositionTab({
  compositionData,
  measurements,
  onOpenModal,
}: BodyCompositionTabProps) {
  if (!compositionData.length) {
    return (
      <div className="glass p-12 rounded-3xl text-center space-y-4 border border-white/5 animate-in fade-in duration-300">
        <Scale size={40} className="text-slate-600 mx-auto" />
        <div>
          <p className="text-slate-400 font-bold">Sin medidas registradas</p>
          <p className="text-slate-600 text-xs mt-1">
            Sigue la evolución de tu composición corporal registrando tu peso y contornos
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="py-3 px-6 bg-brand-blue text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:bg-brand-blue/90 transition-colors"
        >
          + Registrar Primera Medida
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Peso & Grasa Chart */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
          <Scale size={16} className="text-rose-400" /> Peso Corporal e Índice de Grasa
        </h2>
        <div className="h-64 glass p-4 rounded-3xl border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={compositionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                name="Peso (kg)"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weightGrad)"
                dot={{ fill: '#f43f5e', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="fat"
                name="Grasa (%)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ fill: '#38bdf8', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Medidas de Contornos Chart */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
          <Activity size={16} className="text-brand-blue" /> Contornos y Medidas (cm)
        </h2>
        <div className="h-56 glass p-4 rounded-3xl border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={compositionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <Line type="monotone" dataKey="waist" name="Cintura" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 2 }} />
              <Line type="monotone" dataKey="arm" name="Brazo" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 2 }} />
              <Line type="monotone" dataKey="leg" name="Muslo" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Historial en formato lista */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Historial de Medidas</h3>
        <div className="space-y-2">
          {[...measurements].slice(0, 5).map((m) => (
            <div key={m.id} className="glass p-4 rounded-2xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-50">{m.weight_kg} kg</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  {format(new Date(m.measured_at), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
              <div className="flex gap-3 text-[10px] text-slate-400 font-bold">
                {m.body_fat_pct && <span>Grasa: {m.body_fat_pct}%</span>}
                {m.waist_cm && <span>Cintura: {m.waist_cm}cm</span>}
                {m.arm_cm && <span>Brazo: {m.arm_cm}cm</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
