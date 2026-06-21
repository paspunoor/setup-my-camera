import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, Video } from 'lucide-react';
import type { DialGate as DialGateType } from '../content/types';
import { DialGraphic } from './primitives/DialGraphic';
import { Frame } from './primitives/Frame';
import { useReducedMotion } from '../lib/hooks';

interface Props {
  gate: DialGateType;
  acked: boolean;
  onAck: () => void;
  onReopen: () => void;
}

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Render a dial's target: Still/Movie as glyphs, everything else (S&Q, M, A…) as text. */
function DialPosition({ dial, position }: { dial: 'mode' | 'smq'; position: string }) {
  if (dial === 'smq' && position === 'Still') {
    return <Camera size={15} strokeWidth={1.8} aria-label="Still" role="img" />;
  }
  if (dial === 'smq' && position === 'Movie') {
    return <Video size={15} strokeWidth={1.8} aria-label="Movie" role="img" />;
  }
  return <span className="data text-[12px]">{position}</span>;
}

export function DialGate({ gate, acked, onAck, onReopen }: Props) {
  const reduced = useReducedMotion();
  // Some cameras (e.g. GoPro) have no physical dials — the gate is still a
  // "get into the right mode" acknowledge step, just without dial graphics.
  const hasDials = gate.dials.length > 0;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {acked ? (
        <motion.div
          key="bar"
          initial={reduced ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex items-center justify-between gap-3 rounded-md border border-hair/70 bg-panel/30 px-4 py-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-[3px] bg-amber" style={{ color: 'rgb(var(--on-accent))' }}>
              <Check size={13} strokeWidth={3} aria-hidden />
            </span>
            <div className="flex items-center gap-2 text-ink">
              <span className="data text-[10px] tracking-widest text-faint">{hasDials ? 'DIALS SET' : 'READY'}</span>
              {hasDials && (
                <span className="flex items-center gap-1.5">
                  {gate.dials.map((d, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-faint/70" aria-hidden>·</span>}
                      <DialPosition dial={d.dial} position={d.position} />
                    </span>
                  ))}
                </span>
              )}
              {!hasDials && gate.saveTo && <span className="data text-[12px]">{gate.saveTo}</span>}
            </div>
          </div>
          <button onClick={onReopen} className="data text-[10px] uppercase tracking-wider text-faint transition-colors hover:text-ink">
            adjust
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="panel"
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="overflow-hidden"
        >
          <Frame active tone="amber" size={22} inset={2}>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="gate-breathe relative overflow-hidden rounded-lg border border-amber/25 bg-panel/70 p-5 sm:p-7"
            >
        {/* scan-line shimmer */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--amber) / 0.6), transparent)' }}
            initial={{ top: '0%' }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* dials */}
          {hasDials && (
          <div className="flex shrink-0 items-center justify-center gap-4">
            {gate.dials.map((d, i) => (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 120, damping: 14 }}
                className="flex flex-col items-center gap-2"
              >
                <DialGraphic dial={d.dial} position={d.position} size={d.dial === 'mode' ? 150 : 130} />
                {d.dial === 'mode' ? (
                  <span className="eyebrow text-faint">MODE DIAL</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-faint" aria-label="Still / Movie / S&Q dial">
                    <Camera size={15} strokeWidth={1.7} aria-hidden />
                    <span className="text-hair2" aria-hidden>·</span>
                    <Video size={15} strokeWidth={1.7} aria-hidden />
                    <span className="text-hair2" aria-hidden>·</span>
                    <span className="data text-[10px] tracking-wider">S&amp;Q</span>
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          )}

          {/* copy */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-[recblink_1.4s_steps(1)_infinite] rounded-full bg-amber" />
              <span className="eyebrow text-amber">{hasDials ? 'ALIGN DIALS' : 'GET SET'}</span>
            </div>
            <h3 className="display text-2xl text-ink sm:text-[26px]">{gate.headline}</h3>
            {gate.detail && <p className="mt-2 text-[13px] leading-relaxed text-dim">{gate.detail}</p>}

            <ul className="mt-4 space-y-1.5">
              {gate.dials.map((d, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-ink">
                  <span className="data text-[10px] text-amber">▸</span>
                  {d.label}
                </li>
              ))}
            </ul>

            {gate.saveTo && (
              <div className="readout mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium">
                <span>WRITE TARGET</span>
                <span className="font-bold">{gate.saveTo}</span>
              </div>
            )}
            {gate.note && <p className="mt-3 text-[12px] italic leading-relaxed text-faint">{gate.note}</p>}

            <motion.button
              whileTap={reduced ? undefined : { scale: 0.98 }}
              onClick={onAck}
              className="btn btn-accent mt-5 w-full sm:w-auto"
            >
              <span>{hasDials ? 'Dials aligned — unlock settings' : 'Got it — unlock settings'}</span>
              <span aria-hidden>→</span>
            </motion.button>
          </div>
            </div>
            </motion.div>
          </Frame>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
