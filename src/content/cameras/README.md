# Adding a camera

This app is a **platform**. Every camera is one self-contained JSON file in this
folder. To add a camera you do **not** touch any code:

1. Create `your-camera-id.json` here (e.g. `canon-r5.json`), following the schema
   below. Use the **authoring prompt** at the bottom to generate it from the
   camera's official manual.
2. Save it. The registry (`../registry.ts`) discovers every `*.json` in this
   folder at build time, validates it (`../validate.ts`), and adds it to the
   camera switcher automatically.
3. That's it. Reload — your camera appears in the header's camera picker, with
   its own independent progress.

Exactly one camera should have `"default": true` (it loads on first visit).
`sony-a7v.json` is the reference implementation — read it alongside this doc.

The TypeScript types in [`../types.ts`](../types.ts) are the canonical schema.
If the JSON is malformed, the registry **skips it and logs the reason** in the
browser console instead of crashing the app.

---

## Schema (summary)

```jsonc
{
  "camera": {
    "id": "sony-a7v",          // unique, lowercase letters/numbers/dashes — also the progress key
    "brand": "Sony",
    "model": "ILCE-7M5",        // model code on the body
    "name": "Sony A7 V",        // friendly display name
    "default": true             // OPTIONAL — exactly one camera total should set this
  },
  "meta": {
    "body": "Sony A7 V",
    "model": "ILCE-7M5",
    "firmware": "Help Guide · 2540",
    "helpGuide": "helpguide.sony.net/ilc/2540",
    "scope": "One-line description of who this preset set is tuned for.",
    "updated": "One line on provenance / how current it is."
  },
  "stages": [ /* ordered Stage objects — see below */ ]
}
```

### Stage

```jsonc
{
  "id": "global-stills",        // unique across the guide
  "label": "02",                // short rail label
  "title": "Global Stills Defaults",
  "subtitle": "Layer 2 · your “pick it up cold” stills",   // optional
  "blurb": "Shown at the top of the stage.",                // optional
  "icon": "still",              // key for <StageIcon>: compass cards still movie focus dial grid menu rocket ... (falls back gracefully)
  "kind": "settings",           // intro | settings | scenario | delivery | cheatsheet
  "groups": [ /* SettingGroup[] — for settings/scenario stages */ ],
  "blocks": [ /* RichBlock[] — for intro/delivery stages */ ],
  "scenario": { /* ScenarioMeta — for scenario stages only */ }
}
```

### SettingGroup — a dial-gated block of items

```jsonc
{
  "id": "gs-quality",
  "title": "Image quality & drive",
  "subtitle": "optional",
  "gate": {                     // the dial-alignment gate shown BEFORE the items unlock
    "id": "gs-quality-gate",
    "headline": "Set the dials for stills defaults",
    "detail": "optional longer line",
    "dials": [                  // one or more physical dials to align
      { "dial": "smq",  "position": "Still", "label": "Still / Movie / S&Q dial → Still" },
      { "dial": "mode", "position": "M",     "label": "Mode dial → M" }
    ],
    "saveTo": "MR1",            // optional — names the register this group writes to
    "note": "optional"
  },
  "items": [ /* Item[] */ ]
}
```

`dial` is `"mode"` or `"smq"`. `position` for `mode` is one of
`P A S M 1 2 3 Auto`; for `smq` one of `Still Movie S&Q`.

### Item — one checkable row (the heart of the guide)

```jsonc
{
  "id": "gs-2",                 // unique across the guide
  "kind": "setting",            // setting | control | tile | save
  "name": "RAW File Type",      // exact on-screen name
  "path": ["Shooting", "Image Quality/Rec", "Image Quality Settings", "RAW File Type"],
  "value": "Lossless Comp",     // the recommended value (emphasised in the UI)
  "why": "What this setting is and what it actually does, in plain English.",
  "example": "One concrete moment where this setting visibly matters.",
  "alt": "A genuinely valid alternative value AND why someone would choose it.",
  "isDefault": false,           // true ONLY if `value` == the camera's factory default → shows a DEFAULT badge
  "note": "optional extra field note"
}
```

**Item kinds:**
- `setting` — a menu setting (`name` · `path` · `value` · `why`/`example`/`alt`).
- `control` — a custom button/dial assignment (`name` = the control, `value` = the assignment).
- `tile` — a lightweight Fn-menu / My-Menu chip (`name` only).
- `save` — a "save this preset to MRx / Mx" confirmation step.

**The two badge fields (important — they're what makes the guide feel trustworthy):**
- `isDefault: true` → renders a **DEFAULT** badge. Set it only when your
  recommended `value` is exactly the factory default, so the user knows there's
  nothing to change. Be accurate: check the manual's default tables.
- `alt` present → renders an **ALT** badge and an "alternatives" panel. Always
  explain *when/why* the alternative is the better pick, not just what it is.

---

## Authoring prompt

Paste the following into a capable LLM, attach the camera's **official manual**
(PDF or extracted text), and it will produce a valid camera JSON. Review the
output against the manual before shipping — accuracy is the whole point.

> You are a camera-setup expert and technical writer. Produce a SINGLE JSON file
> describing a guided, checklist-driven setup for the **<BRAND MODEL>** camera,
> conforming exactly to the schema described below. I am attaching the camera's
> official manual — treat it as the source of truth for every menu name, menu
> path, selectable option, and **factory default**. Do not invent settings or
> paths; if you cannot confirm something in the manual, leave it out.
>
> Audience: **<DESCRIBE THE TARGET USER — e.g. a landscape + wildlife hobbyist
> who also shoots video>**. Recommended values must suit that user, but every
> recommendation must be a real option the manual lists.
>
> Structure the guide in this order of stages (adapt names to the camera):
> 1. `intro` (kind: intro) — a short mental model, using `blocks`.
> 2. One-time `housekeeping` (region/date, cards, file naming, color, power).
> 3. `global-stills` defaults, `global-video` defaults.
> 4. `autofocus` defaults.
> 5. `custom-buttons` and `fn-menu` (kind: settings) — use `control`/`tile` items.
> 6. A `my-menu` stage.
> 7. 6–8 `scenario` stages (kind: scenario, each with a `scenario` block and a
>    final `save` item writing to a register/memory slot).
> 8. A `delivery` reference stage and a `cheatsheet` stage.
>
> For EVERY `setting` item provide: exact `name`, exact `path` (array of menu
> segments), recommended `value`, a 2–3 sentence plain-English `why` (what it is
> AND what it does), a concrete one-line `example`, and — when a reasonable
> alternative exists — an `alt` that says which alternative and WHY someone would
> pick it. Set `"isDefault": true` ONLY when your recommended `value` equals the
> manual's stated factory default.
>
> Before each settings group, define a `gate` telling the user which physical
> dial(s) to set (`mode` and/or `smq`) so the on-screen menus match.
>
> Give every stage/group/item a unique, stable `id`. Output ONLY the JSON —
> no prose, no markdown fences — matching the schema in
> `src/content/cameras/README.md`. Use `sony-a7v.json` as a structural example.

After generating, drop the file in this folder and reload the app.
