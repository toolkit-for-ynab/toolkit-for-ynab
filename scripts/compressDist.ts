#!/usr/bin/env ts-node

import yargs from 'yargs';
import {
  buildZipFilePath,
  createDefaultArchiver,
  createZipArchiveWriteStream,
  withRequiredBrowserChoice,
} from './lib/archive';
import { EXTENSION_DIRECTORY, assertExtensionDirectoryExists } from './lib/paths';

async function main() {
  assertExtensionDirectoryExists();

  const { browser } = await withRequiredBrowserChoice(yargs).parse();
  const zipFileName = buildZipFilePath('toolkit-for-ynab', browser);
  const output = createZipArchiveWriteStream(zipFileName);
  const archiver = createDefaultArchiver(output);

  archiver.directory(EXTENSION_DIRECTORY, false);
  archiver.finalize();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
