import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGuide } from '../lib/guide';
import { useSetup } from '../state/store';
import { Breadcrumb } from './primitives/Breadcrumb';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const { allItems } = useGuide();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const setStage = useSetup((s) => s.setStage);
  const checked = useSetup((s) => s.checked);

  useEffect(() => {
    if (open) {
      setQ('');
      // focus after the enter animation
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return allItems
      .filter(({ item, stage }) => {
        const hay = [
          item.name,
          item.value,
          item.why,
          item.alt,
          stage.title,
          ...(item.path ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(term);
      })
      .slice(0, 40);
  }, [q, allItems]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-lift"
            role="dialog"
            aria-label="Search settings"
          >
            <div className="flex items-center gap-3 border-b border-hair/70 px-4 py-3">
              <span className="text-dim">🔍</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search any setting, value, or menu path…"
                className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
              />
              <kbd className="hidden rounded border border-hair px-1.5 py-0.5 text-[10px] text-faint sm:block">
                Esc
              </kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {q.trim() && results.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-faint">
                  No settings match “{q}”.
                </div>
              )}
              {!q.trim() && (
                <div className="px-4 py-8 text-center text-sm text-faint">
                  Type to jump to any of {allItems.length} settings across the guide.
                </div>
              )}
              {results.map(({ item, stage }) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setStage(stage.id);
                    onClose();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-panel2/70"
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] ${
                      checked[item.id] ? 'bg-accent/20 text-accent' : 'border border-hair text-faint'
                    }`}
                  >
                    {checked[item.id] ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">{item.name}</span>
                      {item.value && (
                        <span className="truncate font-mono text-xs text-accent">{item.value}</span>
                      )}
                    </span>
                    {item.path ? (
                      <Breadcrumb path={item.path} className="mt-1" />
                    ) : (
                      <span className="text-xs text-faint">{stage.title}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-faint">{stage.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
