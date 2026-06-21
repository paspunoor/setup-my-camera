import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/hooks';

interface Props {
  children: ReactNode;
  /** Focus-acquired: brackets snap in and glow amber. */
  active?: boolean;
  /** Tone of the idle brackets. */
  tone?: 'hair' | 'amber' | 'ok';
  size?: number; // bracket arm length
  inset?: number; // px the brackets sit inside the box edge
  className?: string;
}

const COLORS: Record<string, string> = {
  hair: 'rgb(var(--hair-2))',
  amber: 'rgb(var(--amber))',
  ok: 'rgb(var(--ok))',
};

/**
 * The signature interaction: corner-bracket framelines that "acquire focus"
 * on the active element — mirroring the camera's subject-recognition box.
 */
export function Frame({
  children,
  active = false,
  tone = 'hair',
  size = 16,
  inset = -1,
  className = '',
}: Props) {
  const reduced = useReducedMotion();
  const color = active ? COLORS.amber : COLORS[tone];

  const corners = [
    { k: 'tl', style: { top: inset, left: inset }, borders: ['borderTop', 'borderLeft'] },
    { k: 'tr', style: { top: inset, right: inset }, borders: ['borderTop', 'borderRight'] },
    { k: 'bl', style: { bottom: inset, left: inset }, borders: ['borderBottom', 'borderLeft'] },
    { k: 'br', style: { bottom: inset, right: inset }, borders: ['borderBottom', 'borderRight'] },
  ] as const;

  // direction each corner travels in when "acquiring"
  const offset: Record<string, { x: number; y: number }> = {
    tl: { x: -6, y: -6 },
    tr: { x: 6, y: -6 },
    bl: { x: -6, y: 6 },
    br: { x: 6, y: 6 },
  };

  return (
    <div className={`relative ${className}`}>
      {corners.map((c) => {
        const b: Record<string, string> = {};
        for (const side of c.borders) b[side] = `1.5px solid ${color}`;
        return (
          <motion.span
            key={c.k}
            aria-hidden
            className="pointer-events-none absolute z-10"
            style={{ width: size, height: size, ...c.style, ...b }}
            initial={false}
            animate={
              reduced
                ? { opacity: active ? 1 : 0.5 }
                : {
                    x: active ? offset[c.k].x : 0,
                    y: active ? offset[c.k].y : 0,
                    opacity: active ? 1 : 0.5,
                  }
            }
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          />
        );
      })}
      {active && !reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -right-px -top-px z-10 h-1.5 w-1.5 rounded-full"
          style={{ background: 'rgb(var(--amber))' }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {children}
    </div>
  );
}
