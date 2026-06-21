import { motion } from 'framer-motion';

interface Props {
  pct: number; // 0..1
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
}

/** A precise instrument dial-gauge that fills with eased motion. */
export function ProgressRing({
  pct,
  size = 92,
  stroke = 6,
  showLabel = true,
  label,
  sublabel,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--hair-2) / 0.7)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--amber))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ filter: 'drop-shadow(0 0 5px rgb(var(--amber) / 0.55))' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 grid place-items-center text-center leading-none">
          <div>
            <div className="data font-semibold tabular-nums text-ink" style={{ fontSize: Math.max(10, size * 0.2) }}>
              {label ?? `${Math.round(clamped * 100)}`}
            </div>
            {sublabel && size >= 70 && <div className="eyebrow mt-1 text-faint">{sublabel}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
