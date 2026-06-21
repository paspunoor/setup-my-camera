import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { deriveGuide, type DerivedGuide } from './contentUtils';
import { guideFor } from '../content/registry';
import { useSetup } from '../state/store';

/* ============================================================================
   Active-guide context. The selected camera lives in the store; this provider
   resolves it to a validated guide and memoizes everything the UI derives so a
   camera switch re-renders the whole tree against new content.
   ============================================================================ */

const GuideContext = createContext<DerivedGuide | null>(null);

export function GuideProvider({ children }: { children: ReactNode }) {
  const cameraId = useSetup((s) => s.cameraId);
  const value = useMemo(() => deriveGuide(guideFor(cameraId)), [cameraId]);
  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

/** Derived view of the currently-selected camera's guide. */
export function useGuide(): DerivedGuide {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error('useGuide must be used within <GuideProvider>');
  return ctx;
}
