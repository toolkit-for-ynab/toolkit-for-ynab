# Toolkit for YNAB — Development Notes

A browser extension (Chrome/Firefox/Edge) that enhances the YNAB web app at
`https://app.ynab.com`. It's a content script injected into YNAB's page —
**we do not have YNAB's source code**. YNAB is a closed-source Ember.js SPA
we don't control, so everything this repo knows about its internal services,
DOM structure, and data shapes comes from manually poking at the live
running app, not from reading their code, and it can go stale without
warning. When touching anything that reaches into YNAB, verify it against
the live app rather than trusting what's written here — see
[`docs/ynab-internals.md`](./docs/ynab-internals.md).

## Where to look

- [`docs/architecture.md`](./docs/architecture.md) — how the extension is
  structured: the Feature lifecycle, the MutationObserver/route-change
  plumbing, where code lives.
- [`docs/building-features.md`](./docs/building-features.md) — the `Feature`
  class contract; read before writing or modifying a feature.
- [`docs/ynab-internals.md`](./docs/ynab-internals.md) — reaching into
  YNAB's live Ember app, the reverse-engineered types in `src/types/ynab/`,
  and how to investigate when something breaks. Operationalized by the
  `learn-ynab` skill (`.claude/skills/learn-ynab/`).
- [`docs/development.md`](./docs/development.md) — build/test/lint commands,
  code generation.
- [`docs/testing.md`](./docs/testing.md) — loading the built extension into
  a browser for manual testing.
- [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) — contribution
  process, including the PR template.
