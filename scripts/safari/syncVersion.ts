#!/usr/bin/env ts-node

/**
 * Syncs the version from package.json to Safari Info.plist files
 */

import fs from 'fs';
import path from 'path';
import { WORKSPACE_ROOT } from '../lib/paths';

const PACKAGE_JSON_PATH = path.join(WORKSPACE_ROOT, 'package.json');
const HOST_APP_PLIST = path.join(WORKSPACE_ROOT, 'safari', 'HostApp', 'Info.plist');
const EXTENSION_PLIST = path.join(WORKSPACE_ROOT, 'safari', 'Extension', 'Info.plist');
const PROJECT_YML = path.join(WORKSPACE_ROOT, 'safari', 'project.yml');

function updatePlistVersion(plistPath: string, version: string): void {
  if (!fs.existsSync(plistPath)) {
    console.warn(`Warning: ${plistPath} not found, skipping.`);
    return;
  }

  let content = fs.readFileSync(plistPath, 'utf-8');

  // Update CFBundleShortVersionString
  const versionRegex = /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*/;
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, `$1${version}`);
    console.log(`Updated CFBundleShortVersionString in ${path.basename(plistPath)}`);
  } else {
    console.warn(`Warning: CFBundleShortVersionString not found in ${path.basename(plistPath)}`);
  }

  fs.writeFileSync(plistPath, content);
}

function updateProjectYmlVersion(ymlPath: string, version: string): void {
  if (!fs.existsSync(ymlPath)) {
    console.warn(`Warning: ${ymlPath} not found, skipping.`);
    return;
  }

  let content = fs.readFileSync(ymlPath, 'utf-8');

  // Update MARKETING_VERSION
  const versionRegex = /(MARKETING_VERSION:\s*)[^\n]*/;
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, `$1${version}`);
    console.log(`Updated MARKETING_VERSION in project.yml`);
  } else {
    console.warn(`Warning: MARKETING_VERSION not found in project.yml`);
  }

  fs.writeFileSync(ymlPath, content);
}

async function main(): Promise<void> {
  console.log('Syncing version to Safari project...');

  // Read version from package.json
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.error(`Error: package.json not found at ${PACKAGE_JSON_PATH}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  const version = packageJson.version;

  if (!version) {
    console.error('Error: No version found in package.json');
    process.exit(1);
  }

  console.log(`Version from package.json: ${version}`);

  // Update Info.plist files
  updatePlistVersion(HOST_APP_PLIST, version);
  updatePlistVersion(EXTENSION_PLIST, version);

  // Update project.yml
  updateProjectYmlVersion(PROJECT_YML, version);

  console.log(`Version sync complete: ${version}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
