/* The selectable palettes. Token values live in index.css (data-theme blocks);
   these entries drive the picker UI + which data-theme we apply. */

export interface ThemeDef {
  id: string;
  name: string;
  /** Accent + background hex, for the picker swatch only. */
  accent: string;
  bg: string;
  dark: boolean;
}

export const THEMES: ThemeDef[] = [
  /* ---- Dark ---- */
  { id: 'amber-dark', name: 'Obsidian', accent: '#FFAE00', bg: '#0C0A08', dark: true },
  { id: 'mono-dark', name: 'Graphite', accent: '#D2DAE4', bg: '#0E0F11', dark: true },
  { id: 'gold-dark', name: 'Bullion', accent: '#E2B24C', bg: '#100D07', dark: true },
  { id: 'copper-dark', name: 'Copper', accent: '#E28654', bg: '#120C09', dark: true },
  { id: 'crimson-dark', name: 'Inferno', accent: '#FF5E3A', bg: '#120C0B', dark: true },
  { id: 'rose-dark', name: 'Ember', accent: '#FB7185', bg: '#18090E', dark: true },
  { id: 'sunset-dark', name: 'Dusk', accent: '#FF8A65', bg: '#160E1A', dark: true },
  { id: 'green-dark', name: 'Forest', accent: '#35E28C', bg: '#06130E', dark: true },
  { id: 'teal-dark', name: 'Lagoon', accent: '#2DE0CE', bg: '#041618', dark: true },
  { id: 'cyan-dark', name: 'Abyss', accent: '#38BDF8', bg: '#05111C', dark: true },
  { id: 'blueprint-dark', name: 'Blueprint', accent: '#78C4FF', bg: '#081634', dark: true },
  { id: 'violet-dark', name: 'Nebula', accent: '#BA96F8', bg: '#0F0A1E', dark: true },
  { id: 'synth-dark', name: 'Synthwave', accent: '#FF47B3', bg: '#12081E', dark: true },
  /* ---- Light ---- */
  { id: 'amber-light', name: 'Daylight', accent: '#B06800', bg: '#ECE6DB', dark: false },
  { id: 'sepia-light', name: 'Darkroom', accent: '#9E601E', bg: '#EADEC8', dark: false },
  { id: 'rose-light', name: 'Sakura', accent: '#C53A60', bg: '#F4E6EA', dark: false },
  { id: 'green-light', name: 'Meadow', accent: '#168C4E', bg: '#E4EEE4', dark: false },
  { id: 'sky-light', name: 'Sky', accent: '#0E7CC8', bg: '#E0E9F2', dark: false },
  { id: 'slate-light', name: 'Studio', accent: '#2563EB', bg: '#E0E5EB', dark: false },
  { id: 'violet-light', name: 'Lavender', accent: '#7C4CD2', bg: '#EAE6F4', dark: false },
];

export const DEFAULT_THEME = 'amber-dark';

/** Map old persisted values to the new theme ids. */
const LEGACY: Record<string, string> = { dark: 'amber-dark', light: 'amber-light' };

export function resolveThemeId(stored: string | undefined): string {
  if (!stored) return DEFAULT_THEME;
  const mapped = LEGACY[stored] ?? stored;
  return THEMES.some((t) => t.id === mapped) ? mapped : DEFAULT_THEME;
}

export function themeById(id: string): ThemeDef {
  return THEMES.find((t) => t.id === resolveThemeId(id)) ?? THEMES[0];
}
