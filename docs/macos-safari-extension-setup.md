# Safari extension setup (slow, kid-gloves version)

These steps assume you have **zero** experience with Xcode or Safari extensions. Follow them in order on your **Mac**. I’ll say exactly where to click and where to type.

## Before you start
1. **Install Xcode 15 or newer** from the Mac App Store. Open it once so it finishes installing.
2. **Find your Apple Developer Team ID.**
   - Open **Xcode** > **Settings** > **Accounts**.
   - Sign in with your Apple ID (the one linked to your Developer account).
   - Click your team name; you’ll see a 10-character Team ID like `ABCDE12345`. Write it down.
3. **Open Terminal.**
   - Press **Command + Space**, type **Terminal**, press **Return**. You will type commands here.
4. **Get the project code on your Mac.**
   - In Terminal, type `cd` followed by a space, then drag your project folder into the Terminal window and press **Return**. Now Terminal is “inside” the project folder.

## Part 1 — Build the web extension files
You only do this when you change the web code. It prepares the files Xcode will wrap.

1. In Terminal, type each line below and press **Return** after each line. (Copy/paste is fine.)
   ```bash
   yarn install
   yarn build:ios
   ```
2. When the commands finish, a folder named `dist/extension` will exist. That folder is what Xcode will use.

## Part 2 — Create the Xcode project with Apple’s converter
This turns the web extension into a Mac app + Safari extension project.

1. In Terminal (still in the project folder), type the block below and press **Return** after the last line:
   ```bash
   xcrun safari-web-extension-converter ./dist/extension \
     --app-name "Toolkit for YNAB" \
     --project-location ./macos \
     --bundle-identifier com.yourcompany.toolkit
   ```
   - Change `com.yourcompany.toolkit` to your own base bundle ID if you want.
2. The converter creates a new folder: `macos/Toolkit for YNAB/`. Inside it is `Toolkit for YNAB.xcodeproj`.
3. Double-click `Toolkit for YNAB.xcodeproj` to open it in Xcode.

## Part 3 — Set signing so builds succeed
1. In Xcode’s left sidebar, under **PROJECT** > **Toolkit for YNAB**, click **Targets** and select **Toolkit for YNAB** (the app). Then click **Signing & Capabilities**.
2. Check **Automatically manage signing**.
3. Set **Team** to your Team (the one with the Team ID you wrote down).
4. Repeat steps 1–3 for the **Toolkit for YNAB Extension** target.

## Part 4 — Make bundle identifiers unique
1. Still in **Signing & Capabilities** for the app target, set **Bundle Identifier** to something like `com.yourcompany.toolkit.macos`.
2. Select the **Toolkit for YNAB Extension** target. Set its **Bundle Identifier** to `com.yourcompany.toolkit.extension`. The app and extension IDs must be different.

## Part 5 — Add required entitlements (permissions)
In Xcode’s **Signing & Capabilities** tab:
1. **App target (Toolkit for YNAB):**
   - Click **+ Capability**.
   - Add **App Sandbox**.
   - Under App Sandbox, turn on **Network** and **Outgoing Connections (Client)**.
2. **Extension target (Toolkit for YNAB Extension):**
   - The converter should already add **Safari Web Extension**. Make sure it stays there.
   - If you later use shared containers or app groups, add matching IDs here and in the app target.

## Part 6 — Match the app’s display name and version to the web manifest
1. In Xcode’s left sidebar, open `Toolkit for YNAB/Info.plist` (the one under the app target).
2. Set these keys:
   - `CFBundleDisplayName`: `Toolkit for YNAB` (this is the name shown to users).
   - `CFBundleShortVersionString`: match the `version` in `src/manifest.json` (for example `3.19.0`).
   - `CFBundleVersion`: start at `1` and increase it each time you build.
3. Whenever you bump the version in `src/manifest.json`, update `CFBundleShortVersionString` to the same value.

## Part 7 — Refresh the Xcode project after web changes
Whenever you change the web extension code:
1. In Terminal (project folder):
   ```bash
   yarn build:ios
   ```
2. Re-run the converter command from Part 2 (same flags). If Xcode was open, close and reopen the project so it reloads the new files.

## Part 8 — Run and debug
1. In Xcode’s toolbar, make sure the scheme is **Toolkit for YNAB** and the destination is **My Mac**.
2. Press **Command + R** to run. Safari will open and ask to enable the extension—follow the prompts.
3. To inspect the extension: in Safari, go to **Develop > Web Extension Background Pages** and pick the extension. You can view logs and console output there.

## Quick checklist (copy/paste and tick off)
- [ ] Xcode installed and Apple ID added; Team ID noted.
- [ ] Ran `yarn install` and `yarn build:ios` in Terminal.
- [ ] Ran `xcrun safari-web-extension-converter ...` in Terminal to create `macos/Toolkit for YNAB.xcodeproj`.
- [ ] Opened the project in Xcode.
- [ ] Set **Team** and **Automatically manage signing** for **both targets**.
- [ ] Set bundle IDs: app = `...macos`, extension = `...extension`.
- [ ] Added entitlements: App Sandbox + Network/Outgoing (app); Safari Web Extension (extension).
- [ ] `Info.plist` display name and version match `src/manifest.json`.
- [ ] Rebuilt (`yarn build:ios`) and reran converter after any web changes.
- [ ] Ran the app (My Mac) and enabled the extension in Safari.

If any step fails, check bundle IDs, Team selection, and entitlements—they cause most errors. When stuck, rerun the converter to regenerate the project and reopen it in Xcode.
