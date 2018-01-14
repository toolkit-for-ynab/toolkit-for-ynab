const fs = require('fs');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');
const extensionDirectory = path.join(workspaceRoot, 'dist', 'extension');
const manifestPath = path.join(extensionDirectory, 'manifest.json');

const manifest = require(manifestPath);
const changes = require(path.join(workspaceRoot, 'src', 'manifest.beta.json'));

// Clobber any keys in the beta manifest across.
Object.assign(manifest, changes);

// Delete the old one.
fs.unlinkSync(manifestPath);

// And write our new one.
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Beta manifest applied.');
