# Dialed In

An interactive, guided **camera setup co-pilot**. It turns a long, intimidating settings manual
into a step-by-step, checklist-driven experience you follow while physically holding the camera —
so you go from a box-fresh body to a fully configured one without drowning in menus.

It ships with two cameras and is built to grow: **anyone can add a new camera as a single drop-in
file**, no code changes required.

- **Sony A7 V (ILCE-7M5)** — landscape / nature / wildlife / astro / hybrid video, with eight
  recallable scenario presets and a physical-dial walkthrough before every group of settings.
- **GoPro HERO13 Black** — action / travel / POV, built around the GoPro's preset model with six
  custom-preset recipes.

> The killer detail: before every group of settings, the app tells you exactly which mode/dials to
> be in — with an animated graphic you acknowledge — so you're never lost between Still / Movie /
> S&Q or Video / Photo / Time Lapse.

## Features

- Progressive disclosure — settings reveal as you complete the previous group, never a wall of fields.
- Per-setting checkmarks, global + per-stage progress, and `localStorage` persistence (per camera).
- Each setting card shows the menu path, the recommended value, an expandable **why this**, a concrete
  example, and a valid alternative.
- 20 themes, full keyboard/mobile support, a reduced-motion toggle, and a printable cheat sheet.

## Run it locally

You need [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open the URL it prints (e.g. `http://localhost:5173/`). No backend, no accounts, no external
services — all content ships in the bundle, so it works fully offline once installed. The dev
server is exposed to your local network (`vite --host`), so you can follow along on your phone with
the camera in both hands — just open the **Network** URL it prints.

```bash
npm run build   # production build (also type-checks)
```

## Add a camera (no code required)

Every camera is one JSON file in [`src/content/cameras/`](src/content/cameras/). The app discovers,
validates, and lists it automatically. The schema and a ready-to-use LLM authoring prompt live in
[`src/content/cameras/README.md`](src/content/cameras/README.md) — feed it your camera's official
manual and it generates the file for you. Drop the file in, reload, and your camera appears in the
picker.

## Contributing

PRs that add cameras or improve content are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
Accuracy is the whole point: every setting should be verifiable against the camera's official manual.

## Tech

Vite · React · TypeScript · Tailwind CSS · Framer Motion · Zustand.

## License

[GPL-3.0](LICENSE). The camera manuals themselves are copyrighted by their manufacturers and are
**not** included in this repo.
