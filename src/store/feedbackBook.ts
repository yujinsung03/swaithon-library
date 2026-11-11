import { useCallback, useEffect, useRef, useState } from 'react';
import type { Correction } from '../api/types';
import { feedbackRepository } from './feedbackRepository';

interface EntryBase {
  id: string;
  createdAt: number;
  memo: string;
}

export interface SpeakEntry extends EntryBase {
  kind: 'speak';
  sourceText: string;
  intentEnglish: string;
  korean: string;
  tone: string;
  corrections: Correction[];
}

export interface ListenExpression {
  word: string;
  tag: string;
  explanation: string;
}

export interface ListenEntry extends EntryBase {
  kind: 'listen';
  korean: string;
  english: string;
  expressions: ListenExpression[];
}

export type FeedbackEntry = SpeakEntry | ListenEntry;

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type NewFeedbackEntry = DistributiveOmit<FeedbackEntry, 'id' | 'createdAt' | 'memo'>;

export type StorageMode = typeof feedbackRepository.mode;

function messageOf(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Something went wrong';
}

export function useFeedbackBook() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const entriesRef = useRef(entries);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    let cancelled = false;
    feedbackRepository
      .list()
      .then((loaded) => {
        if (!cancelled) setEntries(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(`Could not load your Feedback Book: ${messageOf(err)}`);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Resolves to true when the entry was saved. */
  const addEntry = useCallback(async (entry: NewFeedbackEntry) => {
    try {
      const saved = await feedbackRepository.add(entry);
      setEntries((current) => [saved, ...current]);
      setError(null);
      return true;
    } catch (err) {
      setError(`Could not save: ${messageOf(err)}`);
      return false;
    }
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    const index = entriesRef.current.findIndex((entry) => entry.id === id);
    const removed = entriesRef.current[index];
    setEntries((current) => current.filter((entry) => entry.id !== id));
    try {
      await feedbackRepository.remove(id);
      setError(null);
    } catch (err) {
      // Put it back where it was.
      if (removed) {
        setEntries((current) => {
          const next = [...current];
          next.splice(Math.min(index, next.length), 0, removed);
          return next;
        });
      }
      setError(`Could not delete: ${messageOf(err)}`);
    }
  }, []);

  /** Resolves to true when the memo was saved. */
  const updateMemo = useCallback(async (id: string, memo: string) => {
    try {
      await feedbackRepository.updateMemo(id, memo);
      setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, memo } : entry)));
      setError(null);
      return true;
    } catch (err) {
      setError(`Could not save memo: ${messageOf(err)}`);
      return false;
    }
  }, []);

  return {
    entries,
    isLoading,
    error,
    mode: feedbackRepository.mode as StorageMode,
    addEntry,
    removeEntry,
    updateMemo,
  };
}
