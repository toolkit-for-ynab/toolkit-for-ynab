const fs = require('fs-extra');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');
const extensionDirectory = path.join(workspaceRoot, 'dist', 'extension');
const manifestPath = path.join(extensionDirectory, 'manifest.json');

const manifest = require(manifestPath);
const changes = require(path.join(workspaceRoot, 'src', 'manifest.beta.json'));

// Clobber any keys in the beta manifest across.
Object.assign(manifest, changes);

// If we're on Travis, we should append the build number to the version number.
if (process.env.TRAVIS_BUILD_NUMBER) {
  manifest.version += `.${process.env.TRAVIS_BUILD_NUMBER}`;
}

// Delete the old one.
fs.unlinkSync(manifestPath);

// And write our new one.
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Beta manifest applied.');

// Now let's deal with our images.
const imagesPath = path.join(extensionDirectory, 'assets', 'images');
const betaOverridesPath = path.join(imagesPath, 'beta-overrides');

fs.copySync(betaOverridesPath, imagesPath);

console.log('Beta images applied.');
