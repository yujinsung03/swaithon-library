import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { languages, strings, type LanguageCode, type Strings } from './strings';

const STORAGE_KEY = 'swaithon.language';

export interface I18n {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: Strings;
}

// eslint-disable-next-line react-refresh/only-export-components
export const I18nContext = createContext<I18n | null>(null);

function isLanguage(value: string | null | undefined): value is LanguageCode {
  return languages.some((language) => language.code === value);
}

/** The saved choice, else the browser's language if we support it, else English. */
function initialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage can be blocked (private mode); fall through.
  }
  const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : '';
  return isLanguage(browser) ? browser : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not saved for next time; the choice still applies now.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t: strings[language] }), [language, setLanguage]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
