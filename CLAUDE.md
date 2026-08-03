# Toolkit for YNAB — Development Notes

## What this project is

A browser extension (Chrome/Firefox/Edge) that enhances the YNAB web app at
`https://app.ynab.com`. It is a content script injected into YNAB's page —
**we do not have YNAB's source code**. YNAB is a closed-source Ember.js SPA
that we do not control and cannot see the source of. Everything we know about
its internal services, DOM structure, and data shapes comes from manually
poking at the live running app, not from reading their code.

## The golden rule: verify against the live app, don't trust memory

YNAB can and does change internal service/property names, DOM class names,
and Ember service shapes without warning. Nothing here is a stable contract —
it's what someone observed at some point. When a feature crashes with
something like `Cannot read properties of undefined (reading 'find')` deep in
a Toolkit feature, the near-universal cause is: an assumption about YNAB's
internal shape (a property that always existed on a service, a route that a
feature assumed it was always running on) is no longer true. See the
`ShowCategoryBalance` fix as a reference case: it called
`getRegisterGridService().visibleTransactionDisplayItems.find(...)` without
checking it was on the accounts route or guarding for the service/collection
being undefined — every sibling feature that touches the register grid
service (`RowSplitMonths`, `ResetColumnWidths`, ...) gates on
`isCurrentRouteAccountsPage()` first; this one didn't.

Before trusting a property/method documented anywhere in this repo
(including `src/types/ynab/**`), verify it still exists live. Use the
`learn-ynab` skill (`.claude/skills/learn-ynab/`) to do that.

## How the extension works

- The build produces `ynab-toolkit.js`, injected as a web-accessible resource
  so it runs in the page's own JS context — it has direct access to the
  page's global `window.YNAB` (Ember application namespace) and `$` (jQuery).
- Every feature (`src/extension/features/**`) extends `Feature`
  (`src/extension/features/feature.ts`) and implements lifecycle hooks:
  `constructor`, `willInvoke`, `shouldInvoke`, `invoke`, `observe`,
  `onRouteChanged`, `onBudgetChanged`, `destroy`, `injectCSS`. Full contract
  in `docs/building-features.md` — read it before writing or modifying a
  feature.
- DOM changes are watched by a single global `MutationObserver`
  (`src/extension/listeners/observeListener.js`) that calls every enabled
  feature's `observe(changedNodes)` on every relevant mutation.
  **`observe()` is not automatically gated by `shouldInvoke()`** — each
  feature must call `this.shouldInvoke()` (or otherwise check its own
  preconditions) inside `observe()` itself if it wants that guard. Forgetting
  this is a recurring bug source.
- Route changes are detected via Ember observers on `currentRouteName`,
  `budgetVersionId`, `selectedAccountId`, `monthString`, surfaced through
  `onRouteChanged(currentRoute)`.

## Reaching into YNAB's live Ember app

- `src/extension/utils/ember.ts` is the bridge into YNAB's app instance:
  `__ynabapp__ = YNAB.NAMESPACES[0]`. `containerLookup`, `serviceLookup`,
  `controllerLookup`, `componentLookup`, `factoryLookup` all resolve through
  `__ynabapp__.__container__` (Ember's DI container).
- `src/extension/utils/ynab.ts` wraps the common lookups:
  `getBudgetService()`, `getRegisterGridService()`, `getAccountsService()`,
  `getModalService()`, `getApplicationService()`, `getRouter()`,
  `isCurrentRouteAccountsPage()` / `isCurrentRouteBudgetPage()` /
  `isCurrentRouteReportPage()`, etc.
- `src/types/ynab/**` holds hand-maintained, reverse-engineered TypeScript
  types for YNAB's internal services/models (budget service, register grid
  service, transaction/sub-category/payee collections, Ember view registry,
  window globals...). These are best-effort documentation of what someone
  found live at some point — not official types. Treat them as a starting
  hypothesis, not ground truth.

## We don't have YNAB's source — how to investigate

1. Reproduce the scenario live at `app.ynab.com` (the `claude-in-chrome`
   tools/skill drive this).
2. Read the console error carefully. Toolkit errors are wrapped with the
   feature name/setting/function
   (`src/core/common/errors/with-toolkit-error.ts`). A stack frame pointing
   into `chrome-extension://.../ynab-toolkit.js` is _our_ compiled bundle; a
   frame pointing into YNAB's own hashed `vendor.*.js` / `ynab_web` bundle is
   _their_ code (unminified source isn't available to us — don't try to read
   it, talk to the live app instead).
3. Inspect YNAB's live state directly instead of guessing from a minified
   stack trace:
   - Run JS against `window.YNAB.NAMESPACES[0].__container__` in the page
     console, e.g. `Object.keys(YNAB.NAMESPACES[0].__container__.cache)` to
     list already-instantiated services/controllers, or
     `YNAB.NAMESPACES[0].__container__.lookup('service:registerGrid')` to
     inspect one service's live shape and confirm a property still exists.
   - Check the Network tab for what YNAB's API actually returns on a given
     page — useful for confirming data shapes independent of Ember internals.
   - Inspect the DOM for the current class names a feature's `observe()`
     keys off of; these shift on YNAB redesigns.
4. Update `src/types/ynab/**` to match what you actually found live, and add
   `?.`/existence guards in feature code accordingly — every reach into
   YNAB's internals should assume the property might be missing or renamed,
   because it eventually will be.

## Build / test / lint

- `yarn build:dev` / `yarn watch` — build into `dist/extension`; load
  unpacked via `chrome://extensions` (Developer Mode → Load unpacked). See
  `docs/testing.md` for Chrome/Firefox specifics.
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

## Where things live

- `src/extension/features/<section>/<feature-name>/` — one directory per
  feature (`index.{js,ts}` + `settings.js` + optional `index.css`/tests).
  Sections: `accounts/`, `budget/`, `general/`, `reports/` (tweaks to
  YNAB's native reports), `toolkit-reports/` (fully Toolkit-authored
  reports).
- `src/extension/utils/` — shared helpers (`ember.ts`, `ynab.ts`, `date.ts`,
  `currency.ts`, ...).
- `src/extension/listeners/` — the `MutationObserver` (`observeListener.js`)
  and route-change listener that drive every feature's lifecycle.
- `src/types/ynab/` — reverse-engineered types for YNAB's internals.
- `docs/building-features.md` — the Feature lifecycle contract.
- `docs/testing.md` — loading the built extension into a browser to test
  manually.

## Opening pull requests

Read `.github/PULL_REQUEST_TEMPLATE.md` and follow it — `gh pr create` does
not apply the template automatically when a body is passed explicitly, so
fill in its actual sections yourself (GitHub issue reference if applicable,
explanation of the bugfix/feature/modification and why, screenshots/video
for anything visual or feature-affecting) rather than substituting your own
free-form summary format.
