import { AudioLines, Menu, Pause, RotateCcw, Search } from 'lucide-react';
import { useGlobalProgress } from '../lib/hooks';
import { useGuide } from '../lib/guide';
import { useSetup } from '../state/store';
import { BufferMeter } from './primitives/BufferMeter';
import { ApertureMark } from './primitives/ApertureMark';
import { ThemePicker } from './ThemePicker';
import { CameraPicker } from './CameraPicker';

interface Props {
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  onReset: () => void;
}

function IconBtn({
  onClick,
  label,
  children,
  className = '',
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-md border border-hair text-dim transition-colors hover:border-faint hover:text-ink ${className}`}
    >
      {children}
    </button>
  );
}

export function Header({ onOpenSearch, onOpenMenu, onReset }: Props) {
  const { pct, done, total } = useGlobalProgress();
  const { guide } = useGuide();
  const forceReduce = useSetup((s) => s.forceReduceMotion);
  const setForceReduce = useSetup((s) => s.setForceReduceMotion);
  const scenes = guide.stages.filter((s) => s.kind === 'scenario').length;

  return (
    <header className="no-print safe-top sticky top-0 z-40 glass border-b border-hair/70">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2 sm:px-5">
        {/* mobile menu */}
        <button
          onClick={onOpenMenu}
          className="grid h-9 w-9 place-items-center rounded-md border border-hair text-dim hover:text-ink lg:hidden"
          aria-label="Open stage index"
        >
          <Menu size={17} strokeWidth={2} aria-hidden />
        </button>

        {/* identity */}
        <div className="flex min-w-0 items-center gap-2.5">
          <ApertureMark size={28} className="animate-float" />
          <div className="min-w-0 leading-none">
            <div className="display truncate text-[15px] uppercase text-ink">{guide.meta.body} Setup</div>
            <div className="eyebrow mt-1 truncate text-faint">
              {guide.meta.model} · {guide.meta.firmware} ·{' '}
              <span className="text-hud">{scenes} SCENES</span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* live capture-buffer readout */}
        <div className="mr-1 hidden items-center gap-2.5 rounded-md border border-hair/80 bg-panel/50 px-3 py-1.5 sm:flex">
          <span className="eyebrow text-faint">SET</span>
          <BufferMeter pct={pct} />
          <span className="data text-xs font-semibold tabular-nums text-amber">{Math.round(pct * 100)}%</span>
          <span className="data text-[10px] tabular-nums text-faint">
            {done}/{total}
          </span>
        </div>

        <IconBtn onClick={onOpenSearch} label="Search settings ( / )">
          <Search size={16} strokeWidth={2} aria-hidden />
        </IconBtn>
        <button
          onClick={() => setForceReduce(!forceReduce)}
          aria-pressed={forceReduce}
          title={forceReduce ? 'Motion reduced — tap to turn animations on' : 'Full motion on — tap to reduce'}
          className={`hidden h-9 w-9 place-items-center rounded-md border transition-colors sm:grid ${
            forceReduce
              ? 'border-amber/55 bg-amber/[0.12] text-amber'
              : 'border-hair bg-amber/[0.04] text-amber/90 hover:border-faint'
          }`}
        >
          {forceReduce ? (
            <Pause size={16} strokeWidth={2} fill="currentColor" aria-hidden />
          ) : (
            <AudioLines size={16} strokeWidth={2} className="animate-pulse" aria-hidden />
          )}
        </button>
        <CameraPicker />
        <ThemePicker />
        <IconBtn onClick={onReset} label="Reset progress" className="hidden sm:grid hover:!text-alert hover:!border-alert/50">
          <RotateCcw size={15} strokeWidth={2} aria-hidden />
        </IconBtn>
      </div>
    </header>
  );
}
