import type { GuideContent, Item, Stage } from './types';

/* ============================================================================
   Runtime validator for a camera JSON.

   The TypeScript types are the schema; this is the runtime guard so a hand- or
   LLM-authored camera file fails LOUDLY with a useful message instead of
   crashing the UI somewhere deep. Kept intentionally lightweight: it checks
   shape and required fields, not every enum value.
   ============================================================================ */

class GuideError extends Error {}

function fail(where: string, msg: string): never {
  throw new GuideError(`${where}: ${msg}`);
}

const ITEM_KINDS = new Set(['setting', 'control', 'tile', 'save']);
const STAGE_KINDS = new Set([
  'intro',
  'settings',
  'scenario',
  'delivery',
  'cheatsheet',
]);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function checkItem(item: unknown, where: string): asserts item is Item {
  if (!isObj(item)) fail(where, 'item must be an object');
  if (typeof item.id !== 'string' || !item.id) fail(where, 'item.id is required');
  if (typeof item.name !== 'string' || !item.name)
    fail(`${where} (${item.id})`, 'item.name is required');
  if (typeof item.kind !== 'string' || !ITEM_KINDS.has(item.kind))
    fail(`${where} (${item.id})`, `item.kind must be one of ${[...ITEM_KINDS].join(', ')}`);
}

function checkStage(stage: unknown, where: string): asserts stage is Stage {
  if (!isObj(stage)) fail(where, 'stage must be an object');
  if (typeof stage.id !== 'string' || !stage.id) fail(where, 'stage.id is required');
  const tag = `stage "${stage.id}"`;
  if (typeof stage.title !== 'string') fail(tag, 'title is required');
  if (typeof stage.kind !== 'string' || !STAGE_KINDS.has(stage.kind))
    fail(tag, `kind must be one of ${[...STAGE_KINDS].join(', ')}`);

  if (stage.groups !== undefined) {
    if (!Array.isArray(stage.groups)) fail(tag, 'groups must be an array');
    stage.groups.forEach((group, gi) => {
      if (!isObj(group)) fail(`${tag} group[${gi}]`, 'group must be an object');
      if (typeof group.id !== 'string') fail(`${tag} group[${gi}]`, 'group.id is required');
      if (!isObj(group.gate) || typeof group.gate.id !== 'string')
        fail(`${tag} group "${group.id}"`, 'group.gate.id is required');
      if (!Array.isArray(group.gate.dials))
        fail(`${tag} group "${group.id}"`, 'gate.dials must be an array');
      if (!Array.isArray(group.items))
        fail(`${tag} group "${group.id}"`, 'group.items must be an array');
      group.items.forEach((it, ii) =>
        checkItem(it, `${tag} group "${group.id}" item[${ii}]`),
      );
    });
  }
}

/** Validate unknown JSON as a GuideContent. Throws GuideError on the first problem. */
export function validateGuide(data: unknown, source = 'camera'): GuideContent {
  if (!isObj(data)) fail(source, 'guide JSON must be an object');

  const cam = data.camera;
  if (!isObj(cam)) fail(source, 'missing "camera" identity block');
  for (const key of ['id', 'brand', 'model', 'name'] as const) {
    if (typeof cam[key] !== 'string' || !cam[key])
      fail(`${source} camera`, `camera.${key} is required`);
  }
  if (!/^[a-z0-9-]+$/.test(cam.id as string))
    fail(`${source} camera`, 'camera.id must be lowercase letters, numbers, and dashes');

  if (!isObj(data.meta)) fail(source, 'missing "meta" block');

  if (!Array.isArray(data.stages) || data.stages.length === 0)
    fail(source, 'stages must be a non-empty array');
  data.stages.forEach((s, i) => checkStage(s, `${source} stages[${i}]`));

  // Duplicate-id guards — these cause silent progress collisions.
  const ids = new Set<string>();
  for (const stage of data.stages as Stage[]) {
    for (const group of stage.groups ?? []) {
      for (const item of group.items) {
        if (ids.has(item.id))
          fail(source, `duplicate item id "${item.id}" — ids must be unique across the guide`);
        ids.add(item.id);
      }
    }
  }

  return data as unknown as GuideContent;
}
