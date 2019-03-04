const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');
const extensionDirectory = path.join(workspaceRoot, 'dist', 'extension');
const outputDirectory = path.join(workspaceRoot, 'dist');

if (!fs.existsSync(extensionDirectory)) {
  console.error(
    "The dist/web-extension directory doesn't exist yet. Run `yarn build` before running this script."
  );
  process.exit(1);
}

// It's nice to create zip files with the version number in the name
const version = require(path.join(extensionDirectory, 'manifest.json')).version;
const zipFile = path.join(outputDirectory, `toolkit-for-ynab-source-v${version}.zip`);

// Create our zip file
const output = fs.createWriteStream(zipFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('Archive sucessfully created.');
});

archive.on('warning', error => {
  if (error.code === 'ENOENT') {
    console.warn('Warning while archiving: ', error);
  } else {
    throw error;
  }
});

archive.pipe(output);
archive.on('error', error => {
  throw error;
});

// append everything except for dist/, putting all contents at the root of archive
const files = fs.readdirSync(workspaceRoot);

for (const file of files) {
  if (file !== '.DS_Store' && file !== '.git' && file !== 'dist' && file !== 'node_modules') {
    const stats = fs.statSync(file);

    if (stats.isDirectory()) {
      archive.directory(file);
    } else {
      archive.file(file);
    }
  }
}

archive.finalize();
