import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_CAMERA_ID } from '../content/registry';

/** Per-camera progress. The active camera's slice is mirrored at the top level. */
interface CameraProgress {
  checked: Record<string, boolean>;
  gates: Record<string, boolean>;
  currentStageId: string;
}

const freshProgress = (): CameraProgress => ({
  checked: {},
  gates: {},
  currentStageId: 'intro',
});

interface SetupState {
  /** Selected camera id (see content/registry). */
  cameraId: string;
  /** Map of item id -> checked, for the ACTIVE camera. */
  checked: Record<string, boolean>;
  /** Map of dial-gate id -> acknowledged, for the ACTIVE camera. */
  gates: Record<string, boolean>;
  /** Last stage the user was on (resume point), for the ACTIVE camera. */
  currentStageId: string;
  /** Saved progress for every camera EXCEPT the active one. */
  archive: Record<string, CameraProgress>;
  /** Selected theme id (see lib/themes). Global, not per-camera. */
  theme: string;
  /** User override to force-reduce motion regardless of OS setting. Global. */
  forceReduceMotion: boolean;

  toggleItem: (id: string) => void;
  setItems: (ids: string[], value: boolean) => void;
  ackGate: (id: string) => void;
  unackGate: (id: string) => void;
  setStage: (id: string) => void;
  setCamera: (id: string) => void;
  setTheme: (id: string) => void;
  setForceReduceMotion: (v: boolean) => void;
  resetAll: () => void;
}

export const useSetup = create<SetupState>()(
  persist(
    (set) => ({
      cameraId: DEFAULT_CAMERA_ID,
      checked: {},
      gates: {},
      currentStageId: 'intro',
      archive: {},
      theme: 'amber-dark',
      forceReduceMotion: false,

      toggleItem: (id) =>
        set((s) => {
          const next = { ...s.checked };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { checked: next };
        }),

      setItems: (ids, value) =>
        set((s) => {
          const next = { ...s.checked };
          for (const id of ids) {
            if (value) next[id] = true;
            else delete next[id];
          }
          return { checked: next };
        }),

      ackGate: (id) => set((s) => ({ gates: { ...s.gates, [id]: true } })),
      unackGate: (id) =>
        set((s) => {
          const next = { ...s.gates };
          delete next[id];
          return { gates: next };
        }),

      setStage: (id) => set({ currentStageId: id }),

      // Switch cameras: stash the active slice into the archive, restore the
      // target camera's slice (or a fresh one). Progress stays independent.
      setCamera: (id) =>
        set((s) => {
          if (id === s.cameraId) return {};
          const archive = {
            ...s.archive,
            [s.cameraId]: {
              checked: s.checked,
              gates: s.gates,
              currentStageId: s.currentStageId,
            },
          };
          const restored = archive[id] ?? freshProgress();
          delete archive[id];
          return {
            cameraId: id,
            archive,
            checked: restored.checked,
            gates: restored.gates,
            currentStageId: restored.currentStageId,
          };
        }),

      setTheme: (theme) => set({ theme }),
      setForceReduceMotion: (forceReduceMotion) => set({ forceReduceMotion }),

      // Reset only the active camera's progress.
      resetAll: () => set({ checked: {}, gates: {}, currentStageId: 'intro' }),
    }),
    {
      name: 'a7v-setup-v1',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // Only persist user data — never the action functions.
      partialize: (s) => ({
        cameraId: s.cameraId,
        checked: s.checked,
        gates: s.gates,
        currentStageId: s.currentStageId,
        archive: s.archive,
        theme: s.theme,
        forceReduceMotion: s.forceReduceMotion,
      }),
      // Merge persisted data over fresh defaults so new fields are never undefined.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SetupState>),
      }),
    },
  ),
);
