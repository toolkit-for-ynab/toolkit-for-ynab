# macOS Safari Web Extension project setup

This repository only contains the WebExtension source; the macOS host app and Safari Web Extension Xcode project need to be created on a Mac. The steps below give you a ready-to-open Xcode project, assign bundle identifiers, add entitlements, and keep the host app metadata aligned with the WebExtension manifest.

## Prerequisites (on your Mac)
- Xcode 15 or later with the **Safari Web Extension Converter** (`xcrun safari-web-extension-converter`).
- An Apple Developer Team ID.
- The built extension assets. From the repo root run `yarn build:ios` (or `yarn build:production`) to produce `dist/extension`, which is what the converter ingests.

## 1) Create the Xcode project from the existing WebExtension
```bash
# From the repo root on macOS
yarn install
yarn build:ios
xcrun safari-web-extension-converter ./dist/extension \
  --app-name "Toolkit for YNAB" \
  --project-location ./macos \
  --bundle-identifier com.example.toolkit
```
- The converter creates `./macos/Toolkit for YNAB/Toolkit for YNAB.xcodeproj` with a **macOS host app** and a **Safari Web Extension** target.
- Use your own bundle root (e.g., `com.yourcompany.toolkit`). The extension target will be suffixed automatically (e.g., `.Extension`).

## 2) Set unique bundle identifiers
In Xcode **Targets**:
- **Host app**: set **Bundle Identifier** to something like `com.yourcompany.toolkit.macos`.
- **Safari Web Extension** target: set **Bundle Identifier** to `com.yourcompany.toolkit.extension` (it must differ from the host app).

## 3) Assign your Apple Developer Team
In Xcode **Signing & Capabilities** for both targets:
- Select your Apple ID under **Team**.
- Ensure **Automatically manage signing** is enabled so provisioning profiles are generated.

## 4) Add required entitlements
In the host app and extension **Signing & Capabilities** tabs, add:
- **App Sandbox** (host app): required for Mac App Store distribution.
- **Network** and **Outgoing Connections (Client)** inside the sandbox (host app) so the injected code can talk to YNAB.
- **Safari Web Extension** entitlement (extension target) is added by the converter; keep it enabled.
- If you use shared containers or app groups later, add them here for both targets with matching IDs.

## 5) Align Info.plist metadata with the WebExtension manifest
- Open `Toolkit for YNAB/Info.plist` (host app target) and set:
  - `CFBundleDisplayName` = `Toolkit for YNAB`
  - `CFBundleShortVersionString` = `3.19.0`
  - `CFBundleVersion` can start at `1` and increment per build.
- Keep these values in sync with `src/manifest.json` (`name` and `version`). After bumping the manifest version, update `CFBundleShortVersionString` to match.

## 6) Refresh the extension payload when code changes
When you update the WebExtension code:
1. Rebuild the extension bundle:
   ```bash
   yarn build:ios
   ```
2. Re-run the converter with the same flags to refresh the Xcode project’s `Resources` and scripts. If Xcode is open, close/reopen or let it re-index after regeneration.

## 7) Debugging tips for a first-time Safari extension setup
- In Xcode **Scheme** choose **My Mac** and run; Safari will prompt to enable the extension.
- Use **Develop > Web Extension Background Pages** in Safari to inspect the extension’s background and content scripts.
- If signing errors occur, re-check bundle identifiers, Team selection, and that entitlements match between Xcode targets and your provisioning profiles.

## 8) If you prefer a generator-driven project
You can use [XcodeGen](https://github.com/yonaskolb/XcodeGen) instead of keeping the `.xcodeproj` in Git. A minimal `project.yml` (placed in `macos/`) could look like:
```yaml
name: Toolkit for YNAB
options:
  bundleIdPrefix: com.yourcompany.toolkit
packages: {}
targets:
  Toolkit:
    type: application
    platform: macOS
    deploymentTarget: "14.0"
    bundleId: com.yourcompany.toolkit.macos
    info:
      path: Info.plist
      properties:
        CFBundleDisplayName: Toolkit for YNAB
        CFBundleShortVersionString: 3.19.0
        CFBundleVersion: "1"
    sources: [HostApp]
    entitlements: HostApp/HostApp.entitlements
    settings:
      base:
        DEVELOPMENT_TEAM: YOURTEAMID
  ToolkitExtension:
    type: safari-web-extension
    platform: macOS
    deploymentTarget: "14.0"
    bundleId: com.yourcompany.toolkit.extension
    info:
      path: Extension/Info.plist
    sources: [Extension]
    entitlements: Extension/Extension.entitlements
    settings:
      base:
        DEVELOPMENT_TEAM: YOURTEAMID
```
Run `xcodegen generate` to build the `.xcodeproj` locally, then open it in Xcode.

---
Following the steps above will give you a working macOS host app + Safari Web Extension project that mirrors this repo’s `src/manifest.json` metadata and is ready for signing with your Apple Developer account.
