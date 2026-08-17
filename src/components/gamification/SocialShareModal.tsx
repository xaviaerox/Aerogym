import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Download, Share2, Dumbbell, Trophy } from 'lucide-react';
import type { WorkoutSession } from '../../infrastructure/supabase/types';

interface SocialShareModalProps {
  session?: WorkoutSession | null;
  prName?: string;
  prWeight?: number;
  onClose: () => void;
}

export default function SocialShareModal({ session, prName, prWeight, onClose }: SocialShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size for standard 9:16 Instagram Story (1080x1920 scaled to 540x960)
    canvas.width = 540;
    canvas.height = 960;

    // Background Gradient (Dark Aero Slate)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 960);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 540, 960);

    // Accent Glow Circle
    const glow = ctx.createRadialGradient(270, 300, 10, 270, 300, 250);
    glow.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 540, 960);

    // Card Container Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, 180, 460, 600, 24);
    ctx.fill();
    ctx.stroke();

    // Brand Title
    ctx.fillStyle = '#3b82f6';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AEROGYM 3.0', 270, 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px sans-serif';
    ctx.fillText('TU ENTRENADOR PERSONAL INTELIGENTE', 270, 145);

    // Card Header Badge
    ctx.fillStyle = prName ? '#f59e0b' : '#3b82f6';
    ctx.font = '900 22px sans-serif';
    ctx.fillText(prName ? '🏆 ¡NUEVO RÉCORD PERSONAL!' : '💪 ENTRENAMIENTO COMPLETADO', 270, 240);

    // Main Stat Content
    if (prName) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px sans-serif';
      ctx.fillText(prName, 270, 320);

      ctx.fillStyle = '#10b981';
      ctx.font = '900 72px sans-serif';
      ctx.fillText(`${prWeight || 0} kg`, 270, 420);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px sans-serif';
      ctx.fillText('Nuevo Récord Máximo Registrado', 270, 460);
    } else if (session) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px sans-serif';
      ctx.fillText(session.name || 'Sesión de Entrenamiento', 270, 320);

      ctx.fillStyle = '#3b82f6';
      ctx.font = '900 64px sans-serif';
      ctx.fillText(`${Math.round(Number(session.total_volume_kg || 0))} kg`, 270, 420);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px sans-serif';
      ctx.fillText(`Duración: ${session.duration_minutes || 0} min`, 270, 460);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px sans-serif';
      ctx.fillText('Superando Límites', 270, 340);

      ctx.fillStyle = '#10b981';
      ctx.font = '900 64px sans-serif';
      ctx.fillText('Sobrecarga Progresiva', 270, 430);
    }

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(80, 520);
    ctx.lineTo(460, 520);
    ctx.stroke();

    // Stoic Quote / Footer Text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('"Lo que no nos mata nos hace más fuertes."', 270, 580);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px sans-serif';
    ctx.fillText('— Séneca · Aero AI Coach', 270, 610);

    // Hashtags & Web URL Footer
    ctx.fillStyle = '#3b82f6';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('#AeroGym #ProgressiveOverload #Fitness', 270, 720);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px sans-serif';
    ctx.fillText('aerogym.app', 270, 860);
  }, [session, prName, prWeight]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `AeroGym_${prName ? 'PR' : 'Workout'}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-dark border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            <h3 className="font-extrabold text-slate-100 text-base">Compartir Logro</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="flex justify-center rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
          <canvas ref={canvasRef} className="w-56 h-[398px] object-contain" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-brand-blue/20 transition-all text-sm"
          >
            <Download size={18} />
            <span>Descargar Imagen</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
