import type { ErrorKey } from '../i18n/strings';
import { useCallback, useEffect, useRef, useState } from 'react';

// Browser speech-to-text (Web Speech API). Works in Chrome, Edge and Safari; not in Firefox.
// Chrome sends audio to Google's servers, so it needs an internet connection.
// It recognizes ONE language at a time (the `lang` passed to start()).

// TypeScript's DOM types include the events but not the recognizer itself, so describe the parts we use.
interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => SpeechRecognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Errors are returned as keys; the screen shows them in the app language (see i18n/strings.ts).
const errorKeys: Record<string, ErrorKey> = {
  'not-allowed': 'micBlocked',
  'service-not-allowed': 'micBlocked',
  'no-speech': 'noSpeech',
  'audio-capture': 'micNotFound',
  network: 'network',
};

interface Options {
  /** Called once when listening ends, with everything that was recognized. */
  onEnd?: (finalText: string) => void;
}

export function useSpeechRecognition({ onEnd }: Options = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<ErrorKey | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Everything heard so far (final + still-interim words). Chrome sometimes ends
  // without finalizing the last words, so this is what we hand to onEnd.
  const heardTextRef = useRef('');
  const onEndRef = useRef(onEnd);
  const isSupported = getRecognitionConstructor() !== null;

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // Stop listening if the component goes away mid-recording.
  useEffect(() => () => recognitionRef.current?.abort(), []);

  const start = useCallback((lang: string) => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setError('unsupported');
      return;
    }
    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = true; // keep listening through short pauses
    recognition.interimResults = true; // show words while the user is still talking

    heardTextRef.current = '';
    setTranscript('');
    setError(null);

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      heardTextRef.current = (finalText + interimText).trim();
      setTranscript(heardTextRef.current);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setError(errorKeys[event.error] ?? 'micStartFailed');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      onEndRef.current?.(heardTextRef.current);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setError('micStartFailed');
    }
  }, []);

  /** Stop and keep what was heard (onEnd fires with the text). */
  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  /** Stop and throw away what was heard (onEnd is not called). */
  const cancel = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onend = null;
    recognition.abort();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  /** Everything heard so far, readable right after stop() without waiting for onEnd. */
  const getText = useCallback(() => heardTextRef.current, []);

  return { isSupported, isListening, transcript, error, start, stop, cancel, getText };
}
