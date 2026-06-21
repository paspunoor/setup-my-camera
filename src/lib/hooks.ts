import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useSetup } from '../state/store';
import { stageItemCount, type FlatItem } from './contentUtils';
import { useGuide } from './guide';
import type { SettingGroup, Stage } from '../content/types';

/** Combine OS prefers-reduced-motion with the user's in-app override. */
export function useReducedMotion(): boolean {
  const force = useSetup((s) => s.forceReduceMotion);
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setOsReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return force || osReduced;
}

/** Global completion across every checkable item in the active guide. */
export function useGlobalProgress() {
  const checked = useSetup((s) => s.checked);
  const { allItems, totalItems } = useGuide();
  const done = allItems.reduce((n, f) => (checked[f.item.id] ? n + 1 : n), 0);
  return { done, total: totalItems, pct: totalItems ? done / totalItems : 0 };
}

/** Completion for a single stage. */
export function useStageProgress(stage: Stage) {
  const checked = useSetup((s) => s.checked);
  const total = stageItemCount(stage);
  const done = (stage.groups ?? []).reduce(
    (n, g) => n + g.items.reduce((m, it) => (checked[it.id] ? m + 1 : m), 0),
    0,
  );
  return { done, total, pct: total ? done / total : 0, complete: total > 0 && done === total };
}

/** Completion for a single group. */
export function groupDone(group: SettingGroup, checked: Record<string, boolean>) {
  const done = group.items.reduce((n, it) => (checked[it.id] ? n + 1 : n), 0);
  return { done, total: group.items.length, complete: done === group.items.length };
}

/** Items grouped by their scenario slot, for the cheat sheet. */
export function scenarioItems(stage: Stage): FlatItem[] {
  return (stage.groups ?? []).flatMap((g) =>
    g.items.map((item) => ({ item, stage, group: g })),
  );
}

/* ---------------------------------------------------------------- */
/* Celebrations                                                      */
/* ---------------------------------------------------------------- */

/** Pull the live theme palette so confetti matches the active theme. */
function themeColors(): string[] {
  try {
    const cs = getComputedStyle(document.documentElement);
    const c = (n: string) => {
      const v = cs.getPropertyValue(n).trim();
      return v ? `rgb(${v})` : '';
    };
    const cols = [c('--amber'), c('--hud'), c('--ok'), c('--info')].filter(Boolean);
    return cols.length ? cols : ['#FFAE00', '#6EBCCC', '#2DDC84'];
  } catch {
    return ['#FFAE00', '#6EBCCC', '#2DDC84'];
  }
}

export function celebrate(kind: 'stage' | 'finale', reduced: boolean) {
  if (reduced) return;
  const ACCENT = themeColors();
  if (kind === 'stage') {
    confetti({
      particleCount: 70,
      spread: 62,
      startVelocity: 38,
      origin: { y: 0.7 },
      colors: ACCENT,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
    return;
  }
  // Finale — a bigger, layered burst.
  const end = Date.now() + 1100;
  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.75 },
      colors: ACCENT,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.75 },
      colors: ACCENT,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  confetti({
    particleCount: 140,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: ACCENT,
    disableForReducedMotion: true,
  });
}
