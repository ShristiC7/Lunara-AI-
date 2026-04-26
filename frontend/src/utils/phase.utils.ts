// utils/phase.utils.js
import { Droplets, Sprout, Zap, Moon } from 'lucide-react';

export const PHASE_CONFIG = {
  MENSTRUAL: {
    label: 'Menstrual',
    color: '#F43F5E',
    colorLight: '#FFF1F2',
    colorMuted: 'rgba(244,63,94,0.12)',
    icon: Droplets,
    description: 'Rest and restore. Your body is working hard.',
    dayRange: [1, 5],
  },
  FOLLICULAR: {
    label: 'Follicular',
    color: '#8B5CF6',
    colorLight: '#F5F3FF',
    colorMuted: 'rgba(139,92,246,0.12)',
    icon: Sprout,
    description: 'Energy builds. A good time to start new things.',
    dayRange: [6, 13],
  },
  OVULATION: {
    label: 'Ovulation',
    color: '#06B6D4',
    colorLight: '#F0FDFE',
    colorMuted: 'rgba(6,182,212,0.12)',
    icon: Zap,
    description: 'Peak energy. You are at your sharpest today.',
    dayRange: [14, 16],
  },
  LUTEAL: {
    label: 'Luteal',
    color: '#F59E0B',
    colorLight: '#FFFBEB',
    colorMuted: 'rgba(245,158,11,0.12)',
    icon: Moon,
    description: 'Turn inward. Protect your energy.',
    dayRange: [17, 28],
  },
};

export function getPhaseFromDay(day: number) {
  if (day <= 5) return 'MENSTRUAL';
  if (day <= 13) return 'FOLLICULAR';
  if (day <= 16) return 'OVULATION';
  return 'LUTEAL';
}
