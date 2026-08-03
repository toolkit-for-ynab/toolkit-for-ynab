# Build / Test / Lint

- `yarn build:dev` / `yarn watch` — build into `dist/extension`; load
  unpacked via `chrome://extensions` (Developer Mode → Load unpacked). See
  [`testing.md`](./testing.md) for Chrome/Firefox specifics.
- `yarn test` — Jest, jsdom environment pre-seeded to look like
  `app.ynab.com` (`src/test/setup.js`). Feature tests typically
  `jest.mock('toolkit/extension/features/feature')` and
  `jest.spyOn(ynabUtils, 'someLookup')` to fake the Ember layer rather than
  standing up real Ember state.
- `yarn lint` / `yarn lint:fix` — ESLint.
- `yarn gen` — regenerates `src/core/settings/settings.ts`,
  `docs/feature-list.md`, and the feature index from each feature's
  `settings.js`. Run after adding/renaming a feature or changing its
  settings. (These generated files aren't committed from a fresh worktree —
  if Jest fails with "Could not locate module ... settings", run `yarn gen`
  first.)
- `yarn type-check` — `tsc --skipLibCheck`.
