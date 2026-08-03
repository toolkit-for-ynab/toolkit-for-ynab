# Working With YNAB's Internals

We ship a browser extension against `https://app.ynab.com` and **do not have
YNAB's source code**. YNAB is a closed-source Ember.js SPA that we do not
control and cannot see the source of. Everything this repo knows about its
internal services, DOM structure, and data shapes comes from manually poking
at the live running app, not from reading their code.

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

See also the `learn-ynab` skill (`.claude/skills/learn-ynab/`), which
operationalizes this workflow end-to-end in a browser.
