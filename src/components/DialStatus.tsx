import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Video } from 'lucide-react';
import type { DialInstruction } from '../content/types';
import { useReducedMotion } from '../lib/hooks';

function polar(cx: number, cy: number, r: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(t), y: cy - r * Math.cos(t) };
}

/**
 * A compact dial graphic for the always-on HUD: just the instrument face, a
 * tick ring, and the value upright in the centre — no pointer/index marks.
 * It breathes very gently so it reads as live without pulling the eye.
 */
function MiniDial({ dial, position, size = 50 }: { dial: 'mode' | 'smq'; position: string; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 2;
  const uid = `${dial}-${position}`.replace(/[^a-z0-9-]/gi, '');
  const tickN = 24;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
        <defs>
          <radialGradient id={`mf-${uid}`} cx="42%" cy="34%" r="78%">
            <stop offset="0%" stopColor="rgb(var(--panel-2))" />
            <stop offset="72%" stopColor="rgb(var(--panel))" />
            <stop offset="100%" stopColor="rgb(var(--void))" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={R} fill={`url(#mf-${uid})`} stroke="rgb(var(--hair))" strokeWidth={1.2} />

        {/* tick ring */}
        {Array.from({ length: tickN }).map((_, i) => {
          const a = (360 / tickN) * i;
          const p1 = polar(cx, cy, R - 0.5, a);
          const p2 = polar(cx, cy, R - size * 0.08, a);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgb(var(--faint) / 0.4)" strokeWidth={0.8} />;
        })}
      </svg>

      {/* upright centre readout — value or capture glyph */}
      <div className="absolute inset-0 grid place-items-center">
        {dial === 'smq' ? (
          position === 'Movie' ? (
            <Video size={size * 0.36} strokeWidth={2} className="text-hud" aria-label="Movie" />
          ) : position === 'Still' ? (
            <Camera size={size * 0.36} strokeWidth={2} className="text-amber" aria-label="Still" />
          ) : (
            <span className="data font-bold leading-none text-amber" style={{ fontSize: size * 0.2 }}>S&amp;Q</span>
          )
        ) : (
          <span className="data font-bold leading-none text-amber" style={{ fontSize: size * 0.34 }}>{position}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Always-on dial reminder, pinned to the corner. Shows only the dials the
 * current section requires — two, one, or none — animating them in/out and
 * swapping the value when you move between sections.
 */
export function DialStatus({ dials }: { dials: DialInstruction[] }) {
  const reduced = useReducedMotion();
  if (!dials.length) return null;

  return (
    <div className="no-print pointer-events-none fixed bottom-4 right-3 z-30 sm:bottom-5 sm:right-5">
      <motion.div
        layout
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="glass pointer-events-auto relative flex items-center gap-1.5 overflow-hidden rounded-2xl border border-hair/70 px-2 py-1.5 shadow-lift"
      >
        {/* soft amber haze that breathes inside the pill */}
        {!reduced && (
          <span
            aria-hidden
            className="pill-haze pointer-events-none absolute inset-0 z-0"
            style={{ background: 'radial-gradient(ellipse 92% 112% at 50% 50%, transparent 38%, rgb(var(--amber) / 0.55) 100%)' }}
          />
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          {dials.map((d) => (
            <motion.div
              key={`${d.dial}:${d.position}`}
              layout
              initial={reduced ? false : { opacity: 0, scale: 0.5, filter: 'blur(3px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5, filter: 'blur(3px)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative"
            >
              <MiniDial dial={d.dial} position={d.position} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
