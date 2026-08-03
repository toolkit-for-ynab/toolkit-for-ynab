# Extension Architecture

## How the extension works

- The build produces `ynab-toolkit.js`, injected as a web-accessible resource
  so it runs in the page's own JS context — it has direct access to the
  page's global `window.YNAB` (Ember application namespace) and `$` (jQuery).
- Every feature (`src/extension/features/**`) extends `Feature`
  (`src/extension/features/feature.ts`) and implements lifecycle hooks:
  `constructor`, `willInvoke`, `shouldInvoke`, `invoke`, `observe`,
  `onRouteChanged`, `onBudgetChanged`, `destroy`, `injectCSS`. Full contract
  in [`building-features.md`](./building-features.md) — read it before
  writing or modifying a feature.
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

## Where things live

- `src/extension/features/<section>/<feature-name>/` — one directory per
  feature (`index.{js,ts}` + `settings.js` + optional `index.css`/tests).
  Sections: `accounts/`, `budget/`, `general/`, `reports/` (tweaks to
  YNAB's native reports), `toolkit-reports/` (fully Toolkit-authored
  reports).
- `src/extension/utils/` — shared helpers (`ember.ts`, `ynab.ts`, `date.ts`,
  `currency.ts`, ...). See [`ynab-internals.md`](./ynab-internals.md) for
  `ember.ts`/`ynab.ts` specifically.
- `src/extension/listeners/` — the `MutationObserver` (`observeListener.js`)
  and route-change listener that drive every feature's lifecycle.
- `src/types/ynab/` — reverse-engineered types for YNAB's internals.
