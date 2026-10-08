export type ThemeId = 'midnight' | 'cyberpunk' | 'obsidian' | 'emerald' | 'velvet' | 'amber' | 'nordic';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  previewHex: string;
  accentHex: string;
  // Core Tailwind classes
  bgApp: string;
  bgCard: string;
  bgSubtle: string;
  border: string;
  borderHover: string;
  textPrimary: string;
  textMuted: string;
  accentBg: string;
  accentHover: string;
  accentText: string;
  accentRing: string;
  accentGlow: string;
  activeSpeakerBorder: string;
  isLight?: boolean;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Sapphire (New Theme)',
    subtitle: 'Deep executive navy with brilliant royal cobalt & sapphire glow',
    previewHex: '#2563eb',
    accentHex: '#3b82f6',
    bgApp: 'bg-[#060a16]',
    bgCard: 'bg-[#0d1424]',
    bgSubtle: 'bg-[#141e34]',
    border: 'border-[#1e2c4a]',
    borderHover: 'hover:border-[#3b82f6]/60',
    textPrimary: 'text-slate-100',
    textMuted: 'text-slate-400',
    accentBg: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold',
    accentHover: 'hover:bg-blue-500',
    accentText: 'text-blue-400',
    accentRing: 'ring-blue-500/40',
    accentGlow: 'shadow-[0_0_24px_rgba(37,99,235,0.3)]',
    activeSpeakerBorder: 'border-blue-400 ring-2 ring-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.35)]',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    subtitle: 'High-contrast nocturnal synthwave with neon violet & fuchsia glow',
    previewHex: '#d946ef',
    accentHex: '#ec4899',
    bgApp: 'bg-[#08060f]',
    bgCard: 'bg-[#120e21]',
    bgSubtle: 'bg-[#1b1530]',
    border: 'border-[#2d224d]',
    borderHover: 'hover:border-[#d946ef]/60',
    textPrimary: 'text-fuchsia-50',
    textMuted: 'text-fuchsia-300/70',
    accentBg: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold',
    accentHover: 'hover:opacity-95',
    accentText: 'text-fuchsia-400',
    accentRing: 'ring-fuchsia-500/40',
    accentGlow: 'shadow-[0_0_24px_rgba(217,70,239,0.35)]',
    activeSpeakerBorder: 'border-fuchsia-400 ring-2 ring-fuchsia-400/50 shadow-[0_0_20px_rgba(217,70,239,0.4)]',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Teal',
    subtitle: 'Ultra-modern stealth with electric cyan & teal highlights',
    previewHex: '#06b6d4',
    accentHex: '#06b6d4',
    bgApp: 'bg-[#07090e]',
    bgCard: 'bg-[#0f141f]',
    bgSubtle: 'bg-[#151c2c]',
    border: 'border-[#1e293b]',
    borderHover: 'hover:border-[#38bdf8]/40',
    textPrimary: 'text-slate-100',
    textMuted: 'text-slate-400',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold',
    accentHover: 'hover:bg-cyan-400',
    accentText: 'text-cyan-400',
    accentRing: 'ring-cyan-500/40',
    accentGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    activeSpeakerBorder: 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    subtitle: 'Deep carbon charcoal paired with vivid neon emerald',
    previewHex: '#10b981',
    accentHex: '#10b981',
    bgApp: 'bg-[#050a08]',
    bgCard: 'bg-[#0c1612]',
    bgSubtle: 'bg-[#12231c]',
    border: 'border-[#1b3328]',
    borderHover: 'hover:border-[#10b981]/50',
    textPrimary: 'text-emerald-50',
    textMuted: 'text-emerald-400/70',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold',
    accentHover: 'hover:bg-emerald-400',
    accentText: 'text-emerald-400',
    accentRing: 'ring-emerald-500/40',
    accentGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    activeSpeakerBorder: 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
  },
  velvet: {
    id: 'velvet',
    name: 'Velvet Violet',
    subtitle: 'Sleek luxury noir with vibrant electric violet tones',
    previewHex: '#a855f7',
    accentHex: '#a855f7',
    bgApp: 'bg-[#090611]',
    bgCard: 'bg-[#140e24]',
    bgSubtle: 'bg-[#1d1533]',
    border: 'border-[#2e2152]',
    borderHover: 'hover:border-[#a855f7]/50',
    textPrimary: 'text-purple-50',
    textMuted: 'text-purple-300/70',
    accentBg: 'bg-purple-600 hover:bg-purple-500 text-white font-semibold',
    accentHover: 'hover:bg-purple-500',
    accentText: 'text-purple-400',
    accentRing: 'ring-purple-500/40',
    accentGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    activeSpeakerBorder: 'border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
  },
  amber: {
    id: 'amber',
    name: 'Sunset Gold',
    subtitle: 'Warm titanium graphite with radiant amber & copper warmth',
    previewHex: '#f59e0b',
    accentHex: '#f59e0b',
    bgApp: 'bg-[#0c0a08]',
    bgCard: 'bg-[#181410]',
    bgSubtle: 'bg-[#241e17]',
    border: 'border-[#382f24]',
    borderHover: 'hover:border-[#f59e0b]/50',
    textPrimary: 'text-amber-50',
    textMuted: 'text-amber-200/60',
    accentBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    accentHover: 'hover:bg-amber-400',
    accentText: 'text-amber-400',
    accentRing: 'ring-amber-500/40',
    accentGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    activeSpeakerBorder: 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  },
  nordic: {
    id: 'nordic',
    name: 'Daylight White & Yellow (Light Mode)',
    subtitle: 'Crisp, clean white background with warm sunny yellow accents',
    previewHex: '#ffffff',
    accentHex: '#facc15',
    bgApp: 'bg-[#fffdf5]',
    bgCard: 'bg-[#ffffff]',
    bgSubtle: 'bg-[#fef9e7]',
    border: 'border-[#f1e6c4]',
    borderHover: 'hover:border-[#facc15]',
    textPrimary: 'text-slate-900',
    textMuted: 'text-slate-600',
    accentBg: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-white font-semibold',
    accentHover: 'hover:bg-orange-400',
    accentText: 'text-red-600',
    accentRing: 'ring-red-400/50',
    accentGlow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    activeSpeakerBorder: 'border-red-500 ring-2 ring-orange-400/50 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
    isLight: true,
  },
};
