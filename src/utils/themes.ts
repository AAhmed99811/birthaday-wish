import type { ThemeVariant } from '../types/birthday';

export interface ThemePalette {
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  accentText: string;
  subText: string;
  pillBg: string;
  pillText: string;
  buttonGradient: string;
  confettiColors: string[];
}

export const THEME_PALETTES: Record<ThemeVariant, ThemePalette> = {
  blush: {
    bgGradient: 'from-[#fff0f5] via-[#fff7fa] to-[#ffe4ee]',
    cardBg: 'bg-white/90',
    cardBorder: 'border-pink-200/80',
    accentText: 'text-rose-600',
    subText: 'text-rose-900/75',
    pillBg: 'bg-pink-100',
    pillText: 'text-rose-700',
    buttonGradient: 'from-pink-500 via-rose-500 to-pink-500',
    confettiColors: ['#fb7185', '#f472b6', '#fda4af', '#fbcfe8', '#fde047'],
  },
  lavender: {
    bgGradient: 'from-[#f5f3ff] via-[#fdf4ff] to-[#fce7f3]',
    cardBg: 'bg-white/90',
    cardBorder: 'border-purple-200/80',
    accentText: 'text-purple-700',
    subText: 'text-purple-950/75',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-700',
    buttonGradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    confettiColors: ['#c084fc', '#e879f9', '#f472b6', '#a78bfa', '#fde68a'],
  },
  warm: {
    bgGradient: 'from-[#fff7ed] via-[#fffbf5] to-[#ffe4e6]',
    cardBg: 'bg-[#fffdfa]/95',
    cardBorder: 'border-amber-200/80',
    accentText: 'text-rose-700',
    subText: 'text-amber-950/75',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-800',
    buttonGradient: 'from-amber-500 via-rose-500 to-pink-500',
    confettiColors: ['#fb7185', '#fbbf24', '#fdba74', '#f472b6', '#fef08a'],
  },
};

