import type { GuideContent, Item, SettingGroup, Stage } from '../content/types';

/** Every checkable item across a guide, with breadcrumbs of context. */
export interface FlatItem {
  item: Item;
  stage: Stage;
  group: SettingGroup;
}

/** Count of checkable items in a stage. */
export const stageItemCount = (stage: Stage): number =>
  (stage.groups ?? []).reduce((n, g) => n + g.items.length, 0);

/** Count of checkable items in a group. */
export const groupItemCount = (group: SettingGroup): number => group.items.length;

/** Everything the UI derives from a single camera's guide, computed once. */
export interface DerivedGuide {
  guide: GuideContent;
  stages: Stage[];
  allItems: FlatItem[];
  totalItems: number;
  progressStages: Stage[];
  scenarioStages: Stage[];
  stageById: (id: string) => Stage | undefined;
  stageIndex: (id: string) => number;
}

/** Build the derived view for a guide (memoize per camera in the provider). */
export function deriveGuide(guide: GuideContent): DerivedGuide {
  const stages = guide.stages;
  const allItems: FlatItem[] = stages.flatMap((stage) =>
    (stage.groups ?? []).flatMap((group) =>
      group.items.map((item) => ({ item, stage, group })),
    ),
  );
  return {
    guide,
    stages,
    allItems,
    totalItems: allItems.length,
    progressStages: stages.filter((s) => (s.groups?.length ?? 0) > 0),
    scenarioStages: stages.filter((s) => s.kind === 'scenario'),
    stageById: (id) => stages.find((s) => s.id === id),
    stageIndex: (id) => stages.findIndex((s) => s.id === id),
  };
}
