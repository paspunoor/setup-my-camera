# Contributing

Thanks for helping make this a better setup co-pilot! The most valuable contributions are **new
cameras** and **content fixes** — but accuracy is the whole point, so everything must be verifiable
against the camera's official manual.

## How the workflow works

This is a public repo and `main` is protected — you can't push to it directly. Instead:

1. **Fork** this repository to your own account.
2. **Create a branch** for your change (`git checkout -b add-canon-r5`).
3. Make your change and run the checks below.
4. **Open a Pull Request** against `main` of this repo.
5. A maintainer reviews it. PRs require an approving review before they can be merged, so expect
   some back-and-forth — please keep the discussion in the PR.

## Adding a camera

Every camera is a single JSON file in [`src/content/cameras/`](src/content/cameras/) — **no code
changes are needed** to add one.

1. Read [`src/content/cameras/README.md`](src/content/cameras/README.md). It documents the full
   schema and includes a ready-to-use LLM authoring prompt.
2. Feed that prompt + your camera's **official manual** to a capable LLM to generate the JSON, then
   **review every setting against the manual yourself** before submitting.
3. Drop the file in `src/content/cameras/`, run the app, and walk the whole guide to make sure it
   validates and reads well.
4. Exactly one camera should have `"default": true` — don't change which one without discussion.

### Accuracy rules (please read)

- Every menu path, value, and "factory default" must match the manual. Cite the manual when a value
  is non-obvious.
- Don't invent settings or specs. If a feature isn't in the manual, leave it out. (We've been burned
  by "it probably has X" — it usually doesn't.)
- Mark a setting movie-only / stills-only correctly — placing a movie-only setting in a stills
  context is a common mistake.

## Before you open a PR

```bash
npm install
npm run build   # type-checks AND builds — must pass
```

- Do **not** commit camera manuals (PDFs), `node_modules/`, or `dist/` — they're gitignored for a
  reason. The manufacturers own the manuals.
- Keep changes focused; one camera or one coherent fix per PR.

## Reporting issues

Open an issue with the camera, the setting, and a link/screenshot of the relevant manual page if a
value looks wrong.
