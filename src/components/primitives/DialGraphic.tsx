import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/hooks';

type DialKind = 'mode' | 'smq';

interface Props {
  dial: DialKind;
  position: string;
  size?: number;
}

/* Position → angle (degrees, clockwise from top) on the unrotated disc. */
const MODE_ANGLES: Record<string, number> = {
  P: 0,
  A: 45,
  S: 90,
  M: 135,
  '1': 180,
  '2': 225,
  '3': 270,
  Auto: 315,
};
const MODE_ORDER = ['P', 'A', 'S', 'M', '1', '2', '3', 'Auto'];

const SMQ_ANGLES: Record<string, number> = { Still: -52, Movie: 0, 'S&Q': 52 };
const SMQ_ORDER = ['Still', 'Movie', 'S&Q'];

function polar(cx: number, cy: number, r: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(t), y: cy - r * Math.cos(t) };
}

/** Camera (stills) vs camcorder (movie) glyphs for the Still/Movie/S&Q dial. */
function DialIcon({ kind, cx, cy, color }: { kind: 'still' | 'movie'; cx: number; cy: number; color: string }) {
  const props = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  if (kind === 'still') {
    return (
      <g {...props}>
        <rect x={cx - 7} y={cy - 3.5} width={14} height={10} rx={2.2} />
        <path d={`M ${cx - 3.4} ${cy - 3.5} l 1.2 -2 h 4.4 l 1.2 2`} />
        <circle cx={cx} cy={cy + 1.6} r={2.9} />
      </g>
    );
  }
  return (
    <g {...props}>
      <rect x={cx - 7.5} y={cy - 4} width={11} height={9} rx={1.8} />
      <path d={`M ${cx + 3.5} ${cy - 1.3} L ${cx + 8} ${cy - 4} L ${cx + 8} ${cy + 4} L ${cx + 3.5} ${cy + 1.3} Z`} />
    </g>
  );
}

export function DialGraphic({ dial, position, size = 168 }: Props) {
  const reduced = useReducedMotion();
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;

  const angles = dial === 'mode' ? MODE_ANGLES : SMQ_ANGLES;
  const order = dial === 'mode' ? MODE_ORDER : SMQ_ORDER;
  const target = angles[position] ?? 0;
  const rLabel = dial === 'mode' ? R - 18 : R - 22;
  const tickCount = 48;

  // Two-tone: the Movie position pops with the cool --hud accent.
  const posColor = (key: string) =>
    dial === 'smq' && key === 'Movie' ? 'rgb(var(--hud))' : 'rgb(var(--amber))';
  const activeColor = posColor(position);

  // The disc rotates so the selected position sits at top, under the fixed index.
  const rest = -target;
  const spin = dial === 'mode' ? 42 : 30;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
      <defs>
        <radialGradient id="dialFace" cx="42%" cy="36%" r="75%">
          <stop offset="0%" stopColor="rgb(var(--panel-2))" />
          <stop offset="70%" stopColor="rgb(var(--panel))" />
          <stop offset="100%" stopColor="rgb(var(--void))" />
        </radialGradient>
      </defs>

      {/* ---- the rotating dial disc: turns to bring the selection under the index ---- */}
      <motion.g
        initial={reduced ? { rotate: rest } : { rotate: rest - spin }}
        animate={{ rotate: rest }}
        transition={reduced ? { duration: 0.01 } : { type: 'spring', stiffness: 70, damping: 13, delay: 0.05 }}
        style={{ transformBox: 'view-box', transformOrigin: `${cx}px ${cy}px` }}
      >
        <circle cx={cx} cy={cy} r={R} fill="url(#dialFace)" stroke="rgb(var(--hair))" strokeWidth={2} />
        {Array.from({ length: tickCount }).map((_, i) => {
          const a = (360 / tickCount) * i;
          const p1 = polar(cx, cy, R, a);
          const p2 = polar(cx, cy, R - 5, a);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgb(var(--faint) / 0.45)" strokeWidth={1} />;
        })}

        {order.map((key) => {
          const a = angles[key];
          const p = polar(cx, cy, rLabel, a);
          const isActive = key === position;
          const col = isActive ? posColor(key) : 'rgb(var(--dim))';
          const useIcon = dial === 'smq' && (key === 'Still' || key === 'Movie');
          return (
            <g key={key}>
              {isActive && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={dial === 'mode' ? 13 : 16}
                  fill={activeColor.replace(')', ' / 0.16)')}
                  stroke={activeColor}
                  strokeWidth={1.4}
                  initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 15 }}
                  style={{ transformBox: 'view-box', transformOrigin: `${p.x}px ${p.y}px` }}
                />
              )}
              {/* counter-rotate so labels stay upright while the disc turns */}
              <g transform={`rotate(${target} ${p.x} ${p.y})`}>
                {useIcon ? (
                  <DialIcon kind={key === 'Still' ? 'still' : 'movie'} cx={p.x} cy={p.y} color={col} />
                ) : (
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={dial === 'mode' ? 12 : key === 'S&Q' ? 10 : 11}
                    fontWeight={isActive ? 600 : 500}
                    fontFamily="'IBM Plex Mono', monospace"
                    fill={col}
                  >
                    {key}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </motion.g>

      {/* ---- fixed index marker (the dial turns TO this) ---- */}
      <path
        d={`M ${cx} 1 l 5.5 10 l -11 0 z`}
        fill={activeColor}
        style={{ filter: `drop-shadow(0 0 5px ${activeColor.replace(')', ' / 0.8)')})` }}
      />
      <line x1={cx} y1={11} x2={cx} y2={cy - rLabel - 9} stroke={activeColor.replace(')', ' / 0.35)')} strokeWidth={1} />

      {/* hub */}
      <circle cx={cx} cy={cy} r={dial === 'mode' ? 9 : 8} fill="rgb(var(--panel-2))" stroke="rgb(var(--hair))" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={2.4} fill={activeColor} />
    </svg>
  );
}
