/**
 * useVoiceInput.ts — Web Speech API Voice Recognition Hook.
 *
 * Captures Spanish speech input and parses workout set commands in real-time.
 * Supported patterns:
 *  - "80 kilos 10 repeticiones" / "75.5 kg 8 reps" -> { weightKg: 80, reps: 10 }
 *  - "serie hecha" / "completar" -> { action: 'complete' }
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export interface ParsedVoiceResult {
  rawText: string;
  weightKg?: number;
  reps?: number;
  action?: 'complete' | 'add_set';
}

export function useVoiceInput(onResult?: (result: ParsedVoiceResult) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reference to SpeechRecognition instance
  const recognitionRef = useRef<any>(null);

  // Check if browser supports Web Speech API
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const parseText = (text: string): ParsedVoiceResult => {
    const clean = text.toLowerCase().trim();
    const result: ParsedVoiceResult = { rawText: text };

    // Action match
    if (clean.includes('serie hecha') || clean.includes('completar') || clean.includes('hecho') || clean.includes('listo')) {
      result.action = 'complete';
    } else if (clean.includes('añadir serie') || clean.includes('otra serie')) {
      result.action = 'add_set';
    }

    // Weight match: e.g. "80 kilos", "75.5 kg", "60.5 Kilos"
    const weightMatch = clean.match(/(\d+([.,]\d+)?)\s*(kilos?|kg|kilo)/i);
    if (weightMatch) {
      const w = parseFloat(weightMatch[1].replace(',', '.'));
      if (!isNaN(w) && w > 0) result.weightKg = w;
    }

    // Reps match: e.g. "10 repeticiones", "8 reps", "por 12"
    const repsMatch = clean.match(/(\d+)\s*(repeticiones|reps?|rep)/i) || clean.match(/por\s*(\d+)/i);
    if (repsMatch) {
      const r = parseInt(repsMatch[1]);
      if (!isNaN(r) && r > 0) result.reps = r;
    }

    // Fallback simple numbers if e.g. "80 10" spoken
    if (result.weightKg === undefined && result.reps === undefined) {
      const numbers = clean.match(/\d+([.,]\d+)?/g);
      if (numbers && numbers.length >= 2) {
        result.weightKg = parseFloat(numbers[0].replace(',', '.'));
        result.reps = parseInt(numbers[1]);
      }
    }

    return result;
  };

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('El reconocimiento de voz no está soportado en este navegador.');
      return;
    }

    setError(null);
    setTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);

      if (event.results[current].isFinal) {
        const parsed = parseText(text);
        if (onResult) onResult(parsed);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[useVoiceInput] Error:', event.error);
      setError(`Error de voz: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
