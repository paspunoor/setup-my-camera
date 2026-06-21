import { motion } from 'framer-motion';
import { useReducedMotion } from '../../lib/hooks';

interface Props {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  label?: string;
  /** Render as a non-interactive visual (when the parent is already the button). */
  presentational?: boolean;
}

/**
 * An AF-point lock. Unchecked: an empty focus point with corner ticks.
 * Checked: it "locks" — fills amber, a draw-on check, and a focus-confirm pulse.
 *
 * Set `presentational` when this sits inside another <button> (e.g. an Fn tile),
 * so it renders as a <span> instead of a nested button (invalid + eats clicks).
 */
export function CheckToggle({ checked, onToggle, size = 28, label = 'Confirm', presentational = false }: Props) {
  const reduced = useReducedMotion();
  const arm = Math.max(4, size * 0.26);

  const Wrapper = presentational ? motion.span : motion.button;
  const wrapperProps = presentational
    ? ({ 'aria-hidden': true } as const)
    : ({
        type: 'button' as const,
        onClick: onToggle,
        'aria-pressed': checked,
        'aria-label': label,
        whileTap: reduced ? undefined : { scale: 0.88 },
      } as const);

  return (
    <Wrapper
      {...wrapperProps}
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      {/* idle corner ticks (focus point) */}
      {!checked &&
        (['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <span
            key={c}
            aria-hidden
            className="absolute"
            style={{
              width: arm,
              height: arm,
              top: c[0] === 't' ? 0 : undefined,
              bottom: c[0] === 'b' ? 0 : undefined,
              left: c[1] === 'l' ? 0 : undefined,
              right: c[1] === 'r' ? 0 : undefined,
              borderTop: c[0] === 't' ? '1.5px solid rgb(var(--faint))' : undefined,
              borderBottom: c[0] === 'b' ? '1.5px solid rgb(var(--faint))' : undefined,
              borderLeft: c[1] === 'l' ? '1.5px solid rgb(var(--faint))' : undefined,
              borderRight: c[1] === 'r' ? '1.5px solid rgb(var(--faint))' : undefined,
            }}
          />
        ))}

      {/* locked fill */}
      <motion.span
        className="absolute inset-0 rounded-[3px]"
        initial={false}
        animate={{
          backgroundColor: checked ? 'rgb(var(--amber))' : 'rgba(0,0,0,0)',
          scale: checked && !reduced ? [0.7, 1.12, 1] : checked ? 1 : 0.7,
          opacity: checked ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.2, 0.9, 0.25, 1] }}
      />

      {/* focus-confirm pulse */}
      {checked && !reduced && (
        <motion.span
          key="pulse"
          className="absolute inset-0 rounded-[4px]"
          style={{ boxShadow: '0 0 0 0 rgb(var(--amber) / 0.6)' }}
          initial={{ opacity: 0.9 }}
          animate={{ boxShadow: '0 0 0 10px rgb(var(--amber) / 0)', opacity: 0 }}
          transition={{ duration: 0.55 }}
        />
      )}

      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} className="relative" fill="none">
        <motion.path
          d="M5 12.5 10 17.5 19.5 7"
          stroke="rgb(var(--on-accent))"
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={
            reduced
              ? { duration: 0.01 }
              : { pathLength: { duration: 0.3, ease: 'easeOut' }, opacity: { duration: 0.1 } }
          }
        />
      </svg>
    </Wrapper>
  );
}
