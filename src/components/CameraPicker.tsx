import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ChevronDown } from 'lucide-react';
import { useSetup } from '../state/store';
import { CAMERAS, cameraById } from '../content/registry';

/**
 * Camera switcher. Lists every camera the registry discovered; switching keeps
 * each camera's progress independent (handled in the store). With one camera
 * installed it still renders as a labelled chip so the platform intent is clear.
 */
export function CameraPicker() {
  const cameraId = useSetup((s) => s.cameraId);
  const setCamera = useSetup((s) => s.setCamera);
  const current = cameraById(cameraId) ?? CAMERAS[0];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!current) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose camera"
        aria-expanded={open}
        title="Camera"
        className="flex h-9 items-center gap-2 rounded-md border border-hair bg-panel/40 px-2.5 text-left transition-colors hover:border-faint"
      >
        <Camera size={15} strokeWidth={1.8} className="text-hud" aria-hidden />
        <span className="data hidden text-[11px] font-semibold tracking-wide text-ink sm:inline">
          {current.name}
        </span>
        <ChevronDown size={11} strokeWidth={2.4} className="text-faint" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="glass absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl p-1.5 shadow-lift"
            role="menu"
          >
            <div className="eyebrow px-2.5 py-1.5 text-faint">Camera</div>
            {CAMERAS.map((c) => {
              const active = c.id === cameraId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setCamera(c.id);
                    setOpen(false);
                  }}
                  role="menuitemradio"
                  aria-checked={active}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    active ? 'bg-amber/[0.1]' : 'hover:bg-panel2/70'
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-hair2 bg-panel2/60">
                    <Camera size={15} strokeWidth={1.7} className={active ? 'text-amber' : 'text-dim'} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{c.name}</span>
                    <span className="data block truncate text-[10px] tracking-wide text-faint">
                      {c.brand} · {c.model}
                    </span>
                  </span>
                  {active && <span className="data text-[11px] text-amber">●</span>}
                </button>
              );
            })}
            <div className="mt-1 border-t border-hair/60 px-2.5 py-2 text-[11px] leading-snug text-faint">
              More cameras are drop-in JSON files. See{' '}
              <span className="data text-dim">content/cameras/README</span>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
