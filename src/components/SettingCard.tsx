import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Item } from '../content/types';
import { CheckToggle } from './primitives/CheckToggle';
import { Breadcrumb } from './primitives/Breadcrumb';
import { Frame } from './primitives/Frame';
import { useReducedMotion } from '../lib/hooks';

interface Props {
  item: Item;
  checked: boolean;
  onToggle: () => void;
  /** This is the next un-done step — gets the AF focus frame. */
  active?: boolean;
  /** Group is a movie group — the Shooting breadcrumb shows the video glyph. */
  movie?: boolean;
}

/** DEFAULT — recommended value already matches the camera's factory default. */
function DefaultBadge() {
  return (
    <span
      className="data inline-flex items-center gap-1 rounded border border-hud/35 bg-hud/[0.08] px-1.5 py-[3px] text-[8.5px] font-semibold uppercase tracking-widest text-hud"
      title="This is the camera's factory default — confirm it, nothing to change"
    >
      <Check size={9} strokeWidth={3} aria-hidden />
      Default
    </span>
  );
}

export function SettingCard({ item, checked, onToggle, active = false, movie = false }: Props) {
  const reduced = useReducedMotion();
  const hasDetails = Boolean(item.why || item.example || item.alt || item.note);
  const [open, setOpen] = useState(false);

  /* ---- Tile: Fn / My-Menu chip ---- */
  if (item.kind === 'tile') {
    return (
      <button
        onClick={onToggle}
        aria-pressed={checked}
        className={`group flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left transition-colors ${
          checked ? 'border-amber/45 bg-amber/[0.07]' : 'border-hair bg-panel/40 hover:border-faint'
        }`}
      >
        <span className={`text-[13px] font-medium leading-tight ${checked ? 'text-ink' : 'text-dim'}`}>
          {item.name}
        </span>
        <CheckToggle checked={checked} onToggle={onToggle} size={20} label={`Confirm ${item.name}`} presentational />
      </button>
    );
  }

  /* ---- Save / write-to-register step ---- */
  if (item.kind === 'save') {
    return (
      <Frame active={!checked} tone="amber" size={20} inset={-1}>
        <div
          className={`relative overflow-hidden rounded-lg border px-5 py-4 transition-colors ${
            checked ? 'border-amber/55 bg-amber/[0.1]' : 'border-amber/30 bg-panel/60'
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="data mt-0.5 text-[11px] font-semibold tracking-widest text-amber">WRITE</span>
            <div className="flex-1">
              <h4 className="display text-[17px] text-ink">{item.name}</h4>
              {item.path && <Breadcrumb path={item.path} movie={movie} className="mt-2" />}
              {item.value && (
                <div className="readout mt-3 inline-block px-2.5 py-1.5 text-[13px] font-semibold">
                  {item.value}
                </div>
              )}
              {item.why && <p className="mt-3 text-[13px] leading-relaxed text-dim">{item.why}</p>}
            </div>
            <CheckToggle checked={checked} onToggle={onToggle} size={34} label={`Confirm ${item.name}`} />
          </div>
        </div>
      </Frame>
    );
  }

  /* ---- Control assignment (custom keys) ---- */
  if (item.kind === 'control') {
    return (
      <div
        className={`flex items-center gap-3 rounded-md border px-3.5 py-3 transition-colors ${
          checked ? 'border-amber/35 bg-amber/[0.05]' : 'border-hair bg-panel/40'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="data rounded border border-hair2 bg-panel2 px-1.5 py-0.5 text-[11px] font-semibold text-ink">
              {item.name}
            </span>
            <span className="text-faint" aria-hidden>→</span>
            <span className="data text-[13px] font-medium text-amber">{item.value}</span>
          </div>
          {item.why && <p className="mt-1.5 text-[12px] leading-relaxed text-dim">{item.why}</p>}
        </div>
        <CheckToggle checked={checked} onToggle={onToggle} size={22} label={`Confirm ${item.name}`} />
      </div>
    );
  }

  /* ---- Full setting data-row ---- */
  return (
    <div
      className={`relative overflow-hidden rounded-md border-l-2 transition-colors duration-300 ${
        checked
          ? 'border-l-amber border-y border-r border-y-hair/60 border-r-hair/60 bg-amber/[0.04]'
          : active
            ? 'guide-active border-l-[3px] border-l-amber border-y border-r border-amber/45 bg-amber/[0.06]'
            : 'border-l-hair2 border-y border-r border-y-hair/70 border-r-hair/70 bg-panel/35 hover:border-l-faint hover:bg-panel/55'
      }`}
    >
        {/* active cue: a soft light travelling down the left rail */}
      {active && !checked && (
        <span
          aria-hidden
          className="guide-scan pointer-events-none absolute left-0 top-0 z-10 w-[3px] rounded-full"
          style={{
            height: '45%',
            background: 'linear-gradient(to bottom, transparent, rgb(var(--amber)), transparent)',
          }}
        />
      )}
      <div className="flex items-start gap-3.5 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h4 className="text-[15px] font-semibold leading-snug text-ink">{item.name}</h4>
              {item.isDefault && <DefaultBadge />}
              {checked && <span className="data text-[9px] font-semibold tracking-widest text-amber">● SET</span>}
            </div>

            {item.path && <Breadcrumb path={item.path} movie={movie} className="mt-2" />}

            {item.value && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="data text-[9px] tracking-widest text-faint">SET</span>
                <span className="readout px-2.5 py-1 text-[13px] font-semibold">{item.value}</span>
              </div>
            )}

            {hasDetails && (
              <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber/90 hover:text-amber"
              >
                <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>›</motion.span>
                {open ? 'Hide' : item.alt ? 'Why · alternatives' : 'Why this'}
              </button>
            )}

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="d"
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2.5 border-l border-hair pl-3.5">
                    {item.why && <p className="text-[13px] leading-relaxed text-dim">{item.why}</p>}
                    {item.example && (
                      <p className="text-[13px] leading-relaxed text-dim">
                        <span className="data text-[10px] uppercase tracking-wider text-hud">e.g. </span>
                        {item.example}
                      </p>
                    )}
                    {item.alt && (
                      <p className="rounded border-l-2 border-hair2 bg-panel2/40 py-1.5 pl-3 pr-2 text-[13px] leading-relaxed text-dim">
                        <span className="data text-[10px] uppercase tracking-wider text-faint">Alternative · </span>
                        {item.alt}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-[12px] italic leading-relaxed text-faint">{item.note}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <CheckToggle checked={checked} onToggle={onToggle} size={28} label={`Confirm ${item.name}`} />
        </div>
    </div>
  );
}
