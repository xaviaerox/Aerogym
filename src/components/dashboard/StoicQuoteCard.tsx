import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, RotateCw, Quote } from 'lucide-react';
import type { StoicQuote } from '../../constants/stoicQuotes';

interface StoicQuoteCardProps {
  quote: StoicQuote;
  onNextQuote: () => void;
}

export default function StoicQuoteCard({ quote, onNextQuote }: StoicQuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass relative overflow-hidden p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-slate-900/60 to-slate-950/80 backdrop-blur-xl shadow-xl shadow-purple-950/10 space-y-4 group"
    >
      {/* Glow Ambient Filter */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
            Sabiduría Estoica
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ rotate: 180, scale: 0.95 }}
          onClick={onNextQuote}
          aria-label="Siguiente cita estoica"
          className="p-2 rounded-xl text-slate-400 hover:text-purple-300 transition-colors bg-white/5 border border-white/5 hover:border-purple-500/30"
        >
          <RotateCw size={14} />
        </motion.button>
      </div>

      {/* Quote Body */}
      <div className="relative pt-1">
        <Quote size={28} className="absolute -top-2 -left-2 text-purple-500/10 -scale-x-100 pointer-events-none" />
        <p className="relative text-sm sm:text-base font-semibold text-slate-100 leading-relaxed font-sans tracking-wide">
          "{quote.quote}"
        </p>
      </div>

      {/* Author Footer */}
      <div className="flex justify-end items-center pt-2 border-t border-white/5">
        <div className="text-right">
          <span className="text-xs font-bold text-purple-300">
            — {quote.author}
          </span>
          {quote.work && (
            <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
              ({quote.work})
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
