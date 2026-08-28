import { MONTHS_SHORT_BG } from '../../i18n/bg';
import type { Lang } from '../storage/store';

function locale(lang: Lang): string {
  return lang === 'bg' ? 'bg-BG' : 'en';
}

export const fmt = {
  time(iso: string): string {
    const date = new Date(iso);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },
  dayNum: (iso: string): number => new Date(iso).getDate(),
  mon(iso: string, lang: Lang): string {
    const date = new Date(iso);
    if (lang === 'bg') return (MONTHS_SHORT_BG[date.getMonth()] ?? '').toUpperCase();
    return date.toLocaleDateString(locale(lang), { month: 'short' }).toUpperCase();
  },
  weekday: (iso: string, lang: Lang): string =>
    new Date(iso).toLocaleDateString(locale(lang), { weekday: 'short' }).toUpperCase(),
  dateLong: (iso: string, lang: Lang): string =>
    new Date(iso).toLocaleDateString(locale(lang), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  money: (value: number): string => `${(Math.round(value * 100) / 100).toFixed(2)} лв`,
  isoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  },
};
