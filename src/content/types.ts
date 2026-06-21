/* ============================================================================
   Content schema for the Sony A7 V (ILCE-7M5) setup co-pilot.
   Presentation never hard-codes copy — everything renders from this shape.
   ============================================================================ */

/** How trustworthy a menu path / value is, carried honestly from the guide. */
export type Verification =
  | 'verified' //  confirmed against Sony's A7 V Help Guide
  | 'inferred' //  [sibling-inferred] — identical A7 IV / A7R V path, may differ
  | 'corrected' // the guide corrects a common assumption / spec myth
  | 'unverified'; // explicitly flagged as not yet confirmed (e.g. star-eater)

/** Which checkable kind an item is — drives how the card renders. */
export type ItemKind =
  | 'setting' //  a menu setting: name · path · value · why
  | 'control' //  a custom-key assignment: control · assignment · why
  | 'tile' //     an Fn-menu tile or My-Menu entry (lighter card)
  | 'save'; //    the "save this preset to MRx / Mx" confirmation step

export interface Item {
  id: string;
  kind: ItemKind;
  /** On-screen setting name, the control name, or the tile label. */
  name: string;
  /** Menu path segments, rendered as a breadcrumb. Optional for tiles/controls. */
  path?: string[];
  /** Recommended value — visually emphasised. For controls: the assignment. */
  value?: string;
  /** The single most valuable thing: what it does & why this value. */
  why?: string;
  /** A concrete, one-line example of when this setting visibly matters. */
  example?: string;
  /** Alternative / tradeoff the guide calls out. Presence drives the ALT badge. */
  alt?: string;
  /** Extra field note attached to a specific item. */
  note?: string;
  /**
   * True when the recommended value equals the camera's factory default —
   * surfaced as a DEFAULT badge so the user knows nothing needs changing.
   */
  isDefault?: boolean;
  verification?: Verification;
  /** A short "myth vs measured" correction surfaced inline. */
  correction?: string;
}

/** One physical dial the user must set, shown as an animated graphic. */
export interface DialInstruction {
  /** Which dial illustration to draw. */
  dial: 'mode' | 'smq';
  /** Target position key, e.g. 'M' | 'A' | 'MR1' | 'Still' | 'Movie' | 'S&Q'. */
  position: string;
  /** Human label for the instruction line. */
  label: string;
}

/** The gate shown BEFORE a group's settings unlock. The killer interaction. */
export interface DialGate {
  id: string;
  headline: string;
  detail?: string;
  dials: DialInstruction[];
  /** If this group will be saved to a register at the end, name it here. */
  saveTo?: string;
  note?: string;
}

export interface SettingGroup {
  id: string;
  title: string;
  subtitle?: string;
  gate: DialGate;
  items: Item[];
}

export type StageKind =
  | 'intro'
  | 'settings'
  | 'scenario'
  | 'delivery'
  | 'cheatsheet';

/** Metadata for the 8 scenario presets. */
export interface ScenarioMeta {
  /** Storage slot label, e.g. 'MR1', 'M1', 'S&Q', or a GoPro preset name. */
  slot: string;
  storage: 'in-body' | 'card' | 'dial' | 'preset';
  /** One-line "in the field" note. */
  fieldNote?: string;
  lens?: string;
  depth?: string;
  /** A short evocative summary line. */
  tagline: string;
}

/** Free-form rich blocks for intro / delivery reference stages. */
export interface RichBlock {
  heading: string;
  /** Paragraph or list lines. Lines starting with '•' render as bullets. */
  body: string[];
}

export interface Stage {
  id: string;
  /** Display number in the rail (intro/cheatsheet may be special). */
  label: string;
  title: string;
  subtitle?: string;
  /** Short evocative blurb shown at the top of the stage. */
  blurb?: string;
  icon: string; // a key consumed by <StageIcon/>
  kind: StageKind;
  /** Hue (0-360) used to tint the stage accent for variety. */
  hue?: number;
  groups?: SettingGroup[];
  scenario?: ScenarioMeta;
  /** Reference content for intro / delivery stages. */
  blocks?: RichBlock[];
  /** Headline spec chips shown on the intro stage. */
  stats?: { value: string; label: string }[];
}

/**
 * Camera identity for the registry + picker. Every camera JSON in
 * src/content/cameras/ must carry this block so the app can list it,
 * route progress, and pick a default — no code changes to add a camera.
 */
export interface CameraIdentity {
  /** Unique, URL-safe id, e.g. 'sony-a7v'. Also the progress-storage key. */
  id: string;
  /** Manufacturer, e.g. 'Sony'. */
  brand: string;
  /** Model code as printed on the body, e.g. 'ILCE-7M5'. */
  model: string;
  /** Friendly display name, e.g. 'Sony A7 V'. */
  name: string;
  /** Exactly one camera should set this true — it loads on first visit. */
  default?: boolean;
}

export interface GuideContent {
  camera: CameraIdentity;
  meta: {
    body: string;
    model: string;
    firmware: string;
    helpGuide: string;
    scope: string;
    updated: string;
  };
  stages: Stage[];
}
