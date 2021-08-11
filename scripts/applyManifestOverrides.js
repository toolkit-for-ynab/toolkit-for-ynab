const fs = require('fs');
const path = require('path');
const yargs = require('yargs').argv;

const validEnvironments = ['beta', 'development'];
if (!validEnvironments.includes(yargs.env)) {
  console.log(`Invalid ENVIRONMENT provided. Must be one of: [${validEnvironments.join('|')}]`);
  process.exit(1);
}

const env = yargs.env;
const workspaceRoot = path.join(__dirname, '..');
const buildDirectory = path.join(workspaceRoot, 'dist', 'extension');
const manifestPath = path.join(buildDirectory, 'manifest.json');

const manifest = require(manifestPath);
const changes = require(path.join(workspaceRoot, 'src', `manifest.${env}.json`));

// Clobber any keys in the beta manifest across.
Object.assign(manifest, changes);

// If we're in a github action, append the build number to the version number.
if (process.env.GITHUB_RUN_ID) {
  manifest.version += `.${process.env.GITHUB_RUN_ID}`;
  console.log(`using version: ${manifest.version}`);
}

// Delete the old one.
fs.unlinkSync(manifestPath);

// And write our new one.
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`${env} manifest applied.`);
