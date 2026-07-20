import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Dumbbell } from 'lucide-react';
import { findGifForExercise } from '../lib/exerciseGifService';

interface ExerciseMediaProps {
  exerciseName: string;
  primaryMuscle: string;
  className?: string;
  localGifUrl?: string | null;
}

type State = 'loading' | 'loaded' | 'error';

interface MediaSource {
  url: string;
  isLocal: boolean;
  isVideo: boolean;
}

function isVideoUrl(url: string): boolean {
  const clean = url.toLowerCase().split('?')[0];
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.ogg');
}

export default function ExerciseMedia({ exerciseName, primaryMuscle, className = '', localGifUrl = null }: ExerciseMediaProps) {
  const [sources, setSources] = useState<MediaSource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<State>('loading');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setState('loading');
    setCurrentIndex(0);

    const initialSources: MediaSource[] = [];

    if (localGifUrl) {
      const isVid = isVideoUrl(localGifUrl);
      initialSources.push({
        url: localGifUrl,
        isLocal: true,
        isVideo: isVid,
      });

      // Add path variations as fallback candidates for local files
      const baseUrl = import.meta.env.BASE_URL || '/';
      if (localGifUrl.startsWith('/Aerogym/')) {
        const rootUrl = localGifUrl.replace('/Aerogym/', '/');
        initialSources.push({
          url: rootUrl,
          isLocal: true,
          isVideo: isVid,
        });
      } else if (localGifUrl.startsWith('/') && baseUrl !== '/') {
        const baseUrlClean = baseUrl.replace(/\/$/, '');
        const altUrl = `${baseUrlClean}${localGifUrl}`;
        initialSources.push({
          url: altUrl,
          isLocal: true,
          isVideo: isVid,
        });
      }
    }

    setSources(initialSources);

    // Fetch online fallback from ExerciseDB OSS
    findGifForExercise(exerciseName, primaryMuscle)
      .then((remoteGif) => {
        if (!mountedRef.current) return;
        if (remoteGif) {
          setSources((prev) => {
            if (prev.some((s) => s.url === remoteGif)) return prev;
            return [...prev, { url: remoteGif, isLocal: false, isVideo: isVideoUrl(remoteGif) }];
          });
        }
      })
      .catch(() => {});

    return () => {
      mountedRef.current = false;
    };
  }, [exerciseName, primaryMuscle, localGifUrl]);

  useEffect(() => {
    if (sources.length > 0 && currentIndex < sources.length) {
      setState('loaded');
    } else if (sources.length === 0) {
      const timeout = setTimeout(() => {
        if (mountedRef.current && sources.length === 0) {
          setState('error');
        }
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      setState('error');
    }
  }, [sources, currentIndex]);

  const handleMediaError = () => {
    if (currentIndex + 1 < sources.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setState('error');
    }
  };

  const currentSource = sources[currentIndex];

  return (
    <div className={`relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-slate-950 ${className}`}>
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/60 to-slate-900 animate-[shimmer_1.5s_infinite]"
              style={{ backgroundSize: '200% 100%' }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-brand-blue" size={22} />
              <span className="text-slate-500 text-[10px] tracking-widest uppercase font-bold">Cargando ejercicio…</span>
            </div>
          </motion.div>
        )}

        {state === 'loaded' && currentSource && (
          <motion.div
            key={`${currentSource.url}-${currentIndex}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {currentSource.isVideo ? (
              <video
                src={currentSource.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain p-2"
                onError={handleMediaError}
              />
            ) : (
              <img
                src={currentSource.url}
                alt={exerciseName}
                className="w-full h-full object-contain p-2"
                onError={handleMediaError}
              />
            )}
            {/* Source badge */}
            <div className="absolute bottom-2 right-3 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-full px-2 py-0.5 text-[9px] text-slate-400 font-bold tracking-widest uppercase">
              {currentSource.isLocal ? 'Base de Datos Local' : 'ExerciseDB'}
            </div>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-slate-800/60 flex items-center justify-center">
              <Dumbbell className="text-slate-600" size={24} />
            </div>
            <p className="text-slate-600 text-xs tracking-wide">Vista previa no disponible</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
