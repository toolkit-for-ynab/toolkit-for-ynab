#!/usr/bin/env ts-node

/**
 * Copies the built web extension from dist/extension to safari/Extension/Resources
 */

import fs from 'fs';
import path from 'path';
import { WORKSPACE_ROOT } from '../lib/paths';

const SOURCE_DIR = path.join(WORKSPACE_ROOT, 'dist', 'extension');
const TARGET_DIR = path.join(WORKSPACE_ROOT, 'safari', 'Extension', 'Resources');

function copyRecursive(src: string, dest: string): void {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      // Skip .gitkeep files
      if (entry === '.gitkeep') continue;

      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function removeRecursive(target: string): void {
  if (!fs.existsSync(target)) return;

  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(target);
    for (const entry of entries) {
      removeRecursive(path.join(target, entry));
    }
    fs.rmdirSync(target);
  } else {
    fs.unlinkSync(target);
  }
}

function cleanDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    // Preserve .gitkeep
    if (entry === '.gitkeep') continue;

    const entryPath = path.join(dir, entry);
    removeRecursive(entryPath);
  }
}

async function main(): Promise<void> {
  console.log('Copying Safari extension resources...');

  // Verify source exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory not found: ${SOURCE_DIR}`);
    console.error('Run "yarn build:safari" first to build the extension.');
    process.exit(1);
  }

  // Verify manifest.json exists in source
  const manifestPath = path.join(SOURCE_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: manifest.json not found in ${SOURCE_DIR}`);
    console.error('Run "yarn build:safari" first to build the extension.');
    process.exit(1);
  }

  // Clean target directory
  console.log(`Cleaning ${TARGET_DIR}...`);
  cleanDirectory(TARGET_DIR);

  // Copy files
  console.log(`Copying from ${SOURCE_DIR} to ${TARGET_DIR}...`);
  copyRecursive(SOURCE_DIR, TARGET_DIR);

  // Verify copy succeeded
  const targetManifest = path.join(TARGET_DIR, 'manifest.json');
  if (!fs.existsSync(targetManifest)) {
    console.error('Error: Copy failed - manifest.json not found in target');
    process.exit(1);
  }

  // Count files copied
  let fileCount = 0;
  function countFiles(dir: string): void {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const entryPath = path.join(dir, entry);
      const stat = fs.statSync(entryPath);
      if (stat.isDirectory()) {
        countFiles(entryPath);
      } else {
        fileCount++;
      }
    }
  }
  countFiles(TARGET_DIR);

  console.log(`Successfully copied ${fileCount} files to Safari extension resources.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
