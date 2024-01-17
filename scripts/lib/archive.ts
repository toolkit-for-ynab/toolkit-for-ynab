import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { BROWSER_NAMES } from './consts';
import type { BrowserName } from './consts';
import { EXTENSION_DIRECTORY, OUTPUT_DIRECTORY } from './paths';

export function withRequiredBrowserChoice(yargs: yargs.Argv): yargs.Argv<{ browser: BrowserName }> {
  return yargs.choices('browser', BROWSER_NAMES).demandOption('browser');
}

export function buildZipFilePath(zipFileNamePrefix: string, browser: string): string {
  const manifestPath = path.join(EXTENSION_DIRECTORY, 'manifest.json');
  const version = require(manifestPath).version;

  if (typeof version !== 'string') {
    throw new TypeError(`Invalid version: ${version}, from: ${manifestPath}`);
  }

  // It's nice to create zip files with the version number in the name
  const zipFile = path.join(OUTPUT_DIRECTORY, `${zipFileNamePrefix}-v${version}-${browser}.zip`);

  return zipFile;
}

export function createZipArchiveWriteStream(zipFileName: string): fs.WriteStream {
  // Create our zip file
  const output = fs.createWriteStream(zipFileName);

  output.on('close', () => {
    console.log('Archive successfully created.');
  });

  return output;
}

export function createDefaultArchiver(output: fs.WriteStream) {
  const archive = archiver('zip', { zlib: { level: 9 } });

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

  return archive;
}
