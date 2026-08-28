import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { en, WEEKDAYS_EN } from './en';
import type { TranslationKey } from './en';
import { bg, WEEKDAYS_BG } from './bg';
import { store } from '../shared/storage/store';
import type { Lang } from '../shared/storage/store';

const DICTS: Record<Lang, Record<TranslationKey, string>> = { en, bg };

export type TFunction = (key: TranslationKey) => string;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: TFunction;
  /** Weekday names in display order (Monday first), localized. */
  weekdays: readonly string[];
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => store.lang);

  const setLang = useCallback((l: Lang) => {
    store.lang = l;
    document.documentElement.lang = l;
    setLangState(l);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = DICTS[lang];
    return {
      lang,
      setLang,
      toggleLang: () => setLang(lang === 'bg' ? 'en' : 'bg'),
      // Fall back to English for any key a translation is missing.
      t: (key) => dict[key] ?? en[key] ?? key,
      weekdays: lang === 'bg' ? WEEKDAYS_BG : WEEKDAYS_EN,
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

/** Canonical weekday keys the API expects, in display order. */
export const API_WEEKDAYS = WEEKDAYS_EN;

/**
 * The API stores a language as the word "Bulgarian" or "English" (CustomUser.
 * preferred_language); the UI works in locale codes. These convert between the two.
 */
export function langToApi(l: Lang): string {
  return l === 'bg' ? 'Bulgarian' : 'English';
}

export function apiToLang(v: string | undefined): Lang | null {
  if (v === 'Bulgarian') return 'bg';
  if (v === 'English') return 'en';
  return null;
}
