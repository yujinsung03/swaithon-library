import { useContext } from 'react';
import { I18nContext, type I18n } from './I18nProvider';
import type { ErrorKey, Strings } from './strings';

export function useI18n(): I18n {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}

/** An error the user can read: a known error key, or the server's HTTP status mapped to one. */
export class AppError extends Error {
  key: ErrorKey;

  constructor(key: ErrorKey) {
    super(key);
    this.key = key;
  }
}

export function errorText(err: unknown, t: Strings): string {
  if (err instanceof AppError) return t.errors[err.key];
  return t.errors.generic;
}

export function errorKeyOf(err: unknown): ErrorKey {
  return err instanceof AppError ? err.key : 'generic';
}
