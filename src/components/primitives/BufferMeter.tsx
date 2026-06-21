import { motion } from 'framer-motion';

interface Props {
  pct: number; // 0..1
  segments?: number;
  className?: string;
}

/** A segmented capture-buffer indicator — fills amber like a burst buffer. */
export function BufferMeter({ pct, segments = 14, className = '' }: Props) {
  const filled = pct * segments;
  return (
    <div className={`flex items-center gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: segments }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, filled - i));
        return (
          <div
            key={i}
            className="h-3 w-[3px] overflow-hidden rounded-[1px]"
            style={{ background: 'rgb(var(--hair-2) / 0.7)' }}
          >
            <motion.div
              className="h-full w-full origin-bottom"
              style={{ background: 'rgb(var(--amber))', boxShadow: '0 0 6px rgb(var(--amber) / 0.6)' }}
              initial={false}
              animate={{ scaleY: fill }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.01 }}
            />
          </div>
        );
      })}
    </div>
  );
}
