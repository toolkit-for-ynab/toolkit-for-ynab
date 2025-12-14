# Safari Extension for Toolkit for YNAB

This directory contains the macOS Safari Web Extension wrapper for Toolkit for YNAB.

## Prerequisites

- **macOS 14.0+** (Sonoma or later)
- **Xcode 15+** with Command Line Tools
- **XcodeGen** (for generating the Xcode project)
- **Node.js 18+** and **Yarn** (for building the web extension)

## Quick Start

### 1. Install XcodeGen (if not already installed)

```bash
brew install xcodegen
```

### 2. Build the Web Extension

From the repository root:

```bash
yarn install
yarn build:safari
```

This builds the extension to `dist/extension/`.

### 3. Copy Extension Resources

Copy the built extension into the Safari project:

```bash
cp -r dist/extension/* safari/Extension/Resources/
```

Or create a symlink for development:

```bash
rm -rf safari/Extension/Resources
ln -s ../../dist/extension safari/Extension/Resources
```

### 4. Generate the Xcode Project

```bash
cd safari
xcodegen generate
```

This creates `Toolkit for YNAB.xcodeproj`.

### 5. Open in Xcode

```bash
open "Toolkit for YNAB.xcodeproj"
```

### 6. Configure Signing

In Xcode:

1. Select the project in the navigator
2. Select each target (host app and extension)
3. Go to **Signing & Capabilities**
4. Select your **Team** from the dropdown
5. Ensure **Automatically manage signing** is checked

### 7. Build and Run

1. Select **My Mac** as the destination
2. Press **Cmd+R** to build and run
3. Safari will open and prompt you to enable the extension

## Project Structure

```
safari/
├── project.yml                    # XcodeGen configuration
├── HostApp/                       # macOS container app
│   ├── AppDelegate.swift          # App lifecycle
│   ├── ViewController.swift       # Main UI with extension status
│   ├── Main.storyboard            # UI layout
│   ├── Info.plist                 # App metadata
│   ├── HostApp.entitlements       # App sandbox permissions
│   └── Assets.xcassets/           # App icons
└── Extension/                     # Safari Web Extension
    ├── SafariWebExtensionHandler.swift  # Native message handler
    ├── Info.plist                 # Extension metadata
    ├── Extension.entitlements     # Extension permissions
    └── Resources/                 # Web extension files (from dist/)
```

## Bundle Identifiers

| Target    | Bundle ID                            |
| --------- | ------------------------------------ |
| Host App  | `com.toolkitforynab.macos`           |
| Extension | `com.toolkitforynab.macos.Extension` |

To use custom bundle IDs, edit `project.yml` and regenerate.

## Debugging

### Enable Safari Extension Development

1. Open Safari
2. Go to **Safari > Settings > Advanced**
3. Enable **Show features for web developers**
4. Go to **Developer** menu
5. Enable **Allow unsigned extensions**

### Inspect Extension

1. Open Safari Developer menu
2. Select **Web Extension Background Content**
3. Choose **Toolkit for YNAB**

### View Extension Logs

In Xcode:

- Use **Console.app** to view os_log messages
- Filter by "Toolkit for YNAB"

## Updating the Extension

When you modify the web extension code:

1. Rebuild: `yarn build:safari`
2. Copy resources: `cp -r dist/extension/* safari/Extension/Resources/`
3. In Xcode: **Product > Clean Build Folder** (Cmd+Shift+K)
4. Rebuild: **Product > Build** (Cmd+B)

## Distribution

For App Store distribution:

1. Archive the app in Xcode
2. Use **Organizer** to upload to App Store Connect
3. The app must be notarized for distribution outside the App Store

## Troubleshooting

### "Extension not found" error

- Ensure Resources folder contains the built extension files
- Check that `manifest.json` exists in Resources

### Signing errors

- Verify your Apple Developer Team is selected
- Check bundle identifiers are unique
- Ensure entitlements files exist

### Extension not loading in Safari

- Enable **Allow unsigned extensions** in Safari Developer menu
- Check Safari Extensions preferences
- Review Console.app for errors
