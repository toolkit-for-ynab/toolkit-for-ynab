const fs = require('fs');
const path = require('path');
const yargs = require('yargs').argv;

const validOverrides = ['beta', 'development', 'ios'];
if (!validOverrides.includes(yargs.type)) {
  console.log(`Invalid OVERRIDE provided. Must be one of: [${validOverrides.join('|')}]`);
  process.exit(1);
}

const type = yargs.type;
const workspaceRoot = path.join(__dirname, '..');
const buildDirectory = path.join(workspaceRoot, 'dist', 'extension');
const manifestPath = path.join(buildDirectory, 'manifest.json');

const manifest = require(manifestPath);

if (yargs.type === 'ios') {
  delete manifest.host_permissions;
  delete manifest.browser_action;
}

const changes = require(path.join(workspaceRoot, 'src', `manifest.${type}.json`));

// Clobber any keys in the beta manifest across.
Object.assign(manifest, changes);

// If we're in a github action, append the build number to the version number.
if (process.env.GITHUB_RUN_NUMBER) {
  manifest.version += `.${process.env.GITHUB_RUN_NUMBER}`;
  console.log(`using version: ${manifest.version}`);
}

// Delete the old one.
fs.unlinkSync(manifestPath);

// And write our new one.
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`${type} manifest applied.`);
