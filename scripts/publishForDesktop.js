const fs = require('fs');
const glob = require('glob');
const path = require('path');
const rimraf = require('rimraf');

const workspaceRoot = path.join(__dirname, '..');
const desktopUpdatesPath = path.join(
  workspaceRoot,
  '..',
  'toolkit-for-ynab-gh-pages',
  'desktop-updates'
);

// Clear out the directory and create it clean.
rimraf.sync(desktopUpdatesPath);
fs.mkdirSync(desktopUpdatesPath);

// Copy the extension over first.
const filesToCopy = glob.sync(path.join(workspaceRoot, 'dist/toolkit-for-ynab-v*.zip'));

if (filesToCopy.length !== 1) {
  throw new Error(`There must be precisely one zip file to copy. Found ${filesToCopy.length}!`);
}

fs.copyFileSync(filesToCopy[0], path.join(desktopUpdatesPath, 'toolkitforynab_desktop.zip'));

// And now we can copy over the manifest too.
fs.copyFileSync(
  path.join(workspaceRoot, 'dist', 'extension', 'manifest.json'),
  path.join(desktopUpdatesPath, 'manifest.json')
);
