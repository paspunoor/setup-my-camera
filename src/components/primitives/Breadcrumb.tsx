import type { ComponentType } from 'react';
import {
  Briefcase,
  Camera,
  Focus,
  Globe,
  House,
  SquarePlay,
  Star,
  Video,
} from 'lucide-react';

interface Props {
  path: string[];
  /** When true, the Shooting tab shows the video glyph (movie groups). */
  movie?: boolean;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TabGlyph = ComponentType<any>;

/** Exposure-compensation glyph: a square split by a diagonal, + above, − below. */
function ExposureIcon({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M19 5 5 19" />
      {/* plus — upper triangle */}
      <path d="M9 6.5v3.4M7.3 8.2h3.4" />
      {/* minus — lower triangle */}
      <path d="M13.3 15.8h3.4" />
    </svg>
  );
}

/* Sony menu-tab → glyph, for the FIRST breadcrumb segment. */
function tabIcon(tab: string, movie: boolean): TabGlyph | null {
  switch (tab) {
    case 'Shooting':
      return movie ? Video : Camera;
    case 'Exposure/Color':
      return ExposureIcon;
    case 'Focus':
      return Focus;
    case 'Setup':
      return Briefcase; // suitcase
    case 'My Menu':
      return Star;
    case 'Main':
      return House;
    case 'Network':
      return Globe;
    case 'Playback':
      return SquarePlay;
    default:
      return null;
  }
}

/** Menu path as instrument breadcrumb segments, with the tab icon up front. */
export function Breadcrumb({ path, movie = false, className = '' }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-x-1 gap-y-1 ${className}`}>
      {path.map((seg, i) => {
        const Icon = i === 0 ? tabIcon(seg, movie) : null;
        return (
          <span key={i} className="flex items-center gap-1">
            {Icon && <Icon className="mr-0.5 h-3.5 w-3.5 text-hud" strokeWidth={2} aria-hidden />}
            <span className="crumb uppercase tracking-wide">{seg}</span>
            {i < path.length - 1 && (
              <span className="text-faint/70 text-[10px]" aria-hidden>
                ›
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
