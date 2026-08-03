---
name: learn-ynab
description: Explore the live YNAB web app in Chrome (budget/accounts/reports pages) to learn its Ember services, DOM structure, and data shapes — since we don't have YNAB's source code and must verify everything against the running app. Use when asked to "learn ynab", investigate a YNAB internal/service/property, find what methods are callable on a given page, debug a "Cannot read properties of undefined" style Toolkit crash, or verify/update the reverse-engineered types in src/types/ynab.
---

# Learn YNAB

Toolkit for YNAB is a browser extension with no access to YNAB's source. Every
fact this repo has about YNAB's internals (`src/extension/utils/ember.ts`,
`src/extension/utils/ynab.ts`, `src/types/ynab/**`) was learned by poking at
the live app in a browser. This skill drives that same process: open the real
app, navigate to the page in question, and interrogate the running Ember
application to find out what's actually there right now.

Read `CLAUDE.md` at the repo root first if you haven't already — it covers
the extension architecture (`Feature` lifecycle, `observe()`/`shouldInvoke()`,
the container-lookup bridge) this skill assumes.

## Before you start

- Load the `claude-in-chrome` skill and its tools before touching any
  `mcp__claude-in-chrome__*` tool (`ToolSearch` with
  `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__read_network_requests,mcp__claude-in-chrome__read_console_messages`).
- This drives the user's **real, logged-in YNAB account with their real
  financial data**. Stay read-only: run inspection snippets, don't submit
  forms, don't click destructive buttons (delete/reconcile/approve), and
  don't trigger `alert`/`confirm`/`prompt` dialogs (they block the extension
  — see the `claude-in-chrome` skill's dialog guidance). Treat anything you
  read (balances, payee names, memos) as sensitive; don't paste it into
  artifacts or anywhere outside this conversation.
- Check `mcp__claude-in-chrome__tabs_context_mcp` first — reuse an existing
  `app.ynab.com` tab if the user already has one open and logged in, rather
  than opening a new one and forcing a fresh login.

## 1. Get to the right page

YNAB's routes (confirmed from this repo's own tests/utils, not guessed):

- Budget: `https://app.ynab.com/<budget-id>/budget[/<YYYY-MM>]`
- Accounts: `https://app.ynab.com/<budget-id>/accounts[/<account-id>]`
- Reports: `https://app.ynab.com/<budget-id>/reports/<report>` (native) or
  `https://app.ynab.com/<budget-id>/budget#toolkit-reports[/<tab>]` (Toolkit's
  own reports — see `src/extension/features/toolkit-reports/README.md`)

If you don't know the user's `<budget-id>`, navigate to
`https://app.ynab.com/` and let YNAB redirect, or read it off the current
tab's URL via `tabs_context_mcp`.

## 2. Interrogate the live Ember app

Use `mcp__claude-in-chrome__javascript_tool` to run snippets in the page's
own context (same access our injected `ynab-toolkit.js` bundle has). Useful
starting points, mirroring `src/extension/utils/ember.ts`:

```js
// Root Ember application instance (== __ynabapp__ in ember.ts)
const app = window.YNAB.NAMESPACES[0];

// List every already-instantiated container entry (services, controllers,
// components currently in use on this page) — great for discovering what
// exists without guessing a name first.
Object.keys(app.__container__.cache);

// Look up one service and inspect its actual current shape.
const registerGrid = app.__container__.lookup('service:registerGrid');
Object.keys(registerGrid);

// Router / current route, mirrors getRouter()/getCurrentRouteName()
app.__container__.lookup('router:main').currentRouteName;

// YNAB's own constants/utilities global (used throughout src/extension/utils/ynab.ts)
window.ynab.constants;
window.ynab.utilities;
```

If a lookup throws (service not yet instantiated for this route), that's
itself useful information — it means code shouldn't assume that service is
present without navigating to the page that creates it first, same lesson as
the `ShowCategoryBalance` bug (see `CLAUDE.md`).

To find the DOM classes a feature's `observe()` should key off of, use
`read_page` or the `javascript_tool` to inspect `element.className` on the
relevant rows/cells directly, rather than trusting an existing feature's
hardcoded selector — YNAB's markup shifts across redesigns.

To understand a data shape (e.g. what a category calculation object looks
like), `read_network_requests` on the relevant XHR/fetch call is often more
reliable than digging through Ember internals — it's YNAB's actual wire
format for that page.

## 3. Cross-check against what this repo already claims

Compare what you found against:

- `src/extension/utils/ember.ts` / `src/extension/utils/ynab.ts` — the
  wrapper functions this repo already uses.
- `src/types/ynab/**` — the hand-maintained type hypotheses. Search for the
  service/model name you just inspected (e.g.
  `src/types/ynab/services/YNABRegisterGridService.d.ts`).

If what you found live disagrees with a type or wrapper function, that's the
actual bug/gap — fix the type or add the missing guard, don't just patch the
symptom in the one feature that happened to crash.

## 4. Leave a trail

If you added or corrected a type in `src/types/ynab/**` based on what you
found, that's the durable record — prefer updating the type over writing a
one-off note. Only write a scratch note (in the scratchpad directory) if the
finding doesn't map cleanly onto an existing type file and isn't yet worth
committing as one.
