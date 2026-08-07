import type { Lang } from './store';
import { MONTHS_SHORT_BG } from '../i18n/bg';

export function locale(lang: Lang): string {
  return lang === 'bg' ? 'bg-BG' : 'en';
}

export const fmt = {
  time(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  dayNum(iso: string): number {
    return new Date(iso).getDate();
  },
  mon(iso: string, lang: Lang): string {
    const d = new Date(iso);
    if (lang === 'bg') return (MONTHS_SHORT_BG[d.getMonth()] ?? '').toUpperCase();
    return d.toLocaleDateString(locale(lang), { month: 'short' }).toUpperCase();
  },
  weekday(iso: string, lang: Lang): string {
    return new Date(iso).toLocaleDateString(locale(lang), { weekday: 'short' }).toUpperCase();
  },
  dateLong(iso: string, lang: Lang): string {
    return new Date(iso).toLocaleDateString(locale(lang), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  },
  money(n: number): string {
    return `${(Math.round(n * 100) / 100).toFixed(2)} лв`;
  },
  isoDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
  },
};
