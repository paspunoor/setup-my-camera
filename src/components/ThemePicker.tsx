import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSetup } from '../state/store';
import { THEMES, resolveThemeId } from '../lib/themes';

export function ThemePicker() {
  const theme = useSetup((s) => s.theme);
  const setTheme = useSetup((s) => s.setTheme);
  const current = resolveThemeId(theme);
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose theme"
        aria-expanded={open}
        title="Theme"
        className="grid h-9 w-9 place-items-center rounded-md border border-hair text-dim transition-colors hover:border-faint hover:text-ink"
      >
        <span
          className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/15"
          style={{ background: 'rgb(var(--amber))', boxShadow: '0 0 8px rgb(var(--amber) / 0.6)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="glass absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl p-1.5 shadow-lift"
            role="menu"
          >
            <div className="eyebrow px-2.5 py-1.5 text-faint">Theme</div>
            {THEMES.map((t) => {
              const active = t.id === current;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  role="menuitemradio"
                  aria-checked={active}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    active ? 'bg-amber/[0.1]' : 'hover:bg-panel2/70'
                  }`}
                >
                  {/* swatch */}
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-hair2"
                    style={{ background: t.bg }}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ background: t.accent }} />
                  </span>
                  <span className="flex-1 text-[13px] font-medium text-ink">{t.name}</span>
                  {active && <span className="data text-[11px] text-amber">●</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
