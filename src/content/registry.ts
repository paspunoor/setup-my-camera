import type { GuideContent } from './types';
import { validateGuide } from './validate';

/* ============================================================================
   Camera registry — the drop-in layer.

   Every *.json file in ./cameras/ is a self-contained camera guide. Adding a
   camera is literally: drop a new validated JSON next to the others. This file
   discovers them at build time (Vite import.meta.glob), validates each one,
   and exposes the list + a loader. No code edit needed to add a camera.

   See ./cameras/README.md for the authoring prompt that generates a new file.
   ============================================================================ */

const modules = import.meta.glob<{ default: unknown }>('./cameras/*.json', {
  eager: true,
});

export interface CameraEntry {
  id: string;
  brand: string;
  model: string;
  name: string;
  default: boolean;
  guide: GuideContent;
}

function buildRegistry(): CameraEntry[] {
  const entries: CameraEntry[] = [];
  for (const [path, mod] of Object.entries(modules)) {
    try {
      const guide = validateGuide(mod.default, path);
      entries.push({
        id: guide.camera.id,
        brand: guide.camera.brand,
        model: guide.camera.model,
        name: guide.camera.name,
        default: Boolean(guide.camera.default),
        guide,
      });
    } catch (err) {
      // A malformed camera file should never take down the whole app —
      // skip it and surface the reason in the console for the author.
      console.error(`[camera-registry] skipping ${path}:`, err);
    }
  }
  // Stable, friendly order: default first, then alphabetical by name.
  entries.sort((a, b) => {
    if (a.default !== b.default) return a.default ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return entries;
}

export const CAMERAS: CameraEntry[] = buildRegistry();

export const DEFAULT_CAMERA_ID: string =
  CAMERAS.find((c) => c.default)?.id ?? CAMERAS[0]?.id ?? 'sony-a7v';

export function cameraById(id: string): CameraEntry | undefined {
  return CAMERAS.find((c) => c.id === id);
}

/** The guide for a camera id, falling back to the default camera. */
export function guideFor(id: string): GuideContent {
  return (cameraById(id) ?? cameraById(DEFAULT_CAMERA_ID) ?? CAMERAS[0]).guide;
}
