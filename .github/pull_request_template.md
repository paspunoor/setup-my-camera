<!-- Thanks for contributing! Fill this out so review is quick. -->

## What does this PR do?

<!-- One or two sentences. e.g. "Adds the Canon EOS R5 guide" or "Fixes the RAW File Type default for the A7 V". -->

## Type of change

- [ ] New camera (a JSON file in `src/content/cameras/`)
- [ ] Content fix / improvement to an existing camera
- [ ] App code (UI, components, schema)
- [ ] Docs / other

## Accuracy checklist (content PRs)

> Accuracy is the whole point — everything must be verifiable against the camera's **official manual**.

- [ ] Every menu path, value, and "factory default" matches the manual.
- [ ] No invented settings or specs — if it's not in the manual, it's not here.
- [ ] Each setting is in the correct stills-vs-movie context.
- [ ] I cited the manual (page/section) for any non-obvious value, in the PR or a comment.
- [ ] For a new camera: exactly one camera has `"default": true` (and I didn't change which existing one is default).

## Verification

- [ ] `npm run build` passes locally (type-checks + builds).
- [ ] I walked the affected guide in the app and it reads/validates correctly.
- [ ] No manuals (PDFs), `node_modules/`, or `dist/` are committed.

## Notes for the reviewer

<!-- Anything you're unsure about, sources, screenshots, etc. -->
