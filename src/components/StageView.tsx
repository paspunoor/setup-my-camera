import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { SettingGroup, Stage } from '../content/types';
import { useSetup } from '../state/store';
import { useGuide } from '../lib/guide';
import { celebrate, groupDone, useReducedMotion, useStageProgress, useGlobalProgress } from '../lib/hooks';
import { DialGate } from './DialGate';
import { DialStatus } from './DialStatus';
import { SettingCard } from './SettingCard';
import { CheatSheet } from './CheatSheet';
import { StageIcon } from './primitives/StageIcon';

/* -------------------------------------------------------------------- */
/* Group block                                                          */
/* -------------------------------------------------------------------- */
function GroupBlock({ group, unlocked, index }: { group: SettingGroup; unlocked: boolean; index: number }) {
  const reduced = useReducedMotion();
  const checked = useSetup((s) => s.checked);
  const gates = useSetup((s) => s.gates);
  const toggleItem = useSetup((s) => s.toggleItem);
  const ackGate = useSetup((s) => s.ackGate);
  const unackGate = useSetup((s) => s.unackGate);

  const acked = Boolean(gates[group.gate.id]);
  const { done, total, complete } = groupDone(group, checked);
  const firstUnchecked = group.items.find((it) => !checked[it.id])?.id;
  // Movie group → the Shooting breadcrumb shows the video glyph (per dial).
  const isMovie = group.gate.dials.some((d) => d.dial === 'smq' && d.position === 'Movie');

  if (!unlocked) {
    return (
      <div className="relative flex select-none items-center gap-3 rounded-md border border-dashed border-hair px-4 py-5 opacity-45">
        <span className="data text-[10px] tracking-widest text-faint">{String(index + 1).padStart(2, '0')}</span>
        <Lock size={14} strokeWidth={2} className="text-faint" aria-hidden />
        <div className="text-[14px] font-medium text-dim">{group.title}</div>
        <span className="data ml-auto text-[10px] tracking-wider text-faint">LOCKED</span>
      </div>
    );
  }

  const tiles = group.items.filter((i) => i.kind === 'tile');
  const rows = group.items.filter((i) => i.kind !== 'tile');

  return (
    <motion.section layout className="scroll-mt-24">
      <header className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="data text-[11px] tabular-nums text-amber/80">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3 className="display text-[19px] text-ink">{group.title}</h3>
            {group.subtitle && <p className="text-[13px] text-dim">{group.subtitle}</p>}
          </div>
        </div>
        {acked && (
          <span className={`data shrink-0 text-[11px] tabular-nums ${complete ? 'text-amber' : 'text-faint'}`}>
            {done}/{total}
          </span>
        )}
      </header>

      <DialGate gate={group.gate} acked={acked} onAck={() => ackGate(group.gate.id)} onReopen={() => unackGate(group.gate.id)} />

      <AnimatePresence initial={false}>
        {acked && (
          <motion.div
            key="items"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-visible"
          >
            {tiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {tiles.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
                  >
                    <SettingCard item={item} checked={Boolean(checked[item.id])} onToggle={() => toggleItem(item.id)} movie={isMovie} />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {rows.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.045, 0.4), duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <SettingCard
                    item={item}
                    checked={Boolean(checked[item.id])}
                    onToggle={() => toggleItem(item.id)}
                    active={item.id === firstUnchecked}
                    movie={isMovie}
                  />
                </motion.div>
              ))}
            </div>

            {complete && (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 rounded-md border border-amber/30 bg-amber/[0.06] px-4 py-2.5"
              >
                <span className="data text-[10px] tracking-widest text-amber">● COMPLETE</span>
                <span className="text-[13px] text-dim">Section locked in. Next section unlocked.</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/* -------------------------------------------------------------------- */
/* Scenario banner                                                      */
/* -------------------------------------------------------------------- */
function ScenarioBanner({ stage }: { stage: Stage }) {
  const s = stage.scenario!;
  const storageLabel =
    s.storage === 'in-body' ? 'IN-BODY REGISTER'
    : s.storage === 'card' ? 'CARD REGISTER'
    : s.storage === 'preset' ? 'CUSTOM PRESET'
    : 'DIAL POSITION';
  return (
    <div className="relative overflow-hidden rounded-lg border border-hair bg-panel/50 p-5">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-60"
        style={{ background: 'radial-gradient(circle, rgb(var(--amber) / 0.32), rgb(var(--hud) / 0.12) 45%, transparent 72%)' }}
      />
      <div className="relative flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-amber/40 bg-amber/10">
          <span className="display text-xl text-amber">{s.slot}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-0.5 text-faint">
            <span className="text-hud">{storageLabel}</span>
            {s.depth && <span>· {s.depth.toUpperCase()}</span>}
            {s.lens && <span>· {s.lens}</span>}
          </div>
          <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-dim">{s.tagline}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Rich blocks (intro + delivery)                                       */
/* -------------------------------------------------------------------- */
function RichBlocks({ stage }: { stage: Stage }) {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-col gap-7">
      {(stage.blocks ?? []).map((block, i) => (
        <motion.div
          key={i}
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.5 }}
          className="border-l border-hair pl-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="data text-[11px] tabular-nums text-amber/70">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="display text-xl text-ink">{block.heading}</h3>
          </div>
          <div className="space-y-2.5">
            {block.body.map((line, j) =>
              line.startsWith('•') ? (
                <div key={j} className="flex gap-2.5 text-[14px] leading-relaxed text-dim">
                  <span className="data mt-0.5 shrink-0 text-amber">▸</span>
                  <span>{line.replace(/^•\s*/, '')}</span>
                </div>
              ) : (
                <p key={j} className="max-w-2xl text-[14px] leading-relaxed text-dim">
                  {line}
                </p>
              ),
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Stage view                                                           */
/* -------------------------------------------------------------------- */
export function StageView({ stage }: { stage: Stage }) {
  const reduced = useReducedMotion();
  const { stages } = useGuide();
  const setStage = useSetup((s) => s.setStage);
  const checked = useSetup((s) => s.checked);
  const { complete: stageComplete } = useStageProgress(stage);
  const { pct: globalPct } = useGlobalProgress();

  const idx = stages.findIndex((s) => s.id === stage.id);
  const prev = stages[idx - 1];
  const next = stages[idx + 1];

  const groups = stage.groups ?? [];
  const groupComplete = groups.map((g) => groupDone(g, checked).complete);
  const unlocked = groups.map((_, i) => i === 0 || groupComplete[i - 1]);

  // Track which group is currently scrolled into view, to drive the dial HUD.
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(groups[0]?.id);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const els = Array.from(root.querySelectorAll<HTMLElement>('[data-group-id]'));
      if (!els.length) return;
      const line = 140; // just under the sticky header
      let best: string | undefined;
      let bestTop = -Infinity;
      for (const el of els) {
        const top = el.getBoundingClientRect().top;
        if (top - line <= 0 && top > bestTop) {
          bestTop = top;
          best = el.dataset.groupId;
        }
      }
      if (!best) best = els[0].dataset.groupId;
      setActiveGroupId((prev) => (prev === best ? prev : best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stage.id, groups.length]);

  const dialStage = stage.kind === 'settings' || stage.kind === 'scenario';
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? groups[0];
  const hudDials = dialStage ? activeGroup?.gate.dials ?? [] : [];

  const prevStageComplete = useRef(stageComplete);
  const prevGlobal = useRef(globalPct);
  useEffect(() => {
    if (stageComplete && !prevStageComplete.current && globalPct < 1) celebrate('stage', reduced);
    prevStageComplete.current = stageComplete;
  }, [stageComplete, globalPct, reduced]);
  useEffect(() => {
    if (globalPct >= 1 && prevGlobal.current < 1) celebrate('finale', reduced);
    prevGlobal.current = globalPct;
  }, [globalPct, reduced]);

  const isIntro = stage.kind === 'intro';

  return (
    <motion.div
      ref={rootRef}
      key={stage.id}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="mx-auto w-full max-w-3xl"
    >
      {hudDials.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(<DialStatus dials={hudDials} />, document.body)}

      {/* Stage header */}
      <div className="mb-7">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-hud/30 bg-hud/[0.08] text-hud">
            <StageIcon name={stage.icon} className="h-4 w-4" />
          </span>
          <span className="eyebrow text-amber">{stage.label}</span>
          <span className="h-3 w-px bg-hair2" />
          <span className="eyebrow text-faint">{stage.subtitle}</span>
        </div>
        <h1 className="display text-[34px] text-ink sm:text-[46px]">{stage.title}</h1>
        {stage.blurb && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dim">{stage.blurb}</p>}

        {isIntro && stage.stats && stage.stats.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-hair bg-hair sm:grid-cols-6">
            {stage.stats.map((s) => (
              <div key={s.label} className="bg-panel px-3 py-3">
                <div className="display text-lg text-amber">{s.value}</div>
                <div className="eyebrow mt-1 text-faint">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body by kind */}
      {stage.kind === 'cheatsheet' && <CheatSheet />}
      {(isIntro || stage.kind === 'delivery') && <RichBlocks stage={stage} />}

      {(stage.kind === 'settings' || stage.kind === 'scenario') && (
        <div className="flex flex-col gap-8">
          {stage.kind === 'scenario' && <ScenarioBanner stage={stage} />}
          {groups.map((g, i) => (
            <div key={g.id} data-group-id={g.id}>
              <GroupBlock group={g} unlocked={unlocked[i]} index={i} />
            </div>
          ))}

          {stage.kind === 'scenario' && stage.scenario?.fieldNote && stageComplete && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-amber/30 bg-amber/[0.06] p-5"
            >
              <div className="eyebrow mb-2 text-amber">▸ IN THE FIELD</div>
              <p className="text-[13px] leading-relaxed text-dim">{stage.scenario.fieldNote}</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Footer nav */}
      <div className="mt-12 flex items-center justify-between gap-3 border-t border-hair/70 pt-6">
        {prev ? (
          <button
            onClick={() => {
              setStage(prev.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn btn-ghost"
          >
            <span aria-hidden>←</span>
            <span className="hidden max-w-[40vw] truncate sm:inline">{prev.title}</span>
            <span className="sm:hidden">Back</span>
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            onClick={() => {
              setStage(next.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`btn ${isIntro || stageComplete ? 'btn-accent' : 'btn-ghost'}`}
          >
            <span className="max-w-[40vw] truncate">{isIntro ? 'Begin setup' : next.title}</span>
            <span aria-hidden>→</span>
          </button>
        ) : (
          <span />
        )}
      </div>
    </motion.div>
  );
}
