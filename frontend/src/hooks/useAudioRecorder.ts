import type { ErrorKey } from '../i18n/strings';
import { useCallback, useEffect, useRef, useState } from 'react';

// Records the microphone with MediaRecorder so the audio can be sent to the AI.

const MAX_SECONDS = 60; // keeps uploads small; long enough for a spoken sentence or two

function isRecorderSupported() {
  return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null);
  const timerRef = useRef<number | null>(null);
  const isSupported = isRecorderSupported();

  const releaseMicrophone = useCallback(() => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    releaseMicrophone();
  }, [releaseMicrophone]);

  /** Starts recording. Resolves to false if the microphone isn't available. */
  const start = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = chunksRef.current.length ? new Blob(chunksRef.current, { type: recorder.mimeType }) : null;
        setIsRecording(false);
        releaseMicrophone();
        stopResolverRef.current?.(blob);
        stopResolverRef.current = null;
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      timerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, MAX_SECONDS * 1000);
      return true;
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      setError(
        denied
          ? 'micBlocked'
          : 'micNotFound',
      );
      return false;
    }
  }, [isSupported, releaseMicrophone]);

  /** Stops recording and resolves with the audio (null if nothing was recorded). */
  const stop = useCallback((): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return Promise.resolve(null);
    return new Promise((resolve) => {
      stopResolverRef.current = resolve;
      recorder.stop();
    });
  }, []);

  /** Stops recording and throws the audio away. */
  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorder.onstop = null;
    if (recorder.state === 'recording') recorder.stop();
    stopResolverRef.current = null;
    setIsRecording(false);
    releaseMicrophone();
  }, [releaseMicrophone]);

  return { isSupported, isRecording, error, start, stop, cancel };
}
