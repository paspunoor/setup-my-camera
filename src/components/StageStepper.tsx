import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useGuide } from '../lib/guide';
import { useSetup } from '../state/store';
import { useStageProgress } from '../lib/hooks';
import type { Stage } from '../content/types';

function sectionFor(stage: Stage): string {
  if (stage.kind === 'scenario') return 'SCENES';
  if (stage.kind === 'delivery' || stage.kind === 'cheatsheet') return 'OUTPUT';
  return 'FOUNDATION';
}

interface RowProps {
  stage: Stage;
  active: boolean;
  ahead: boolean;
  first: boolean;
  last: boolean;
  onSelect: () => void;
}

function StageRow({ stage, active, ahead, first, last, onSelect }: RowProps) {
  const { done, total, complete } = useStageProgress(stage);
  const hasItems = total > 0;

  return (
    <button
      onClick={onSelect}
      aria-current={active ? 'step' : undefined}
      className={`group relative flex w-full items-stretch gap-3 py-1.5 text-left transition-opacity ${
        ahead && !active && !complete ? 'opacity-45 hover:opacity-80' : 'opacity-100'
      }`}
    >
      {/* spine + node */}
      <span className="relative grid w-5 shrink-0 place-items-center">
        <span
          className="absolute left-1/2 -translate-x-1/2 bg-hair2"
          style={{ width: 1, top: first ? '50%' : 0, bottom: last ? '50%' : 0 }}
          aria-hidden
        />
        <span
          className={`relative z-10 h-2.5 w-2.5 rounded-full border transition-all ${
            complete
              ? 'border-amber bg-amber'
              : active
                ? 'border-amber bg-void'
                : 'border-hair2 bg-void'
          }`}
          style={active ? { boxShadow: '0 0 0 4px rgb(var(--amber) / 0.16)' } : undefined}
        >
          {active && (
            <motion.span
              layoutId="rail-node"
              className="absolute inset-[2px] rounded-full bg-amber"
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            />
          )}
        </span>
      </span>

      {/* label */}
      <span className={`min-w-0 flex-1 rounded-md px-2.5 py-1.5 transition-colors ${active ? 'bg-amber/[0.07]' : 'group-hover:bg-panel2/50'}`}>
        <span className="flex items-center gap-2">
          <span className={`data text-[10px] tabular-nums ${active || complete ? 'text-amber' : 'text-faint'}`}>
            {stage.label}
          </span>
          {ahead && !active && !complete && (
            <Lock size={11} strokeWidth={2} className="text-faint" aria-hidden />
          )}
          {hasItems && (
            <span className={`data ml-auto text-[10px] tabular-nums ${complete ? 'text-amber' : 'text-faint'}`}>
              {done}/{total}
            </span>
          )}
        </span>
        <span
          className={`mt-0.5 block truncate text-[13px] font-medium leading-tight ${
            active ? 'text-ink' : complete ? 'text-dim' : 'text-dim'
          }`}
        >
          {stage.title}
        </span>
      </span>
    </button>
  );
}

export function StageStepper({ onNavigate }: { onNavigate?: () => void }) {
  const { stages } = useGuide();
  const currentStageId = useSetup((s) => s.currentStageId);
  const setStage = useSetup((s) => s.setStage);
  const checked = useSetup((s) => s.checked);

  const firstIncomplete = stages.findIndex((st) => {
    const total = (st.groups ?? []).reduce((n, g) => n + g.items.length, 0);
    if (total === 0) return false;
    const done = (st.groups ?? []).reduce(
      (n, g) => n + g.items.reduce((m, it) => (checked[it.id] ? m + 1 : m), 0),
      0,
    );
    return done < total;
  });
  const frontier = firstIncomplete === -1 ? stages.length - 1 : firstIncomplete;

  let lastSection = '';

  return (
    <nav className="flex flex-col" aria-label="Setup stages">
      {stages.map((stage, i) => {
        const section = sectionFor(stage);
        const showHeader = section !== lastSection;
        lastSection = section;
        return (
          <div key={stage.id}>
            {showHeader && (
              <div className="mb-1 mt-3 pl-8 first:mt-0">
                <span className="eyebrow text-faint/70">{section}</span>
              </div>
            )}
            <StageRow
              stage={stage}
              active={stage.id === currentStageId}
              ahead={i > frontier}
              first={i === 0}
              last={i === stages.length - 1}
              onSelect={() => {
                setStage(stage.id);
                onNavigate?.();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        );
      })}
    </nav>
  );
}
