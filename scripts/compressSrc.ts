#!/usr/bin/env ts-node

import fs from 'fs';
import yargs from 'yargs';
import {
  withRequiredBrowserChoice,
  buildZipFilePath,
  createZipArchiveWriteStream,
  createDefaultArchiver,
} from './lib/archive';
import { WORKSPACE_ROOT, assertExtensionDirectoryExists } from './lib/paths';

async function main() {
  assertExtensionDirectoryExists();

  const { browser } = await withRequiredBrowserChoice(yargs).parse();
  const zipFileName = buildZipFilePath('toolkit-for-ynab-source', browser);
  const output = createZipArchiveWriteStream(zipFileName);
  const archiver = createDefaultArchiver(output);

  // Append everything except for ignored dirs, putting all contents at
  // the root of the archive
  const ignoredDirs = new Set(['.DS_Store', '.git', 'dist', 'node_modules']);
  const files = fs.readdirSync(WORKSPACE_ROOT);

  for (const file of files.filter((file) => !ignoredDirs.has(file))) {
    const stats = fs.statSync(file);

    // Source and destination are given the same value
    if (stats.isDirectory()) {
      archiver.directory(file, file);
    } else {
      archiver.file(file, { name: file });
    }
  }

  archiver.finalize();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
