import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, RotateCw } from 'lucide-react';
import type { StoicQuote } from '../../constants/stoicQuotes';

interface StoicQuoteCardProps {
  quote: StoicQuote;
  onNextQuote: () => void;
}

export default function StoicQuoteCard({ quote, onNextQuote }: StoicQuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass relative overflow-hidden p-5 border border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 via-slate-900/40 to-slate-950"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-brand-purple text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>Sabiduría Estoica</span>
        </div>
        <button
          onClick={onNextQuote}
          aria-label="Siguiente cita estoica"
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-white/5"
        >
          <RotateCw size={14} />
        </button>
      </div>

      <blockquote className="text-sm italic text-slate-200 leading-relaxed font-serif">
        "{quote.quote}"
      </blockquote>
      <div className="mt-2 text-right">
        <span className="text-xs font-bold text-slate-400">— {quote.author}</span>
        {quote.work && (
          <span className="text-[10px] text-slate-500 block">({quote.work})</span>
        )}
      </div>
    </motion.div>
  );
}
