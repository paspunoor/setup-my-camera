import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TriangleAlert, X } from 'lucide-react';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { StageStepper } from './components/StageStepper';
import { StageView } from './components/StageView';
import { SearchOverlay } from './components/SearchOverlay';
import { BufferMeter } from './components/primitives/BufferMeter';
import { useSetup } from './state/store';
import { GuideProvider, useGuide } from './lib/guide';
import { useGlobalProgress } from './lib/hooks';
import { themeById } from './lib/themes';

function SidebarPanel({ onGoCheat }: { onGoCheat: () => void }) {
  const { done, total, pct } = useGlobalProgress();
  const complete = pct >= 1;
  return (
    <div className="panel mb-4 p-4">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow text-faint">{complete ? 'SETUP LOCKED' : 'SETUP PROGRESS'}</span>
        <span className="data text-[11px] tabular-nums text-amber">
          {done}/{total}
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="display text-3xl text-ink">{Math.round(pct * 100)}</span>
        <span className="display text-base text-faint">%</span>
      </div>
      <BufferMeter pct={pct} segments={22} className="mt-2.5" />
      {complete && (
        <button onClick={onGoCheat} className="btn btn-accent mt-3.5 w-full text-xs">
          View Cheat Sheet →
        </button>
      )}
    </div>
  );
}

function ResetConfirm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const resetAll = useSetup((s) => s.resetAll);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass relative w-full max-w-sm rounded-2xl p-6 text-center shadow-lift"
            role="dialog"
            aria-label="Reset progress"
          >
            <div className="mb-2 grid place-items-center"><TriangleAlert className="h-8 w-8 text-alert" strokeWidth={1.8} aria-hidden /></div>
            <h3 className="font-display text-lg font-semibold text-ink">Reset all progress?</h3>
            <p className="mt-2 text-sm text-dim">
              This clears every checked setting, acknowledged dial, and your resume point. This can’t be
              undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={onClose} className="btn btn-ghost flex-1">
                Keep my progress
              </button>
              <button
                onClick={() => {
                  resetAll();
                  onClose();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn flex-1"
                style={{ background: 'rgb(var(--alert))', color: '#fff' }}
              >
                Reset
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <GuideProvider>
      <AppShell />
    </GuideProvider>
  );
}

function AppShell() {
  const { stageById } = useGuide();
  const currentStageId = useSetup((s) => s.currentStageId);
  const setStage = useSetup((s) => s.setStage);
  const theme = useSetup((s) => s.theme);
  const forceReduce = useSetup((s) => s.forceReduceMotion);

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const stage = stageById(currentStageId) ?? stageById('intro')!;

  // apply theme to <html> via data-theme; set color-scheme for native controls
  useEffect(() => {
    const t = themeById(theme);
    const el = document.documentElement;
    el.dataset.theme = t.id;
    el.style.colorScheme = t.dark ? 'dark' : 'light';
  }, [theme]);

  // The motion-stop toggle gates CSS animations too (framer is gated in JS).
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = forceReduce ? 'on' : 'off';
  }, [forceReduce]);

  // global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative min-h-[100dvh]">
      <Background />
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onReset={() => setResetOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-[1400px] gap-7 px-3 sm:px-5">
        {/* desktop sidebar */}
        <aside className="no-print sticky top-[56px] hidden h-[calc(100dvh-56px)] w-72 shrink-0 overflow-y-auto border-r border-hair/60 py-6 pr-3 lg:block">
          <SidebarPanel onGoCheat={() => setStage('cheatsheet')} />
          <StageStepper />
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 py-6 sm:py-10">
          <AnimatePresence mode="wait">
            <StageView key={stage.id} stage={stage} />
          </AnimatePresence>
        </main>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-hidden />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="safe-top absolute left-0 top-0 h-full w-[84%] max-w-xs overflow-y-auto border-r border-hair bg-panel p-4 shadow-lift"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow text-faint">STAGE INDEX</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-hair text-dim"
                  aria-label="Close menu"
                >
                  <X size={15} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <SidebarPanel
                onGoCheat={() => {
                  setStage('cheatsheet');
                  setMenuOpen(false);
                }}
              />
              <StageStepper onNavigate={() => setMenuOpen(false)} />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setResetOpen(true);
                }}
                className="btn btn-ghost mt-4 w-full text-xs"
              >
                Reset all progress
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ResetConfirm open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
