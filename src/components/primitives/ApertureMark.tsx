/* The aperture mark, inline so it follows the active theme (the favicon file
   stays static — browsers can't theme it). Iris = accent, tile = panel/hair. */
export function ApertureMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <defs>
        <clipPath id="apx-iris">
          <circle cx="32" cy="32" r="26.8" />
        </clipPath>
        <radialGradient id="apx-bloom" cx="50%" cy="44%" r="60%">
          <stop offset="0%" stopColor="rgb(var(--amber))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgb(var(--amber))" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="1" y="1" width="62" height="62" rx="15" fill="rgb(var(--panel))" stroke="rgb(var(--hair))" />
      <circle cx="32" cy="32" r="22" fill="url(#apx-bloom)" />

      <g clipPath="url(#apx-iris)" stroke="rgb(var(--amber))" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="43.00" y1="32.00" x2="27.62" y2="58.64" />
        <line x1="37.50" y1="41.53" x2="6.74" y2="41.53" />
        <line x1="26.50" y1="41.53" x2="11.12" y2="14.88" />
        <line x1="21.00" y1="32.00" x2="36.38" y2="5.36" />
        <line x1="26.50" y1="22.47" x2="57.26" y2="22.47" />
        <line x1="37.50" y1="22.47" x2="52.88" y2="49.12" />
      </g>

      <circle cx="32" cy="32" r="26.8" stroke="rgb(var(--amber))" strokeWidth="2.3" />
    </svg>
  );
}
