#!/usr/bin/env ts-node

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { BROWSER_NAMES } from './consts';

async function main() {
  const { browser } = await yargs.choices('browser', BROWSER_NAMES).parse();
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
  const zipFile = path.join(outputDirectory, `toolkit-for-ynab-v${version}-${browser}.zip`);

  // Create our zip file
  const output = fs.createWriteStream(zipFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('Archive successfully created.');
  });

  archive.on('warning', (error) => {
    if (error.code === 'ENOENT') {
      console.warn('Warning while archiving: ', error);
    } else {
      throw error;
    }
  });

  archive.on('error', (error) => {
    throw error;
  });

  // append everything from dist/, putting its contents at the root of archive
  archive.pipe(output);
  archive.directory(extensionDirectory, false);
  archive.finalize();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
