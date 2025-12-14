# Safari WebExtension Compatibility Review

## Manifest review
- Current manifest uses Manifest V3 with a `background.service_worker` (`background/background.js`). Safari on macOS/iOS continues to rely on Manifest V2 packaging, so this configuration will not run there without a dedicated MV2 manifest (the project currently ships an iOS MV2 manifest).【F:src/manifest.json†L2-L53】
- Background update handling depends on `runtime.onUpdateAvailable` and `runtime.requestUpdateCheck`, which are Chrome-only and absent from Safari's WebExtension API surface; Safari manages updates through the App Store and does not expose an equivalent update-check API.【F:src/core/background/background.js†L21-L54】
- The action icon path points to `assets/images/icons/button.png`; Safari accepts `browser_action` entries in MV2 manifests (as shown in `manifest.ios.json`) but would ignore MV3 `action` entries, reinforcing the need for an MV2-specific manifest for Safari builds.【F:src/manifest.json†L47-L53】【F:src/manifest.ios.json†L14-L24】

**Suggested replacements/mitigations**
- Ship or generate a Safari-specific MV2 manifest (similar to `src/manifest.ios.json`) for Safari targets, replacing the service worker with a non-persistent background script.
- Remove or guard `runtime.requestUpdateCheck`/`onUpdateAvailable` behind a Chrome check (or feature-detect) and rely on Safari's store-driven update flow when those APIs are absent.
- Keep icon references aligned between MV3 and MV2 manifests so both share the same asset set.

## Background script/service worker inventory (`src/core/background/background.js`)
- Initializes Sentry and loads the "DisableToolkit" feature flag to set the toolbar icon variant during construction.【F:src/core/background/background.js†L16-L28】
- Registers listeners for extension messages, update-available notifications, and toolkit-disablement changes, then starts an hourly update check loop (Chrome-only).【F:src/core/background/background.js†L21-L54】
- Handles two message types: `storage` (exposes `localStorage` keys/values) and `error` (reports captured errors to Sentry).【F:src/core/background/background.js†L56-L93】
- Updates the toolbar icon via `browser.action`/`browserAction` depending on availability, selecting enabled vs. disabled imagery.【F:src/core/background/background.js†L112-L121】

## Icons referenced by the manifest
The manifest requests icons at 1024, 512, 256, 128, 100, 64, 48, 32, and 16 px. All corresponding PNGs exist under `src/assets/environment/production/images/icons` with matching dimensions (16 px supplied by `button.png`).【F:src/manifest.json†L21-L30】【f356bc†L26-L34】
