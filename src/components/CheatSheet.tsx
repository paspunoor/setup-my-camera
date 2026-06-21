import { motion } from 'framer-motion';
import { useGuide } from '../lib/guide';
import { useGlobalProgress } from '../lib/hooks';

const SLOT_TONE: Record<string, string> = {
  'in-body': 'text-amber border-amber/40 bg-amber/10',
  card: 'text-corrected border-corrected/40 bg-corrected/10',
  dial: 'text-hud border-hud/40 bg-hud/10',
};

export function CheatSheet() {
  const { guide, scenarioStages, stageById } = useGuide();
  const { done, total, pct } = useGlobalProgress();
  const customStage = stageById('custom-buttons');
  const stillsMap = customStage?.groups?.find((g) => g.id === 'cc-stills')?.items ?? [];
  const movieMap = customStage?.groups?.find((g) => g.id === 'cc-movie')?.items ?? [];

  return (
    <div className="print-area">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[13px] text-dim">
          The camera won’t label your slots — keep this card in the bag.{' '}
          <span className="data text-amber">{Math.round(pct * 100)}%</span> checked ({done}/{total}).
        </p>
        <button onClick={() => window.print()} className="btn btn-accent">
          Print / Save as PDF
        </button>
      </div>

      {/* Header band */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-hair bg-panel/50 p-5">
        <div>
          <div className="eyebrow text-faint">SLOT &amp; CONTROL CARD</div>
          <h2 className="display mt-1 text-2xl text-ink">{guide.meta.body}</h2>
          <p className="data mt-1 text-[11px] text-dim">
            {guide.meta.model} · {guide.meta.firmware}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <div className="eyebrow text-faint">ONE BODY · EIGHT SCENES</div>
          <div className="data mt-1 text-[11px] text-hud">{guide.meta.helpGuide}</div>
        </div>
      </div>

      <div className="eyebrow mb-3 text-faint">REGISTER MAP</div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {scenarioStages.map((stage, i) => {
          const items = stage.groups?.[0]?.items.filter((it) => it.kind === 'setting') ?? [];
          const slot = stage.scenario!;
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-hair bg-panel/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`data rounded border px-2 py-1 text-[13px] font-bold ${SLOT_TONE[slot.storage]}`}>
                    {slot.slot}
                  </span>
                  <span className="display text-[15px] text-ink">{stage.title}</span>
                </div>
                <span className="eyebrow text-faint">
                  {slot.storage === 'in-body' ? 'IN-BODY' : slot.storage === 'card' ? 'CARD · BOTH' : 'DIAL'}
                </span>
              </div>
              <dl className="space-y-1">
                {items.slice(0, 6).map((it) => (
                  <div key={it.id} className="flex justify-between gap-3 text-[11px]">
                    <dt className="shrink-0 text-faint">{it.name}</dt>
                    <dd className="data truncate text-right text-dim">{it.value}</dd>
                  </div>
                ))}
              </dl>
              {slot.fieldNote && (
                <p className="mt-3 border-t border-hair pt-2 text-[11px] italic leading-relaxed text-faint">
                  {slot.fieldNote.split('.')[0]}.
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="eyebrow mb-3 text-faint">CUSTOM BUTTON MAP</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { title: 'STILLS LAYOUT', items: stillsMap },
          { title: 'MOVIE LAYOUT', items: movieMap },
        ].map((col) => (
          <div key={col.title} className="rounded-lg border border-hair bg-panel/40 p-4">
            <h4 className="eyebrow mb-2.5 text-amber">{col.title}</h4>
            <dl className="space-y-1.5">
              {col.items.map((it) => (
                <div key={it.id} className="flex items-baseline justify-between gap-3 text-[11px]">
                  <dt className="data shrink-0 font-semibold text-ink">{it.name}</dt>
                  <dd className="truncate text-right text-dim">{it.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <p className="data mt-8 text-center text-[10px] text-faint">{guide.meta.updated}</p>
    </div>
  );
}
